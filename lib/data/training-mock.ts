import type { Training } from "@/lib/training-schema";

export const INITIAL_TRAININGS: Training[] = [
  {
    id: "t1",
    name: "アドバイザー研修",
    courses: [
      {
        id: "c1",
        name: "アドバイザー研修",
        date: "6/12",
        location: "201",
        attendees: [
          {
            id: "a1",
            employeeNumber: "E001",
            name: "山田 太郎",
            department: "営業部第1グループ",
            departmentCode: "1001",
          },
          {
            id: "a2",
            employeeNumber: "E003",
            name: "佐藤 一郎",
            department: "システム部開発課",
            departmentCode: "3001",
          },
        ],
      },
    ],
  },
  {
    id: "t2",
    name: "サブアドバイザー研修",
    courses: [
      {
        id: "c2",
        name: "Aコース",
        date: "6/14",
        location: "105",
        attendees: [
          {
            id: "a3",
            employeeNumber: "E005",
            name: "渡辺 健太",
            department: "管理部総務課",
            departmentCode: "4001",
          },
          {
            id: "a4",
            employeeNumber: "E007",
            name: "中村 浩二",
            department: "人事部採用課",
            departmentCode: "2002",
          },
        ],
      },
      {
        id: "c3",
        name: "Bコース",
        date: "6/18",
        location: "108",
        attendees: [
          {
            id: "a5",
            employeeNumber: "E008",
            name: "小林 さくら",
            department: "営業部第1グループ",
            departmentCode: "1001",
          },
        ],
      },
    ],
  },
  {
    id: "t3",
    name: "サークルリーダー研修",
    courses: [
      {
        id: "c4",
        name: "Aコース",
        date: "6/16",
        location: "106",
        attendees: [
          {
            id: "a6",
            employeeNumber: "E002",
            name: "鈴木 花子",
            department: "人事部研修課",
            departmentCode: "2001",
          },
          {
            id: "a7",
            employeeNumber: "E004",
            name: "田中 美咲",
            department: "営業部第2グループ",
            departmentCode: "1002",
          },
          {
            id: "a8",
            employeeNumber: "E006",
            name: "伊藤 由美",
            department: "システム部インフラ課",
            departmentCode: "3002",
          },
        ],
      },
      {
        id: "c5",
        name: "Bコース",
        date: "6/20",
        location: "110",
        attendees: [
          {
            id: "a9",
            employeeNumber: "E009",
            name: "加藤 雄介",
            department: "管理部経理課",
            departmentCode: "4002",
          },
          {
            id: "a10",
            employeeNumber: "E010",
            name: "吉田 恵子",
            department: "システム部開発課",
            departmentCode: "3001",
          },
        ],
      },
    ],
  },
];
