import { prisma } from "@/lib/db";
import { EMPLOYEE_MASTER } from "@/lib/data/employee-mock";
import { INITIAL_TRAININGS } from "@/lib/data/training-mock";
import {
  isFlatTraining,
  selectionForTraining,
  type AddAttendeeResult,
  type Attendee,
  type Employee,
  type MoveAttendeeResult,
  type Training,
  type TrainingSelection,
} from "@/lib/training-schema";

const trainingInclude = {
  courses: {
    orderBy: { sortOrder: "asc" as const },
    include: {
      enrollments: {
        orderBy: { enrolledAt: "asc" as const },
        include: { employee: true },
      },
    },
  },
} as const;

function mapEnrollmentToAttendee(enrollment: {
  id: string;
  employee: {
    employeeNumber: string;
    name: string;
    department: string;
    departmentCode: string;
  };
}): Attendee {
  return {
    id: enrollment.id,
    employeeNumber: enrollment.employee.employeeNumber,
    name: enrollment.employee.name,
    department: enrollment.employee.department,
    departmentCode: enrollment.employee.departmentCode,
  };
}

function mapRowToTraining(row: {
  id: string;
  name: string;
  courses: Array<{
    id: string;
    name: string;
    date: string;
    location: string;
    enrollments: Array<{
      id: string;
      employee: {
        employeeNumber: string;
        name: string;
        department: string;
        departmentCode: string;
      };
    }>;
  }>;
}): Training {
  return {
    id: row.id,
    name: row.name,
    courses: row.courses.map((course) => ({
      id: course.id,
      name: course.name,
      date: course.date,
      location: course.location,
      attendees: course.enrollments.map(mapEnrollmentToAttendee),
    })),
  };
}

export async function fetchAllTrainings(): Promise<Training[]> {
  const rows = await prisma.training.findMany({
    include: trainingInclude,
    orderBy: { createdAt: "asc" },
  });
  return rows.map(mapRowToTraining);
}

export async function fetchAllEmployees(): Promise<Employee[]> {
  const rows = await prisma.employee.findMany({
    orderBy: { employeeNumber: "asc" },
  });
  return rows.map((e) => ({
    employeeNumber: e.employeeNumber,
    name: e.name,
    department: e.department,
    departmentCode: e.departmentCode,
  }));
}

export async function findEmployeeByNumber(
  employeeNumber: string,
): Promise<Employee | null> {
  const normalized = employeeNumber.trim().toUpperCase();
  const row = await prisma.employee.findUnique({
    where: { employeeNumber: normalized },
  });
  if (!row) return null;
  return {
    employeeNumber: row.employeeNumber,
    name: row.name,
    department: row.department,
    departmentCode: row.departmentCode,
  };
}

export async function ensureInitialData(): Promise<void> {
  const employeeCount = await prisma.employee.count();
  if (employeeCount === 0) {
    await prisma.employee.createMany({
      data: EMPLOYEE_MASTER.map((e) => ({
        employeeNumber: e.employeeNumber,
        name: e.name,
        department: e.department,
        departmentCode: e.departmentCode,
      })),
    });
  }

  const trainingCount = await prisma.training.count();
  if (trainingCount > 0) return;

  for (const training of INITIAL_TRAININGS) {
    await prisma.training.create({
      data: {
        id: training.id,
        name: training.name,
        courses: {
          create: training.courses.map((course, courseIndex) => ({
            id: course.id,
            name: course.name,
            date: course.date,
            location: course.location,
            sortOrder: courseIndex,
            enrollments: {
              create: course.attendees.map((attendee) => ({
                id: attendee.id,
                employeeNumber: attendee.employeeNumber,
              })),
            },
          })),
        },
      },
    });
  }
}

export async function createTraining(name: string): Promise<{
  trainingId: string;
  courseId: string;
}> {
  const trainingId = crypto.randomUUID();
  const courseId = crypto.randomUUID();

  await prisma.training.create({
    data: {
      id: trainingId,
      name,
      courses: {
        create: {
          id: courseId,
          name,
          sortOrder: 0,
        },
      },
    },
  });

  return { trainingId, courseId };
}

