"use client";

import { useState } from "react";

import type { Attendee, Course } from "@/lib/training-schema";
import { findEmployee } from "@/lib/data/employee-mock";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionLabel } from "@/components/primitives";

type AttendeeDetailPaneProps = {
  attendee: Attendee | null;
  currentCourseId: string | null;
  siblingCourses: Course[];
  onAdd: (employeeNumber: string) => boolean;
  onRemove: () => void;
  onMoveToCourse: (attendeeId: string, toCourseId: string) => void;
};

export function AttendeeDetailPane({
  attendee,
  currentCourseId,
  siblingCourses,
  onAdd,
  onRemove,
  onMoveToCourse,
}: AttendeeDetailPaneProps) {
  const [searchCode, setSearchCode] = useState("");
  const [targetCourseId, setTargetCourseId] = useState(currentCourseId ?? "");
  const [draft, setDraft] = useState<Attendee | null>(null);
  const [searchError, setSearchError] = useState("");

  const display = draft ?? attendee;
  const canChangeCourse = siblingCourses.length > 1 && attendee !== null;
  const courseMoveReady =
    canChangeCourse &&
    targetCourseId !== "" &&
    targetCourseId !== currentCourseId;

  const handleSearch = () => {
    const trimmed = searchCode.trim().toUpperCase();
    if (!trimmed) return;
    const emp = findEmployee(trimmed);
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

  const handleAdd = () => {
    const code = display?.employeeNumber ?? searchCode.trim().toUpperCase();
    if (!code) return;
    const ok = onAdd(code);
    if (!ok) {
      setSearchError(`「${code}」は社員マスタに見つかりません`);
      return;
    }
    setSearchError("");
    setDraft(null);
    setSearchCode("");
  };

  const handleChangeCourse = () => {
    if (!attendee || !courseMoveReady) return;
    onMoveToCourse(attendee.id, targetCourseId);
  };

  return (
    <section className="flex min-h-0 min-w-0 flex-1 flex-col border-r border-border bg-card">
      <header className="flex h-10 shrink-0 items-center border-b border-border px-4">
        <SectionLabel>従業員検索</SectionLabel>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
        <div className="flex gap-2">
          <Input
            value={searchCode}
            onChange={(e) => {
              setSearchCode(e.target.value);
              setSearchError("");
            }}
            placeholder="従業員コード"
            aria-label="従業員コードで検索"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
          <Button type="button" variant="secondary" onClick={handleSearch}>
            検索
          </Button>
        </div>
        {searchError && (
          <p className="text-xs text-destructive">{searchError}</p>
        )}

        <div className="flex min-h-0 min-w-0 flex-1 gap-4">
          <FieldGroup className="min-w-0 flex-1 overflow-hidden">
            <Field className="min-w-0">
              <FieldLabel htmlFor="attendee-name">氏名</FieldLabel>
              <Input
                id="attendee-name"
                readOnly
                value={display?.name ?? ""}
                placeholder="—"
                className="min-w-0 w-full"
              />
            </Field>
            <Field className="min-w-0">
              <FieldLabel htmlFor="attendee-dept-code">所属コード</FieldLabel>
              <Input
                id="attendee-dept-code"
                readOnly
                value={display?.departmentCode ?? ""}
                placeholder="—"
                className="min-w-0 w-full font-mono text-xs"
              />
            </Field>
            <Field className="min-w-0">
              <FieldLabel htmlFor="attendee-dept">所属</FieldLabel>
              <Input
                id="attendee-dept"
                readOnly
                value={display?.department ?? ""}
                placeholder="—"
                className="min-w-0 w-full"
              />
            </Field>
            {canChangeCourse && (
              <Field className="min-w-0">
                <FieldLabel htmlFor="attendee-course">受講コース</FieldLabel>
                <Select
                  value={targetCourseId}
                  onValueChange={(v) => {
                    if (v) setTargetCourseId(v);
                  }}
                >
                  <SelectTrigger
                    id="attendee-course"
                    aria-label="受講コース"
                    className="h-8 w-full min-w-0 bg-card hover:bg-accent/40"
                  >
                    <SelectValue placeholder="コースを選択" />
                  </SelectTrigger>
                  <SelectContent align="start">
                    {siblingCourses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          </FieldGroup>

          <div className="flex w-36 shrink-0 flex-col gap-2">
            <Button type="button" onClick={handleAdd}>
              追加
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={onRemove}
              disabled={!attendee}
            >
              削除
            </Button>
            {canChangeCourse && (
              <Button
                type="button"
                variant="secondary"
                onClick={handleChangeCourse}
                disabled={!courseMoveReady}
              >
                変更
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
