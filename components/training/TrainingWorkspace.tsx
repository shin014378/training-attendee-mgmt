"use client";

import { useState, useCallback } from "react";

import type { Attendee, Training, TrainingSelection } from "@/lib/training-schema";
import { INITIAL_TRAININGS } from "@/lib/data/training-mock";
import { findEmployee } from "@/lib/data/employee-mock";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TrainingPane } from "@/components/training/TrainingPane";
import { CourseInfoPane } from "@/components/training/CourseInfoPane";
import { AttendeeDetailPane } from "@/components/training/AttendeeDetailPane";
import { ReferenceFilePane } from "@/components/training/ReferenceFilePane";

function pickFallbackSelection(trainings: Training[]): TrainingSelection {
  const first = trainings[0];
  if (!first) return { kind: "none" };
  if (first.courses.length === 1) {
    return { kind: "training", trainingId: first.id };
  }
  return {
    kind: "course",
    trainingId: first.id,
    courseId: first.courses[0].id,
  };
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
    if (training.courses.length === 1) {
      return { training, course: training.courses[0] };
    }
    return null;
  }

  return null;
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

  const selectedCourseId =
    selection.kind === "course" ? selection.courseId : null;

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

  const addItem = useCallback(
    (name: string) => {
      if (selection.kind === "none") {
        const trainingId = `t-${Date.now()}`;
        const courseId = `c-${Date.now()}`;
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
        return;
      }

      const trainingId = selection.trainingId;
      const courseId = `c-${Date.now()}`;

      setTrainings((prev) =>
        prev.map((t) =>
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
      );
      setSelection({ kind: "course", trainingId, courseId });
      setSelectedAttendeeId(null);
    },
    [selection],
  );

  const deleteSelected = useCallback(() => {
    if (selection.kind === "none") return;

    if (selection.kind === "training") {
      setTrainings((prev) => {
        const next = prev.filter((t) => t.id !== selection.trainingId);
        setSelection(pickFallbackSelection(next));
        setSelectedAttendeeId(null);
        return next;
      });
      return;
    }

    const { trainingId, courseId } = selection;
    setTrainings((prev) => {
      const next = prev
        .map((training) => {
          if (training.id !== trainingId) return training;
          return {
            ...training,
            courses: training.courses.filter((c) => c.id !== courseId),
          };
        })
        .filter((training) => training.courses.length > 0);

      setSelection(pickFallbackSelection(next));
      setSelectedAttendeeId(null);
      return next;
    });
  }, [selection]);

  const addAttendee = useCallback(
    (courseId: string, employeeNumber: string): boolean => {
      const emp = findEmployee(employeeNumber);
      if (!emp) return false;

      const newAttendee: Attendee = {
        id: `a-${Date.now()}`,
        employeeNumber: emp.employeeNumber,
        name: emp.name,
        department: emp.department,
        departmentCode: emp.departmentCode,
      };
      setTrainings((prev) =>
        prev.map((t) => ({
          ...t,
          courses: t.courses.map((c) =>
            c.id === courseId
              ? { ...c, attendees: [...c.attendees, newAttendee] }
              : c,
          ),
        })),
      );
      setSelectedAttendeeId(newAttendee.id);
      return true;
    },
    [],
  );

  const removeAttendee = useCallback(() => {
    if (!selectedAttendeeId || !selectedCourseId) return;
    setTrainings((prev) =>
      prev.map((t) => ({
        ...t,
        courses: t.courses.map((c) =>
          c.id === selectedCourseId
            ? {
                ...c,
                attendees: c.attendees.filter((a) => a.id !== selectedAttendeeId),
              }
            : c,
        ),
      })),
    );
    setSelectedAttendeeId(null);
  }, [selectedAttendeeId, selectedCourseId]);

  const updateAttendeeEmployeeNumber = useCallback(
    (newNumber: string): boolean => {
      if (!selectedAttendeeId || !selectedCourseId) return false;
      const emp = findEmployee(newNumber);
      if (!emp) return false;
      setTrainings((prev) =>
        prev.map((t) => ({
          ...t,
          courses: t.courses.map((c) =>
            c.id === selectedCourseId
              ? {
                  ...c,
                  attendees: c.attendees.map((a) =>
                    a.id === selectedAttendeeId
                      ? {
                          ...a,
                          employeeNumber: emp.employeeNumber,
                          name: emp.name,
                          department: emp.department,
                          departmentCode: emp.departmentCode,
                        }
                      : a,
                  ),
                }
              : c,
          ),
        })),
      );
      return true;
    },
    [selectedAttendeeId, selectedCourseId],
  );

  return (
    <SidebarProvider
      defaultOpen
      className="flex h-screen w-full overflow-hidden bg-background text-foreground"
    >
      <TrainingPane
        trainings={trainings}
        selection={selection}
        onSelectTraining={selectTraining}
        onSelectCourse={selectCourse}
        onAddItem={addItem}
        onDeleteSelected={deleteSelected}
      />
      <SidebarInset className="flex min-w-0 flex-col bg-background">
        <header className="flex h-12 shrink-0 items-center border-b border-border bg-background px-4">
          <h1 className="text-sm font-semibold text-foreground">
            研修受講者管理
          </h1>
        </header>
        <div className="flex min-h-0 flex-1 flex-col">
          <CourseInfoPane
            trainingName={selectedContext?.training.name ?? null}
            course={selectedContext?.course ?? null}
            parentOnlySelected={
              selection.kind === "training" &&
              (trainings.find((t) => t.id === selection.trainingId)?.courses
                .length ?? 0) > 1
            }
            selectedAttendeeId={selectedAttendeeId}
            onSelectAttendee={selectAttendee}
          />
          <div className="flex h-72 shrink-0 border-t border-border">
            <AttendeeDetailPane
              key={`${selectedCourseId ?? "none"}-${selectedAttendeeId ?? "none"}`}
              attendee={selectedAttendee}
              onAdd={(code) =>
                selectedCourseId
                  ? addAttendee(selectedCourseId, code)
                  : false
              }
              onRemove={removeAttendee}
              onChangeEmployeeNumber={updateAttendeeEmployeeNumber}
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
