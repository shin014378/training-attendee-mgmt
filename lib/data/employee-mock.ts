import type { Employee } from "@/lib/training-schema";

export const EMPLOYEE_MASTER: readonly Employee[] = [
  { employeeNumber: "E001", name: "山田 太郎", department: "営業部第1グループ", departmentCode: "1001" },
  { employeeNumber: "E002", name: "鈴木 花子", department: "人事部研修課", departmentCode: "2001" },
  { employeeNumber: "E003", name: "佐藤 一郎", department: "システム部開発課", departmentCode: "3001" },
  { employeeNumber: "E004", name: "田中 美咲", department: "営業部第2グループ", departmentCode: "1002" },
  { employeeNumber: "E005", name: "渡辺 健太", department: "管理部総務課", departmentCode: "4001" },
  { employeeNumber: "E006", name: "伊藤 由美", department: "システム部インフラ課", departmentCode: "3002" },
  { employeeNumber: "E007", name: "中村 浩二", department: "人事部採用課", departmentCode: "2002" },
  { employeeNumber: "E008", name: "小林 さくら", department: "営業部第1グループ", departmentCode: "1001" },
  { employeeNumber: "E009", name: "加藤 雄介", department: "管理部経理課", departmentCode: "4002" },
  { employeeNumber: "E010", name: "吉田 恵子", department: "システム部開発課", departmentCode: "3001" },
];

export function findEmployee(employeeNumber: string): Employee | null {
  const normalized = employeeNumber.trim().toUpperCase();
  return (
    EMPLOYEE_MASTER.find((e) => e.employeeNumber === normalized) ?? null
  );
}
