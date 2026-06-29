"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  isFlatTraining,
  selectionForTraining,
  type AddAttendeeResult,
  type Employee,
  type MoveAttendeeResult,
  type Training,
  type TrainingSelection,
} from "@/lib/training-schema";
import {
  addChildCourseAction,
  addEnrollmentAction,
  createTrainingAction,
  deleteCourseAction,
  deleteTrainingAction,
  moveEnrollmentAction,
  removeEnrollmentAction,
  updateCourseFieldAction,
} from "@/lib/actions/training-actions";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TrainingPane } from "@/components/training/TrainingPane";
import { CourseInfoPane } from "@/components/training/CourseInfoPane";
import { AttendeeDetailPane } from "@/components/training/AttendeeDetailPane";
import { ReferenceFilePane } from "@/components/training/ReferenceFilePane";
import { trainingBottomBandClass } from "@/components/training/training-layout";

type TrainingWorkspaceProps = {
  trainings: Training[];
  employees: Employee[];
  initialSelection: TrainingSelection;
};

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

export function TrainingWorkspace({
  trainings,
  employees,
  initialSelection,
}: TrainingWorkspaceProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [selection, setSelection] =
    useState<TrainingSelection>(initialSelection);
  const [selectedAttendeeId, setSelectedAttendeeId] = useState<string | null>(
    null,
  );
  const [referenceFileName, setReferenceFileName] = useState("");

  const refresh = useCallback(() => {
    startTransition(() => {
      router.refresh();
    });
  }, [router]);

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

  const addParentTraining = useCallback(
    async (name: string) => {
      const { trainingId } = await createTrainingAction(name);
      setSelection({ kind: "training", trainingId });
      setSelectedAttendeeId(null);
      refresh();
    },
    [refresh],
  );

  const addChildCourse = useCallback(
    async (name: string) => {
      if (selection.kind === "none") return;

      const nextSelection = await addChildCourseAction(
        selection.trainingId,
        name,
      );
      if (nextSelection) {
        setSelection(nextSelection);
        setSelectedAttendeeId(null);
        refresh();
      }
    },
    [selection, refresh],
  );

  const deleteSelected = useCallback(async () => {
    if (selection.kind === "none") return;

    const deleted = selection;
    const nextSelection = pickFallbackSelection(trainings, deleted);

    if (selection.kind === "training") {
      await deleteTrainingAction(selection.trainingId);
    } else {
      await deleteCourseAction(selection.courseId);
    }

    setSelection(nextSelection);
    setSelectedAttendeeId(null);
    refresh();
  }, [selection, trainings, refresh]);

  const addAttendee = useCallback(
    async (courseId: string, employeeNumber: string): Promise<AddAttendeeResult> => {
      const outcome = await addEnrollmentAction(courseId, employeeNumber);
      if (outcome.result === "ok" && outcome.enrollmentId) {
        setSelectedAttendeeId(outcome.enrollmentId);
        refresh();
      }
      return outcome.result;
    },
    [refresh],
  );

  const updateCourseField = useCallback(
    async (courseId: string, field: "date" | "location", value: string) => {
      await updateCourseFieldAction(courseId, field, value);
      refresh();
    },
    [refresh],
  );

  const removeAttendee = useCallback(async () => {
    if (!selectedAttendeeId) return;
    await removeEnrollmentAction(selectedAttendeeId);
    setSelectedAttendeeId(null);
    refresh();
  }, [selectedAttendeeId, refresh]);

  const moveAttendeeToCourse = useCallback(
    async (
      attendeeId: string,
      fromCourseId: string,
      toCourseId: string,
    ): Promise<MoveAttendeeResult> => {
      const outcome = await moveEnrollmentAction(
        attendeeId,
        fromCourseId,
        toCourseId,
      );
      if (outcome.result === "ok" && outcome.selection) {
        setSelection(outcome.selection);
        refresh();
      }
      return outcome.result;
    },
    [refresh],
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
              employees={employees}
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
