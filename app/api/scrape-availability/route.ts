import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { url, date, cottageType } = await request.json()

    if (!url || !date) {
      return NextResponse.json({ error: "URLと日付は必須です" }, { status: 400 })
    }

    // モックデータを返す（テスト用）
    return NextResponse.json({
      available: Math.random() < 0.3, // 30%の確率で空きあり
      cottageType: cottageType || "typeA",
      cottageName: "テストコテージ",
      cottageId: "test-cottage-id"
    })
  } catch (error) {
    console.error("エラー:", error)
    return NextResponse.json({ error: "処理中にエラーが発生しました" }, { status: 500 })
  }
}