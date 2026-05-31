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

export const employeeSchema = z.object({
  employeeNumber: z.string(),
  name: z.string(),
  department: z.string(),
  departmentCode: z.string(),
});
export type Employee = z.infer<typeof employeeSchema>;
