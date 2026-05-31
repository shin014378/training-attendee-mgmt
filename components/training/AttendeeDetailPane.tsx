"use client";

import { useState } from "react";

import type { Attendee } from "@/lib/training-schema";
import { findEmployee } from "@/lib/data/employee-mock";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SectionLabel } from "@/components/primitives";

type AttendeeDetailPaneProps = {
  attendee: Attendee | null;
  onAdd: (employeeNumber: string) => boolean;
  onRemove: () => void;
  onChangeEmployeeNumber: (newNumber: string) => boolean;
};

export function AttendeeDetailPane({
  attendee,
  onAdd,
  onRemove,
  onChangeEmployeeNumber,
}: AttendeeDetailPaneProps) {
  const [searchCode, setSearchCode] = useState("");
  const [changeCode, setChangeCode] = useState("");
  const [draft, setDraft] = useState<Attendee | null>(null);
  const [searchError, setSearchError] = useState("");
  const [changeError, setChangeError] = useState("");

  const display = draft ?? attendee;

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

  const handleChange = () => {
    const trimmed = changeCode.trim().toUpperCase();
    if (!trimmed || !attendee) return;
    const ok = onChangeEmployeeNumber(trimmed);
    if (!ok) {
      setChangeError(`「${trimmed}」は社員マスタに見つかりません`);
      return;
    }
    setChangeError("");
    setChangeCode("");
    setDraft(null);
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col border-r border-border bg-card">
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

        <div className="flex min-h-0 flex-1 gap-6">
          <FieldGroup className="min-w-0 flex-1">
            <Field>
              <FieldLabel htmlFor="attendee-name">氏名</FieldLabel>
              <Input
                id="attendee-name"
                readOnly
                value={display?.name ?? ""}
                placeholder="—"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="attendee-dept">所属</FieldLabel>
              <Input
                id="attendee-dept"
                readOnly
                value={display?.department ?? ""}
                placeholder="—"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="attendee-dept-code">所属コード</FieldLabel>
              <Input
                id="attendee-dept-code"
                readOnly
                value={display?.departmentCode ?? ""}
                placeholder="—"
              />
            </Field>
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
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleChange}
                disabled={!attendee || !changeCode.trim()}
              >
                変更
              </Button>
              <Input
                value={changeCode}
                onChange={(e) => {
                  setChangeCode(e.target.value);
                  setChangeError("");
                }}
                placeholder="新コード"
                aria-label="変更後の従業員コード"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleChange();
                }}
              />
              {changeError && (
                <p className="text-xs text-destructive">{changeError}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
