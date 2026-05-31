"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type AddAttendeeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 従業員番号で照合し、見つかれば true、見つからなければ false を返す */
  onAdd: (employeeNumber: string) => boolean;
};

export function AddAttendeeDialog({
  open,
  onOpenChange,
  onAdd,
}: AddAttendeeDialogProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const trimmed = value.trim().toUpperCase();
    if (!trimmed) return;
    const found = onAdd(trimmed);
    if (!found) {
      setError(`「${trimmed}」は社員マスタに見つかりません`);
      return;
    }
    setValue("");
    setError("");
    onOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setValue("");
      setError("");
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>受講者を追加</DialogTitle>
          <DialogDescription>
            従業員番号を入力すると、社員マスタから氏名・所属を自動補完します
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="emp-number">従業員番号</FieldLabel>
            <Input
              id="emp-number"
              autoFocus
              placeholder="例: E001"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              aria-describedby={error ? "emp-error" : undefined}
            />
            {error && (
              <p id="emp-error" className="text-xs text-destructive">
                {error}
              </p>
            )}
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">キャンセル</Button>} />
          <Button onClick={handleSubmit} disabled={!value.trim()}>
            追加
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
