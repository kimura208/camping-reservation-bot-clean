import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "API is working",
    timestamp: new Date().toISOString(),
    environment: {
      // 環境変数の存在確認（値は表示しない）
      hasCheckDate: !!process.env.NEXT_PUBLIC_CHECK_DATE,
      hasLineToken: !!process.env.LINE_CHANNEL_ACCESS_TOKEN,
      hasLineUserId: !!process.env.LINE_USER_ID,
      vercelUrl: process.env.VERCEL_URL || "not set",
    },
  })
}

