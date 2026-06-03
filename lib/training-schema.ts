import { z } from "zod";

export const attendeeSchema = z.object({
  id: z.string(),
  employeeNumber: z.string(),
  name: z.string(),
  department: z.string(),
  departmentCode: z.string(),
});
export type Attendee = z.infer<typeof attendeeSchema>;

export const courseSchema = z.object({
  id: z.string(),
  name: z.string(),
  date: z.string(),
  location: z.string(),
  attendees: z.array(attendeeSchema),
});
export type Course = z.infer<typeof courseSchema>;

export const trainingSchema = z.object({
  id: z.string(),
  name: z.string(),
  courses: z.array(courseSchema),
});
export type Training = z.infer<typeof trainingSchema>;

export type TrainingSelection =
  | { kind: "none" }
  | { kind: "training"; trainingId: string }
  | { kind: "course"; trainingId: string; courseId: string };

export type AddAttendeeResult = "ok" | "not_found" | "duplicate";

export type MoveAttendeeResult = "ok" | "duplicate" | "failed";

/** 子なし表示（コース1件・名前が親と同一）の研修 */
export function isFlatTraining(training: Training): boolean {
  return (
    training.courses.length === 1 && training.courses[0].name === training.name
  );
}

export function selectionForTraining(training: Training): TrainingSelection {
  if (isFlatTraining(training)) {
    return { kind: "training", trainingId: training.id };
  }
  const first = training.courses[0];
  if (first) {
    return { kind: "course", trainingId: training.id, courseId: first.id };
  }
  return { kind: "none" };
}

export const employeeSchema = z.object({
  employeeNumber: z.string(),
  name: z.string(),
  department: z.string(),
  departmentCode: z.string(),
});
export type Employee = z.infer<typeof employeeSchema>;
