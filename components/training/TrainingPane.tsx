"use client";

import { useState } from "react";

import {
  isFlatTraining,
  type Training,
  type TrainingSelection,
} from "@/lib/training-schema";
import { DeleteConfirmDialog } from "@/components/workspace/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { trainingScrollAreaClass } from "@/components/training/training-scroll-area";

type TrainingPaneProps = {
  trainings: Training[];
  selection: TrainingSelection;
  onSelectTraining: (trainingId: string) => void;
  onSelectCourse: (trainingId: string, courseId: string) => void;
  onAddParent: (name: string) => void;
  onAddChild: (name: string) => void;
  onDeleteSelected: () => void;
};

function isTrainingRowActive(
  selection: TrainingSelection,
  training: Training,
): boolean {
  if (selection.kind === "training" && selection.trainingId === training.id) {
    return true;
  }
  if (
    isFlatTraining(training) &&
    selection.kind === "course" &&
    selection.trainingId === training.id
  ) {
    return true;
  }
  return false;
}

function isCourseActive(
  selection: TrainingSelection,
  courseId: string,
): boolean {
  return selection.kind === "course" && selection.courseId === courseId;
}

function resolveDeleteTarget(
  trainings: Training[],
  selection: TrainingSelection,
): { title: string; itemName: string } | null {
  if (selection.kind === "none") return null;

  const training = trainings.find((t) => t.id === selection.trainingId);
  if (!training) return null;

  if (selection.kind === "training") {
    return { title: "研修を削除", itemName: training.name };
  }

  const course = training.courses.find((c) => c.id === selection.courseId);
  if (!course) return null;

  const label =
    course.name === training.name
      ? training.name
      : `${training.name} ${course.name}`;

  return { title: "コースを削除", itemName: label };
}

export function TrainingPane({
  trainings,
  selection,
  onSelectTraining,
  onSelectCourse,
  onAddParent,
  onAddChild,
  onDeleteSelected,
}: TrainingPaneProps) {
  const [newName, setNewName] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  const canAddChild = selection.kind !== "none";
  const hasName = newName.trim().length > 0;

  const selectedTraining =
    selection.kind !== "none"
      ? (trainings.find((t) => t.id === selection.trainingId) ?? null)
      : null;

  const isFlatSelected =
    selectedTraining !== null && isFlatTraining(selectedTraining);

  const deleteTarget = resolveDeleteTarget(trainings, selection);

  const handleAddParent = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    onAddParent(trimmed);
    setNewName("");
  };

  const handleAddChild = () => {
    const trimmed = newName.trim();
    if (!trimmed || !canAddChild) return;
    onAddChild(trimmed);
    setNewName("");
  };

  const handleDeleteConfirm = () => {
    onDeleteSelected();
    setDeleteOpen(false);
  };

  return (
    <Sidebar
      collapsible="none"
      aria-label="研修一覧"
      className="h-full min-h-0 shrink-0 border-r border-sidebar-border bg-sidebar"
    >
      <SidebarHeader className="border-b border-sidebar-border p-0">
        <div className="flex h-12 items-center px-5">
          <h2 className="truncate text-sm font-semibold text-sidebar-foreground">
            研修名
          </h2>
        </div>
      </SidebarHeader>

      <ScrollArea className={trainingScrollAreaClass}>
        <div className="flex flex-col gap-2 px-1 py-3">
          {trainings.map((training) => {
            const isFlat = isFlatTraining(training);
            const trainingActive = isTrainingRowActive(selection, training);

            if (isFlat) {
              return (
                <SidebarGroup key={training.id} className="px-1">
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={trainingActive}
                          aria-current={trainingActive ? "page" : undefined}
                          onClick={() => onSelectTraining(training.id)}
                        >
                          <span className="truncate">{training.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              );
            }

            return (
              <SidebarGroup key={training.id} className="px-1">
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={trainingActive}
                        aria-current={trainingActive ? "page" : undefined}
                        onClick={() => onSelectTraining(training.id)}
                      >
                        <span className="truncate">{training.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    {training.courses.map((course) => {
                      const courseActive = isCourseActive(
                        selection,
                        course.id,
                      );
                      return (
                        <SidebarMenuItem key={course.id}>
                          <SidebarMenuButton
                            isActive={courseActive}
                            aria-current={courseActive ? "page" : undefined}
                            onClick={() =>
                              onSelectCourse(training.id, course.id)
                            }
                            className="pl-4"
                          >
                            <span className="truncate">ー{course.name}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            );
          })}
        </div>
      </ScrollArea>

      <SidebarFooter className="mt-auto border-t border-sidebar-border p-3">
        <div className="flex flex-col gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="名前"
            aria-label="追加する名前"
            className="h-7 text-xs"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              className="flex-1"
              onClick={handleAddParent}
              disabled={!hasName}
            >
              親を追加
            </Button>
            <Button
              type="button"
              size="sm"
              className="flex-1"
              variant="secondary"
              onClick={handleAddChild}
              disabled={!hasName || !canAddChild}
              title={
                isFlatSelected
                  ? "最初のコース名を設定します（既存の受講者データは保持されます）"
                  : undefined
              }
            >
              {isFlatSelected ? "コースを追加" : "子を追加"}
            </Button>
          </div>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
            disabled={selection.kind === "none"}
          >
            削除
          </Button>
        </div>
      </SidebarFooter>

      {deleteTarget ? (
        <DeleteConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          title={deleteTarget.title}
          itemName={deleteTarget.itemName}
          onConfirm={handleDeleteConfirm}
        />
      ) : null}
    </Sidebar>
  );
}
