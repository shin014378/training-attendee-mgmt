"use server";

import { revalidatePath } from "next/cache";

import type {
  AddAttendeeResult,
  MoveAttendeeResult,
  TrainingSelection,
} from "@/lib/training-schema";
import {
  addChildCourse,
  addEnrollment,
  createTraining,
  deleteCourse,
  deleteTraining,
  moveEnrollment,
  removeEnrollment,
  updateCourseField,
} from "@/lib/training-repository";

function revalidateWorkspace() {
  revalidatePath("/");
}

export async function createTrainingAction(
  name: string,
): Promise<{ trainingId: string }> {
  const { trainingId } = await createTraining(name);
  revalidateWorkspace();
  return { trainingId };
}

export async function addChildCourseAction(
  trainingId: string,
  name: string,
): Promise<TrainingSelection | null> {
  const selection = await addChildCourse(trainingId, name);
  revalidateWorkspace();
  return selection;
}

export async function deleteTrainingAction(trainingId: string): Promise<void> {
  await deleteTraining(trainingId);
  revalidateWorkspace();
}

export async function deleteCourseAction(courseId: string): Promise<void> {
  await deleteCourse(courseId);
  revalidateWorkspace();
}

export async function updateCourseFieldAction(
  courseId: string,
  field: "date" | "location",
  value: string,
): Promise<void> {
  await updateCourseField(courseId, field, value);
  revalidateWorkspace();
}

export async function addEnrollmentAction(
  courseId: string,
  employeeNumber: string,
): Promise<{ result: AddAttendeeResult; enrollmentId?: string }> {
  const outcome = await addEnrollment(courseId, employeeNumber);
  if (outcome.result === "ok") {
    revalidateWorkspace();
  }
  return outcome;
}

export async function removeEnrollmentAction(
  enrollmentId: string,
): Promise<void> {
  await removeEnrollment(enrollmentId);
  revalidateWorkspace();
}

export async function moveEnrollmentAction(
  enrollmentId: string,
  fromCourseId: string,
  toCourseId: string,
): Promise<{
  result: MoveAttendeeResult;
  selection?: TrainingSelection;
}> {
  const outcome = await moveEnrollment(
    enrollmentId,
    fromCourseId,
    toCourseId,
  );
  if (outcome.result === "ok") {
    revalidateWorkspace();
  }
  return outcome;
}
