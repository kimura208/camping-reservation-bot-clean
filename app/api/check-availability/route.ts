import { NextResponse } from "next/server"

export const dynamic = "force_dynamic"

// GETメソッドを実装
export async function GET() {
  try {
    // 環境変数から情報を取得
    const checkDate = process.env.NEXT_PUBLIC_CHECK_DATE || "2025-07-26"

    // 簡略化したレスポンス
    return NextResponse.json({
      success: true,
      message: "Availability check endpoint is working",
      date: checkDate,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in check-availability API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check availability",
      },
      { status: 500 },
    )
  }
}

