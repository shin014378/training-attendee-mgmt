"use client";

import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SectionLabel } from "@/components/primitives";
import {
  trainingFieldLabelClass,
  trainingPaneHeaderClass,
  trainingReadOnlyInputClass,
} from "@/components/training/training-layout";

type ReferenceFilePaneProps = {
  fileName: string;
  onSelectFile: (fileName: string) => void;
};

export function ReferenceFilePane({
  fileName,
  onSelectFile,
}: ReferenceFilePaneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onSelectFile(file.name);
    }
    event.target.value = "";
  };

  return (
    <section className="flex w-36 shrink-0 flex-col bg-card">
      <header className={trainingPaneHeaderClass}>
        <SectionLabel size="compact">参照にするファイル</SectionLabel>
      </header>

      <div className="flex flex-col gap-2 p-3">
        <input
          ref={inputRef}
          id="reference-file-input"
          type="file"
          accept=".xlsx,.xls,.csv"
          className="sr-only"
          tabIndex={-1}
          onChange={handleFileChange}
        />
        <Button
          type="button"
          size="sm"
          onClick={handlePick}
          aria-controls="reference-file-input"
        >
          ファイルを選ぶ
        </Button>
        <FieldGroup>
          <Field className="gap-1">
            <FieldLabel
              htmlFor="reference-file-name"
              className={trainingFieldLabelClass}
            >
              ファイル名
            </FieldLabel>
            <Input
              id="reference-file-name"
              readOnly
              tabIndex={-1}
              value={fileName}
              placeholder="未選択"
              className={trainingReadOnlyInputClass}
            />
          </Field>
        </FieldGroup>
      </div>
    </section>
  );
}
