import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

/** ステップ2: DB 接続確認用。ブラウザで /api/db-health を開く */
export async function GET() {
  try {
    const [trainingCount, employeeCount] = await Promise.all([
      prisma.training.count(),
      prisma.employee.count(),
    ]);

    return NextResponse.json({
      ok: true,
      message: "Neon への接続に成功しました",
      counts: {
        trainings: trainingCount,
        employees: employeeCount,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error";

    return NextResponse.json(
      {
        ok: false,
        message: "データベースに接続できません",
        hint: ".env.local に DATABASE_URL を設定し、npm run db:push を実行してください",
        error: message,
      },
      { status: 503 },
    );
  }
}
