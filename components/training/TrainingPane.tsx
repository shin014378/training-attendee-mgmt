"use client";

import { useState } from "react";

import type { Training, TrainingSelection } from "@/lib/training-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type TrainingPaneProps = {
  trainings: Training[];
  selection: TrainingSelection;
  onSelectTraining: (trainingId: string) => void;
  onSelectCourse: (trainingId: string, courseId: string) => void;
  onAddParent: (name: string) => void;
  onAddChild: (name: string) => void;
  onDeleteSelected: () => void;
};

function isTrainingActive(
  selection: TrainingSelection,
  trainingId: string,
): boolean {
  return (
    selection.kind === "training" && selection.trainingId === trainingId
  );
}

function isCourseActive(
  selection: TrainingSelection,
  courseId: string,
): boolean {
  return selection.kind === "course" && selection.courseId === courseId;
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

  const canAddChild = selection.kind !== "none";
  const hasName = newName.trim().length > 0;

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

  return (
    <Sidebar
      collapsible="none"
      className="shrink-0 border-r border-sidebar-border bg-sidebar"
    >
      <SidebarHeader className="border-b border-sidebar-border p-0">
        <div className="flex h-12 items-center px-5">
          <h2 className="truncate text-sm font-semibold text-sidebar-foreground">
            研修名
          </h2>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-1 py-3">
        {trainings.map((training) => {
          const isFlat = training.courses.length === 1;
          const trainingActive = isTrainingActive(selection, training.id);

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
                    const courseActive = isCourseActive(selection, course.id);
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
      </SidebarContent>

      <SidebarFooter className="mt-auto border-t border-sidebar-border p-3">
        <div className="flex flex-col gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="名前"
            aria-label="追加する名前"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              className="flex-1"
              onClick={handleAddParent}
              disabled={!hasName}
            >
              親を追加
            </Button>
            <Button
              type="button"
              className="flex-1"
              variant="secondary"
              onClick={handleAddChild}
              disabled={!hasName || !canAddChild}
            >
              子を追加
            </Button>
          </div>
          <Button
            type="button"
            variant="destructive"
            onClick={onDeleteSelected}
            disabled={selection.kind === "none"}
          >
            削除
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
