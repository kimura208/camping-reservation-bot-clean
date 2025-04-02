import { NextResponse } from "next/server"
import axios from "axios"
import * as cheerio from "cheerio"

export const dynamic = "force-dynamic"

// LINE通知を送信する関数
async function sendLineNotification(message: string) {
  try {
    // 自分のサーバーのLINE通知APIを呼び出す
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"

    const response = await fetch(`${baseUrl}/api/line-notification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    })

    const data = await response.json()
    return data.success
  } catch (error) {
    console.error("Error sending LINE notification:", error)
    return false
  }
}

// キャンプ場の空き状況をチェックする関数
async function checkCampingAvailability(url: string, date: string) {
  try {
    console.log(`Checking availability for ${date} at ${url}`)

    // キャンプ場のWebサイトにアクセス
    const response = await axios.get(url)
    const html = response.data
    const $ = cheerio.load(html)

    // ここに実際のスクレイピングロジックを実装
    // 例: 特定の日付の予約ボタンや「満室」表示を探す
    // 注意: 実際のサイト構造に合わせて調整が必要です

    // 例: 「予約可能」または「空き」というテキストを含む要素を探す
    const availabilityElements = $('*:contains("予約可能"), *:contains("空き")')

    // 指定した日付に関連する要素だけをフィルタリング
    // 注意: 実際のサイト構造に合わせて調整が必要です
    const dateElements = $(`*:contains("${date}")`)

    // 日付要素の近くに「予約可能」要素があるかチェック
    let isAvailable = false

    dateElements.each((i, dateEl) => {
      // 日付要素の親要素または近くの要素をチェック
      const parentEl = $(dateEl).parent()
      if (parentEl.text().includes("予約可能") || parentEl.text().includes("空き")) {
        isAvailable = true
      }
    })

    // デバッグ情報
    console.log(`Date elements found: ${dateElements.length}`)
    console.log(`Availability status: ${isAvailable ? "空きあり" : "満室"}`)

    return {
      isAvailable,
      date,
      url,
    }
  } catch (error) {
    console.error("Error checking camping availability:", error)
    return {
      isAvailable: false,
      error: "チェック中にエラーが発生しました",
      date,
      url,
    }
  }
}

export async function GET() {
  try {
    // 環境変数から情報を取得
    const campingUrl = process.env.NEXT_PUBLIC_CAMPING_URL || ""
    const checkDate = process.env.NEXT_PUBLIC_CHECK_DATE || ""

    if (!campingUrl || !checkDate) {
      return NextResponse.json(
        {
          success: false,
          error: "環境変数が設定されていません",
        },
        { status: 400 },
      )
    }

    // 実際にキャンプ場の空き状況をチェック
    const result = await checkCampingAvailability(campingUrl, checkDate)

    // 空きがあった場合、LINE通知を送信
    if (result.isAvailable) {
      const message = `${checkDate}の孫太郎オートキャンプ場に空きが出ました！\n今すぐ予約しましょう！\n予約ページ: ${campingUrl}`
      await sendLineNotification(message)
      console.log("空きが見つかりました！通知を送信しました。")
    } else {
      console.log("空きはありませんでした。")
    }

    return NextResponse.json({
      success: true,
      message: "Availability check completed",
      result,
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