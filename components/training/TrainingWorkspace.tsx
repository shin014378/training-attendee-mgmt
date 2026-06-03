"use client";

import { useState, useCallback } from "react";

import {
  isFlatTraining,
  selectionForTraining,
  type AddAttendeeResult,
  type Attendee,
  type MoveAttendeeResult,
  type Training,
  type TrainingSelection,
} from "@/lib/training-schema";
import { INITIAL_TRAININGS } from "@/lib/data/training-mock";
import { findEmployee } from "@/lib/data/employee-mock";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TrainingPane } from "@/components/training/TrainingPane";
import { CourseInfoPane } from "@/components/training/CourseInfoPane";
import { AttendeeDetailPane } from "@/components/training/AttendeeDetailPane";
import { ReferenceFilePane } from "@/components/training/ReferenceFilePane";
import { trainingBottomBandClass } from "@/components/training/training-layout";

function pickFallbackSelection(
  trainings: Training[],
  deleted?: TrainingSelection,
): TrainingSelection {
  if (trainings.length === 0) return { kind: "none" };

  if (deleted?.kind === "course") {
    const training = trainings.find((t) => t.id === deleted.trainingId);
    if (training && training.courses.length > 0) {
      const remaining = training.courses.filter((c) => c.id !== deleted.courseId);
      if (remaining.length > 0) {
        return selectionForTraining({ ...training, courses: remaining });
      }
    }
    const idx = trainings.findIndex((t) => t.id === deleted.trainingId);
    const fallbackTraining =
      trainings[idx] ?? trainings[Math.max(0, idx - 1)] ?? trainings[0];
    if (fallbackTraining) return selectionForTraining(fallbackTraining);
  }

  if (deleted?.kind === "training") {
    const idx = trainings.findIndex((t) => t.id === deleted.trainingId);
    const fallbackTraining =
      trainings[idx] ?? trainings[idx - 1] ?? trainings[0];
    if (fallbackTraining) return selectionForTraining(fallbackTraining);
  }

  return selectionForTraining(trainings[0]!);
}

function resolveActiveCourse(
  trainings: Training[],
  selection: TrainingSelection,
): { training: Training; course: Training["courses"][number] } | null {
  if (selection.kind === "course") {
    const training = trainings.find((t) => t.id === selection.trainingId);
    const course = training?.courses.find((c) => c.id === selection.courseId);
    if (training && course) return { training, course };
    return null;
  }

  if (selection.kind === "training") {
    const training = trainings.find((t) => t.id === selection.trainingId);
    if (!training) return null;
    if (isFlatTraining(training)) {
      return { training, course: training.courses[0] };
    }
    return null;
  }

  return null;
}

function applyAddChildCourse(
  trainings: Training[],
  trainingId: string,
  name: string,
): { trainings: Training[]; selection: TrainingSelection } | null {
  const training = trainings.find((t) => t.id === trainingId);
  if (!training) return null;

  if (isFlatTraining(training)) {
    const existingCourseId = training.courses[0].id;
    const updatedTraining: Training = {
      ...training,
      courses: [{ ...training.courses[0], name }],
    };
    return {
      trainings: trainings.map((t) =>
        t.id === trainingId ? updatedTraining : t,
      ),
      selection: isFlatTraining(updatedTraining)
        ? { kind: "training", trainingId }
        : { kind: "course", trainingId, courseId: existingCourseId },
    };
  }

  const courseId = crypto.randomUUID();
  return {
    trainings: trainings.map((t) =>
      t.id === trainingId
        ? {
            ...t,
            courses: [
              ...t.courses,
              {
                id: courseId,
                name,
                date: "未設定",
                location: "未設定",
                attendees: [],
              },
            ],
          }
        : t,
    ),
    selection: { kind: "course", trainingId, courseId },
  };
}

function applyMoveAttendee(
  trainings: Training[],
  attendeeId: string,
  fromCourseId: string,
  toCourseId: string,
): { trainings: Training[]; selection: TrainingSelection } | "duplicate" | null {
  if (fromCourseId === toCourseId) return null;

  const training = trainings.find((t) =>
    t.courses.some((c) => c.id === toCourseId),
  );
  if (!training) return null;

  let moved: Attendee | null = null;
  const withoutAttendee = trainings.map((t) => ({
    ...t,
    courses: t.courses.map((c) => {
      if (c.id !== fromCourseId) return c;
      const found = c.attendees.find((a) => a.id === attendeeId);
      if (found) moved = found;
      return {
        ...c,
        attendees: c.attendees.filter((a) => a.id !== attendeeId),
      };
    }),
  }));

  if (!moved) return null;

  const targetCourse = training.courses.find((c) => c.id === toCourseId);
  if (
    targetCourse?.attendees.some(
      (a) => a.employeeNumber === moved!.employeeNumber,
    )
  ) {
    return "duplicate";
  }

  const attendee = moved;
  return {
    trainings: withoutAttendee.map((t) => ({
      ...t,
      courses: t.courses.map((c) =>
        c.id === toCourseId
          ? { ...c, attendees: [...c.attendees, attendee] }
          : c,
      ),
    })),
    selection: {
      kind: "course",
      trainingId: training.id,
      courseId: toCourseId,
    },
  };
}

