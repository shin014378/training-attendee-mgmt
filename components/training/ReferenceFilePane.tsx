"use client";

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
  const handlePick = () => {
    onSelectFile("employees.xlsx");
  };

  return (
    <section className="flex w-36 shrink-0 flex-col bg-card">
      <header className={trainingPaneHeaderClass}>
        <SectionLabel size="compact">参照にするファイル</SectionLabel>
      </header>

      <div className="flex flex-col gap-2 p-3">
        <Button type="button" size="sm" onClick={handlePick}>
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
