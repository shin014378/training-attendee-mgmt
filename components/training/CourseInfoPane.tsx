"use client";

import type { Course } from "@/lib/training-schema";
import { InlineTextField } from "@/components/primitives/InlineTextField";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trainingScrollAreaClass } from "@/components/training/training-scroll-area";

const attendeeGridClass =
  "grid grid-cols-[minmax(6rem,1fr)_minmax(5rem,1.2fr)_minmax(5rem,1fr)_minmax(6rem,1.5fr)] gap-3";

type CourseInfoPaneProps = {
  trainingName: string | null;
  course: Course | null;
  parentOnlySelected?: boolean;
  selectedAttendeeId: string | null;
  onSelectAttendee: (attendeeId: string) => void;
  onUpdateCourse: (
    courseId: string,
    field: "date" | "location",
    value: string,
  ) => void;
};

export function CourseInfoPane({
  trainingName,
  course,
  parentOnlySelected = false,
  selectedAttendeeId,
  onSelectAttendee,
  onUpdateCourse,
}: CourseInfoPaneProps) {
  if (parentOnlySelected && trainingName) {
    return (
      <section
        aria-label="コース情報"
        className="flex min-h-0 flex-1 flex-col items-center justify-center border-b border-border bg-background text-sm text-muted-foreground"
      >
        <p role="status">{trainingName} — コースを選択してください</p>
      </section>
    );
  }

  if (!course || !trainingName) {
    return (
      <section
        aria-label="コース情報"
        className="flex min-h-0 flex-1 flex-col items-center justify-center border-b border-border bg-background text-sm text-muted-foreground"
      >
        <p role="status">左のメニューから研修を選択してください</p>
      </section>
    );
  }

  const title =
    course.name === trainingName
      ? trainingName
      : `${trainingName} ${course.name}`;

  return (
    <section aria-label="コース情報" className="flex min-h-0 flex-1 flex-col bg-background">
      <header className="flex min-h-12 shrink-0 flex-wrap items-center gap-x-6 gap-y-2 border-b border-border px-4 py-2">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <dt className="shrink-0 font-medium text-foreground">日時</dt>
            <dd className="min-w-0">
              <InlineTextField
                key={`${course.id}-date`}
                value={course.date}
                onSave={(v) => onUpdateCourse(course.id, "date", v)}
                ariaLabel="日時"
                placeholder="未設定"
                className="w-36"
              />
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="shrink-0 font-medium text-foreground">場所</dt>
            <dd className="min-w-0">
              <InlineTextField
                key={`${course.id}-location`}
                value={course.location}
                onSave={(v) => onUpdateCourse(course.id, "location", v)}
                ariaLabel="場所"
                placeholder="未設定"
                className="w-36"
              />
            </dd>
          </div>
        </dl>
      </header>

      <div
        className={cn(
          attendeeGridClass,
          "shrink-0 border-b border-border bg-muted/40 px-4 py-2 text-xs font-semibold text-foreground",
        )}
      >
        <span>従業員コード</span>
        <span>氏名</span>
        <span>所属コード</span>
        <span>所属</span>
      </div>

      <ScrollArea className={trainingScrollAreaClass}>
        {course.attendees.length === 0 ? (
          <p
            role="status"
            className="flex h-16 items-center justify-center text-sm text-muted-foreground"
          >
            受講者がいません
          </p>
        ) : (
          <ul
            role="listbox"
            aria-label="受講者一覧"
            className="flex flex-col"
          >
            {course.attendees.map((attendee, index) => {
              const selected = attendee.id === selectedAttendeeId;
              return (
                <li key={attendee.id} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    aria-label={`${attendee.name}、${attendee.employeeNumber}`}
                    onClick={() => onSelectAttendee(attendee.id)}
                    className={cn(
                      attendeeGridClass,
                      "w-full px-4 py-2.5 text-left text-sm transition-colors",
                      "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                      index % 2 === 1 && !selected && "bg-muted/30",
                      selected
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-muted/50",
                    )}
                  >
                    <span className="font-mono text-xs">
                      {attendee.employeeNumber}
                    </span>
                    <span className="truncate">{attendee.name}</span>
                    <span className="font-mono text-xs">
                      {attendee.departmentCode}
                    </span>
                    <span className="truncate">{attendee.department}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </ScrollArea>
    </section>
  );
}