export async function addChildCourse(
  trainingId: string,
  name: string,
): Promise<TrainingSelection | null> {
  const training = await prisma.training.findUnique({
    where: { id: trainingId },
    include: { courses: { orderBy: { sortOrder: "asc" } } },
  });
  if (!training) return null;

  const mapped: Training = mapRowToTraining({
    ...training,
    courses: training.courses.map((c) => ({
      ...c,
      enrollments: [],
    })),
  });

  if (isFlatTraining(mapped)) {
    const existingCourseId = training.courses[0]!.id;
    await prisma.course.update({
      where: { id: existingCourseId },
      data: { name },
    });
    const stillFlat = name === training.name;
    return stillFlat
      ? { kind: "training", trainingId }
      : { kind: "course", trainingId, courseId: existingCourseId };
  }

  const courseId = crypto.randomUUID();
  await prisma.course.create({
    data: {
      id: courseId,
      trainingId,
      name,
      sortOrder: training.courses.length,
    },
  });

  return { kind: "course", trainingId, courseId };
}

export async function deleteTraining(trainingId: string): Promise<void> {
  await prisma.training.delete({ where: { id: trainingId } });
}

export async function deleteCourse(courseId: string): Promise<void> {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: { training: { include: { courses: true } } },
  });
  if (!course) return;

  if (course.training.courses.length <= 1) {
    await prisma.training.delete({ where: { id: course.trainingId } });
    return;
  }

  await prisma.course.delete({ where: { id: courseId } });
}

export async function updateCourseField(
  courseId: string,
  field: "date" | "location",
  value: string,
): Promise<void> {
  await prisma.course.update({
    where: { id: courseId },
    data: { [field]: value },
  });
}

export async function addEnrollment(
  courseId: string,
  employeeNumber: string,
): Promise<{ result: AddAttendeeResult; enrollmentId?: string }> {
  const normalized = employeeNumber.trim().toUpperCase();
  const employee = await prisma.employee.findUnique({
    where: { employeeNumber: normalized },
  });
  if (!employee) return { result: "not_found" };

  const existing = await prisma.courseEnrollment.findUnique({
    where: {
      courseId_employeeNumber: {
        courseId,
        employeeNumber: normalized,
      },
    },
  });
  if (existing) return { result: "duplicate" };

  const enrollment = await prisma.courseEnrollment.create({
    data: {
      courseId,
      employeeNumber: normalized,
    },
  });

  return { result: "ok", enrollmentId: enrollment.id };
}

export async function removeEnrollment(enrollmentId: string): Promise<void> {
  await prisma.courseEnrollment.delete({ where: { id: enrollmentId } });
}

export async function moveEnrollment(
  enrollmentId: string,
  fromCourseId: string,
  toCourseId: string,
): Promise<{
  result: MoveAttendeeResult;
  selection?: TrainingSelection;
}> {
  if (fromCourseId === toCourseId) return { result: "failed" };

  const enrollment = await prisma.courseEnrollment.findUnique({
    where: { id: enrollmentId },
  });
  if (!enrollment || enrollment.courseId !== fromCourseId) {
    return { result: "failed" };
  }

  const duplicate = await prisma.courseEnrollment.findUnique({
    where: {
      courseId_employeeNumber: {
        courseId: toCourseId,
        employeeNumber: enrollment.employeeNumber,
      },
    },
  });
  if (duplicate) return { result: "duplicate" };

  const targetCourse = await prisma.course.findUnique({
    where: { id: toCourseId },
  });
  if (!targetCourse) return { result: "failed" };

  await prisma.courseEnrollment.update({
    where: { id: enrollmentId },
    data: { courseId: toCourseId },
  });

  return {
    result: "ok",
    selection: {
      kind: "course",
      trainingId: targetCourse.trainingId,
      courseId: toCourseId,
    },
  };
}

export function defaultInitialSelection(
  trainings: Training[],
): TrainingSelection {
  const t3 = trainings.find((t) => t.id === "t3");
  const c4 = t3?.courses.find((c) => c.id === "c4");
  if (t3 && c4) {
    return { kind: "course", trainingId: t3.id, courseId: c4.id };
  }
  if (trainings[0]) return selectionForTraining(trainings[0]);
  return { kind: "none" };
}
