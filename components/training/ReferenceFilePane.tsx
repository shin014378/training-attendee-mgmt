"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SectionLabel } from "@/components/primitives";

type ReferenceFilePaneProps = {
  fileName: string;
  onSelectFile: (fileName: string) => void;
};

export function ReferenceFilePane({
  fileName,
  onSelectFile,
}: ReferenceFilePaneProps) {
  const handlePick = () => {
    // モックアップ: 実際のファイル選択は次フェーズ
    onSelectFile("employees.xlsx");
  };

  return (
    <section className="flex w-36 shrink-0 flex-col bg-background">
      <header className="flex h-10 shrink-0 items-center border-b border-border px-4">
        <SectionLabel>参照にするファイル</SectionLabel>
      </header>

      <div className="flex flex-col gap-4 p-4">
        <Button type="button" onClick={handlePick}>
          ファイルを選ぶ
        </Button>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="reference-file-name">ファイル名</FieldLabel>
            <Input
              id="reference-file-name"
              readOnly
              value={fileName}
              placeholder="未選択"
            />
          </Field>
        </FieldGroup>
      </div>
    </section>
  );
}
