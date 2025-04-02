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
async function checkCampingAvailability(baseUrl: string, date: string) {
  try {
    console.log(`Checking availability for ${date} at ${baseUrl}`)

    // フレームセットの代わりに直接プラン一覧ページにアクセス
    // URLを分析して適切なパラメータを設定
    // 例: ../planlist.asp?mode=seek&clmode=true&hcod1=08300&hcod2=001&reffrom=&hchannel=&kasho=
    const planlistUrl = `${baseUrl}/planlist.asp?mode=seek&clmode=true&hcod1=08300&hcod2=001`

    console.log(`Accessing plan list URL: ${planlistUrl}`)

    // ユーザーエージェントを設定してブラウザのように見せる
    const response = await axios.get(planlistUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml",
        "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
      },
    })

    const html = response.data
    console.log("Response received, parsing HTML...")

    // HTMLを解析
    const $ = cheerio.load(html)

    // デバッグ: ページのタイトルを出力
    console.log(`Page title: ${$("title").text()}`)

    // 日付文字列を整形（例: 2025-07-26 → 2025年7月26日）
    const dateParts = date.split("-")
    const formattedDate = `${dateParts[0]}年${Number.parseInt(dateParts[1])}月${Number.parseInt(dateParts[2])}日`
    console.log(`Looking for date: ${formattedDate}`)

    // 日付を含む要素を探す
    const dateElements = $(`*:contains("${formattedDate}")`)
    console.log(`Found ${dateElements.length} elements containing the date`)

    // 「空き」「予約可能」などのテキストを探す
    let availabilityFound = false

    dateElements.each((i, el) => {
      // 日付要素の周辺（親、兄弟、子要素）をチェック
      const parentEl = $(el).parent()
      const parentText = parentEl.text()

      console.log(`Element ${i} text: ${$(el).text()}`)
      console.log(`Parent text: ${parentText}`)

      // 「空き」「予約可能」「○」などの文字列を探す
      if (
        parentText.includes("空き") ||
        parentText.includes("予約可能") ||
        parentText.includes("○") ||
        // 「×」「満室」などがない場合も空きの可能性がある
        (!parentText.includes("×") && !parentText.includes("満室"))
      ) {
        availabilityFound = true
        console.log(`Availability found in element ${i}`)
      }
    })

    // 結果を返す
    return {
      isAvailable: availabilityFound,
      date,
      url: planlistUrl,
    }
  } catch (error) {
    console.error("Error checking camping availability:", error)
    return {
      isAvailable: false,
      error: "チェック中にエラーが発生しました",
      date,
      url: baseUrl,
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
      const message = `${checkDate}の孫太郎オートキャンプ場に空きが出ました！\n今すぐ予約しましょう！\n予約ページ: ${result.url}`
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