export function TrainingWorkspace() {
  const [trainings, setTrainings] = useState<Training[]>(INITIAL_TRAININGS);
  const [selection, setSelection] = useState<TrainingSelection>({
    kind: "course",
    trainingId: "t3",
    courseId: "c4",
  });
  const [selectedAttendeeId, setSelectedAttendeeId] = useState<string | null>(
    null,
  );
  const [referenceFileName, setReferenceFileName] = useState("employees.xlsx");

  const selectedContext = resolveActiveCourse(trainings, selection);

  const selectedTraining =
    selection.kind !== "none"
      ? (trainings.find((t) => t.id === selection.trainingId) ?? null)
      : null;

  const paneTrainingName =
    selectedContext?.training.name ?? selectedTraining?.name ?? null;

  const selectedAttendee =
    selectedAttendeeId && selectedContext
      ? (selectedContext.course.attendees.find(
          (a) => a.id === selectedAttendeeId,
        ) ?? null)
      : null;

  const selectTraining = useCallback((trainingId: string) => {
    setSelection({ kind: "training", trainingId });
    setSelectedAttendeeId(null);
  }, []);

  const selectCourse = useCallback((trainingId: string, courseId: string) => {
    setSelection({ kind: "course", trainingId, courseId });
    setSelectedAttendeeId(null);
  }, []);

  const selectAttendee = useCallback((attendeeId: string) => {
    setSelectedAttendeeId(attendeeId);
  }, []);

  const addParentTraining = useCallback((name: string) => {
    const trainingId = crypto.randomUUID();
    const courseId = crypto.randomUUID();
    const newTraining: Training = {
      id: trainingId,
      name,
      courses: [
        {
          id: courseId,
          name,
          date: "未設定",
          location: "未設定",
          attendees: [],
        },
      ],
    };
    setTrainings((prev) => [...prev, newTraining]);
    setSelection({ kind: "training", trainingId });
    setSelectedAttendeeId(null);
  }, []);

  const addChildCourse = useCallback(
    (name: string) => {
      if (selection.kind === "none") return;

      const trainingId = selection.trainingId;
      let nextSelection: TrainingSelection | null = null;

      setTrainings((prev) => {
        const result = applyAddChildCourse(prev, trainingId, name);
        if (!result) return prev;
        nextSelection = result.selection;
        return result.trainings;
      });

      if (nextSelection) {
        setSelection(nextSelection);
        setSelectedAttendeeId(null);
      }
    },
    [selection],
  );

  const deleteSelected = useCallback(() => {
    if (selection.kind === "none") return;

    if (selection.kind === "training") {
      const next = trainings.filter((t) => t.id !== selection.trainingId);
      setTrainings(next);
      setSelection(pickFallbackSelection(next, selection));
      setSelectedAttendeeId(null);
      return;
    }

    const { trainingId, courseId } = selection;
    const next = trainings
      .map((training) => {
        if (training.id !== trainingId) return training;
        return {
          ...training,
          courses: training.courses.filter((c) => c.id !== courseId),
        };
      })
      .filter((training) => training.courses.length > 0);

    setTrainings(next);
    setSelection(
      pickFallbackSelection(next, {
        kind: "course",
        trainingId,
        courseId,
      }),
    );
    setSelectedAttendeeId(null);
  }, [selection, trainings]);

  const addAttendee = useCallback(
    (courseId: string, employeeNumber: string): AddAttendeeResult => {
      const emp = findEmployee(employeeNumber);
      if (!emp) return "not_found";

      let result: AddAttendeeResult = "ok";
      const newAttendee: Attendee = {
        id: crypto.randomUUID(),
        employeeNumber: emp.employeeNumber,
        name: emp.name,
        department: emp.department,
        departmentCode: emp.departmentCode,
      };

      setTrainings((prev) => {
        const targetCourse = prev
          .flatMap((t) => t.courses)
          .find((c) => c.id === courseId);
        if (
          targetCourse?.attendees.some(
            (a) => a.employeeNumber === emp.employeeNumber,
          )
        ) {
          result = "duplicate";
          return prev;
        }

        return prev.map((t) => ({
          ...t,
          courses: t.courses.map((c) =>
            c.id === courseId
              ? { ...c, attendees: [...c.attendees, newAttendee] }
              : c,
          ),
        }));
      });

      if (result === "ok") {
        setSelectedAttendeeId(newAttendee.id);
      }
      return result;
    },
    [],
  );

  const updateCourseField = useCallback(
    (courseId: string, field: "date" | "location", value: string) => {
      setTrainings((prev) =>
        prev.map((t) => ({
          ...t,
          courses: t.courses.map((c) =>
            c.id === courseId ? { ...c, [field]: value } : c,
          ),
        })),
      );
    },
    [],
  );

  const removeAttendee = useCallback(() => {
    if (!selectedAttendeeId) return;

    setTrainings((prev) => {
      const ctx = resolveActiveCourse(prev, selection);
      const courseId = ctx?.course.id;
      if (!courseId) return prev;

      return prev.map((t) => ({
        ...t,
        courses: t.courses.map((c) =>
          c.id === courseId
            ? {
                ...c,
                attendees: c.attendees.filter(
                  (a) => a.id !== selectedAttendeeId,
                ),
              }
            : c,
        ),
      }));
    });
    setSelectedAttendeeId(null);
  }, [selectedAttendeeId, selection]);

  const moveAttendeeToCourse = useCallback(
    (
      attendeeId: string,
      fromCourseId: string,
      toCourseId: string,
    ): MoveAttendeeResult => {
      let outcome: MoveAttendeeResult = "failed";
      let nextSelection: TrainingSelection | null = null;

      setTrainings((prev) => {
        const result = applyMoveAttendee(
          prev,
          attendeeId,
          fromCourseId,
          toCourseId,
        );
        if (result === null) return prev;
        if (result === "duplicate") {
          outcome = "duplicate";
          return prev;
        }
        outcome = "ok";
        nextSelection = result.selection;
        return result.trainings;
      });

      if (nextSelection) {
        setSelection(nextSelection);
      }
      return outcome;
    },
    [],
  );

  const siblingCourses = selectedContext?.training.courses ?? [];
  const activeCourseId = selectedContext?.course.id ?? null;

  const parentOnlySelected =
    selection.kind === "training" &&
    selectedTraining !== null &&
    !isFlatTraining(selectedTraining);

  return (
    <SidebarProvider
      defaultOpen
      data-training-workspace
      className="flex h-screen w-full overflow-hidden bg-background text-foreground text-sm"
    >
      <TrainingPane
        trainings={trainings}
        selection={selection}
        onSelectTraining={selectTraining}
        onSelectCourse={selectCourse}
        onAddParent={addParentTraining}
        onAddChild={addChildCourse}
        onDeleteSelected={deleteSelected}
      />
      <SidebarInset className="flex min-w-0 flex-col bg-background">
        <header className="flex h-10 shrink-0 items-center border-b border-border bg-card px-3">
          <h1 className="text-xs font-semibold text-foreground">
            研修ワーク管理スペース
          </h1>
        </header>
        <div className="flex min-h-0 flex-1 flex-col bg-card">
          <CourseInfoPane
            trainingName={paneTrainingName}
            course={selectedContext?.course ?? null}
            parentOnlySelected={parentOnlySelected}
            selectedAttendeeId={selectedAttendeeId}
            onSelectAttendee={selectAttendee}
            onUpdateCourse={updateCourseField}
          />
          <div className={trainingBottomBandClass}>
            <AttendeeDetailPane
              key={`${activeCourseId ?? "none"}-${selectedAttendeeId ?? "none"}`}
              attendee={selectedAttendee}
              trainingName={paneTrainingName ?? ""}
              currentCourseId={activeCourseId}
              siblingCourses={siblingCourses}
              onAdd={(code) =>
                activeCourseId ? addAttendee(activeCourseId, code) : "not_found"
              }
              onRemove={removeAttendee}
              onMoveToCourse={(attendeeId, toCourseId) => {
                if (!activeCourseId) return "failed";
                return moveAttendeeToCourse(
                  attendeeId,
                  activeCourseId,
                  toCourseId,
                );
              }}
            />
            <ReferenceFilePane
              fileName={referenceFileName}
              onSelectFile={setReferenceFileName}
            />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
