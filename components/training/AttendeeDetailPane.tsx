"use client";

import { useState } from "react";

import type {
  Attendee,
  Course,
  AddAttendeeResult,
  Employee,
  MoveAttendeeResult,
} from "@/lib/training-schema";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { SectionLabel } from "@/components/primitives";
import {
  trainingFieldInputClass,
  trainingFieldLabelClass,
  trainingPaneHeaderClass,
  trainingReadOnlyInputClass,
} from "@/components/training/training-layout";
import { cn } from "@/lib/utils";

type AttendeeDetailPaneProps = {
  attendee: Attendee | null;
  trainingName: string;
  currentCourseId: string | null;
  siblingCourses: Course[];
  employees: Employee[];
  onAdd: (employeeNumber: string) => AddAttendeeResult | Promise<AddAttendeeResult>;
  onRemove: () => void | Promise<void>;
  onMoveToCourse: (
    attendeeId: string,
    toCourseId: string,
  ) => MoveAttendeeResult | Promise<MoveAttendeeResult>;
};

function formatCourseLabel(
  trainingName: string,
  course: Course,
  multiCourse: boolean,
): string {
  if (!multiCourse) return trainingName;
  return `ー${course.name}`;
}

export function AttendeeDetailPane({
  attendee,
  trainingName,
  currentCourseId,
  siblingCourses,
  employees,
  onAdd,
  onRemove,
  onMoveToCourse,
}: AttendeeDetailPaneProps) {
  const [searchCode, setSearchCode] = useState("");
  const [targetCourseId, setTargetCourseId] = useState(currentCourseId ?? "");
  const [draft, setDraft] = useState<Attendee | null>(null);
  const [searchError, setSearchError] = useState("");

  const display = draft ?? attendee;
  const multiCourse = siblingCourses.length > 1;
  const courseSelectEnabled = multiCourse && siblingCourses.length > 0;
  const canMoveCourse = multiCourse && attendee !== null;
  const courseMoveReady =
    canMoveCourse &&
    targetCourseId !== "" &&
    targetCourseId !== currentCourseId;

  const selectedCourse =
    siblingCourses.find((c) => c.id === targetCourseId) ??
    siblingCourses.find((c) => c.id === currentCourseId) ??
    (siblingCourses.length === 1 ? siblingCourses[0] : null);

  const courseTriggerLabel = selectedCourse
    ? formatCourseLabel(trainingName, selectedCourse, multiCourse)
    : "—";

  const lookupEmployee = (code: string): Employee | null => {
    const normalized = code.trim().toUpperCase();
    return employees.find((e) => e.employeeNumber === normalized) ?? null;
  };

  const handleSearch = () => {
    const trimmed = searchCode.trim().toUpperCase();
    if (!trimmed) return;
    const emp = lookupEmployee(trimmed);
    if (!emp) {
      setSearchError(`「${trimmed}」は社員マスタに見つかりません`);
      return;
    }
    setSearchError("");
    setDraft({
      id: "draft",
      employeeNumber: emp.employeeNumber,
      name: emp.name,
      department: emp.department,
      departmentCode: emp.departmentCode,
    });
  };

  const handleAdd = async () => {
    const code = display?.employeeNumber ?? searchCode.trim().toUpperCase();
    if (!code) return;
    const result = await onAdd(code);
    if (result === "not_found") {
      setSearchError(`「${code}」は社員マスタに見つかりません`);
      return;
    }
    if (result === "duplicate") {
      setSearchError(`「${code}」はこのコースに既に登録されています`);
      return;
    }
    setSearchError("");
    setDraft(null);
    setSearchCode("");
  };

  const handleChangeCourse = async () => {
    if (!attendee || !courseMoveReady) return;
    const result = await onMoveToCourse(attendee.id, targetCourseId);
    if (result === "duplicate") {
      setSearchError("移動先コースに同じ従業員が既に登録されています");
      return;
    }
    if (result === "failed") {
      setSearchError("コースの変更に失敗しました");
      return;
    }
    setSearchError("");
  };

  return (
    <section
      aria-label="従業員検索"
      className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-r border-border bg-card"
    >
      <header className={trainingPaneHeaderClass}>
        <SectionLabel size="compact">従業員検索</SectionLabel>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3">
        <Field className="min-w-0 gap-1">
          <FieldLabel
            htmlFor="attendee-search-code"
            className={trainingFieldLabelClass}
          >
            従業員コード
          </FieldLabel>
          <div className="flex gap-2">
            <Input
              id="attendee-search-code"
              value={searchCode}
              onChange={(e) => {
                setSearchCode(e.target.value);
                setSearchError("");
              }}
              placeholder="従業員コードの入力"
              aria-invalid={searchError.length > 0}
              aria-describedby="attendee-search-error"
              className={cn(trainingFieldInputClass, "flex-1")}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="shrink-0"
              onClick={handleSearch}
            >
              検索
            </Button>
          </div>
        </Field>

        <p
          id="attendee-search-error"
          className="min-h-4 text-xs text-destructive"
          aria-live="polite"
          role={searchError ? "alert" : undefined}
        >
          {searchError}
        </p>

        <div className="grid min-w-0 grid-cols-2 gap-2">
          <Field className="min-w-0 gap-1">
            <FieldLabel
              htmlFor="attendee-name"
              className={trainingFieldLabelClass}
            >
              氏名
            </FieldLabel>
            <Input
              id="attendee-name"
              readOnly
              tabIndex={-1}
              value={display?.name ?? ""}
              placeholder="—"
              className={trainingReadOnlyInputClass}
            />
          </Field>
          <Field className="min-w-0 gap-1">
            <FieldLabel
              htmlFor="attendee-dept-code"
              className={trainingFieldLabelClass}
            >
              所属コード
            </FieldLabel>
            <Input
              id="attendee-dept-code"
              readOnly
              tabIndex={-1}
              value={display?.departmentCode ?? ""}
              placeholder="—"
              className={cn(trainingReadOnlyInputClass, "font-mono")}
            />
          </Field>
        </div>

        <Field className="min-w-0 gap-1">
          <FieldLabel htmlFor="attendee-dept" className={trainingFieldLabelClass}>
            所属
          </FieldLabel>
          <Input
            id="attendee-dept"
            readOnly
            tabIndex={-1}
            value={display?.department ?? ""}
            placeholder="—"
            className={trainingReadOnlyInputClass}
          />
        </Field>

        <div className="flex min-w-0 flex-wrap items-end gap-2">
          <Field className="min-w-[8rem] flex-1 gap-1">
            <FieldLabel
              htmlFor="attendee-course"
              className={trainingFieldLabelClass}
            >
              受講コース
            </FieldLabel>
            <Select
              value={targetCourseId || undefined}
              onValueChange={(v) => {
                if (v) setTargetCourseId(v);
              }}
              disabled={!courseSelectEnabled}
            >
              <SelectTrigger
                id="attendee-course"
                size="sm"
                aria-label="受講コース"
                className="h-7 w-full min-w-0"
              >
                <span className="truncate text-xs">{courseTriggerLabel}</span>
              </SelectTrigger>
              <SelectContent align="start">
                {siblingCourses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {formatCourseLabel(trainingName, course, multiCourse)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="flex shrink-0 flex-wrap gap-1.5 pb-0.5">
            <Button type="button" size="sm" onClick={handleAdd}>
              追加
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={onRemove}
              disabled={!attendee}
            >
              削除
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleChangeCourse}
              disabled={!courseMoveReady}
            >
              変更
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
