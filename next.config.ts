import type { NextConfig } from "next";
import path from "node:path";

// プロジェクトルートを明示する。次の事故を防ぐ目的:
//   1. 親ディレクトリ（ホーム直下など）に lockfile が紛れていると Next.js が
//      そこをワークスペースルートと誤認識し、`outputFileTracing` が想定外の範囲を辿る
//   2. モノレポに将来取り込まれた場合でも本ディレクトリが基準になる
const projectRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
  // Surge 静的公開のみ output: "export"。Vercel + DB では STATIC_EXPORT=true を付けない
  ...(process.env.STATIC_EXPORT === "true" ? { output: "export" as const } : {}),
  serverExternalPackages: ["@prisma/client", "@neondatabase/serverless", "ws"],
  turbopack: {
    root: projectRoot,
  },
  outputFileTracingRoot: projectRoot,
};

export default nextConfig;
