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
async function checkCampingAvailability(date: string) {
  try {
    console.log(`Checking availability for ${date}`)

    // 孫太郎オートキャンプ場の予約ページURLを設定
    // 注: 実際の予約ページURLは環境変数から取得するか、調査して正確なURLを設定する必要があります
    const reservePageUrl = "https://magotarou.com/reserve/"

    console.log(`Accessing reserve page: ${reservePageUrl}`)

    // ユーザーエージェントを設定してブラウザのように見せる
    const response = await axios.get(reservePageUrl, {
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

    // 予約ページから実際の予約システムへのリンクを探す
    const reserveLinks = $('a[href*="reserve"]')
    console.log(`Found ${reserveLinks.length} reserve links`)

    // リンクを出力（デバッグ用）
    reserveLinks.each((i, el) => {
      console.log(`Link ${i}: ${$(el).attr("href")}`)
    })

    // 実際の予約システムのURLを特定
    // 注: これは実際のサイト構造によって調整が必要です
    let actualReserveUrl = ""
    reserveLinks.each((i, el) => {
      const href = $(el).attr("href")
      if (href && (href.includes("asp.hotel-story") || href.includes("reservation"))) {
        actualReserveUrl = href
        console.log(`Found actual reservation system URL: ${actualReserveUrl}`)
        return false // eachループを抜ける
      }
    })

    // 予約システムのURLが見つからなかった場合
    if (!actualReserveUrl) {
      console.log("Could not find actual reservation system URL")
      return {
        isAvailable: false,
        error: "予約システムのURLが見つかりませんでした",
        date,
        url: reservePageUrl,
      }
    }

    // 実際の予約システムにアクセス
    console.log(`Accessing actual reservation system: ${actualReserveUrl}`)
    const reserveResponse = await axios.get(actualReserveUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml",
        "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
      },
    })

    const reserveHtml = reserveResponse.data
    const $reserve = cheerio.load(reserveHtml)

    // 日付文字列を整形（例: 2025-07-26 → 2025年7月26日）
    const dateParts = date.split("-")
    const formattedDate = `${dateParts[0]}年${Number.parseInt(dateParts[1])}月${Number.parseInt(dateParts[2])}日`
    console.log(`Looking for date: ${formattedDate}`)

    // 日付を含む要素を探す
    const dateElements = $reserve(`*:contains("${formattedDate}")`)
    console.log(`Found ${dateElements.length} elements containing the date`)

    // 「空き」「予約可能」などのテキストを探す
    let availabilityFound = false

    dateElements.each((i, el) => {
      // 日付要素の周辺（親、兄弟、子要素）をチェック
      const parentEl = $reserve(el).parent()
      const parentText = parentEl.text()

      console.log(`Element ${i} text: ${$reserve(el).text()}`)
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
      url: actualReserveUrl,
    }
  } catch (error) {
    console.error("Error checking camping availability:", error)
    return {
      isAvailable: false,
      error: "チェック中にエラーが発生しました",
      date,
      url: "https://magotarou.com/reserve/",
    }
  }
}

export async function GET() {
  try {
    // 環境変数から情報を取得
    const checkDate = process.env.NEXT_PUBLIC_CHECK_DATE || ""

    if (!checkDate) {
      return NextResponse.json(
        {
          success: false,
          error: "環境変数NEXT_PUBLIC_CHECK_DATEが設定されていません",
        },
        { status: 400 },
      )
    }

    // 実際にキャンプ場の空き状況をチェック
    const result = await checkCampingAvailability(checkDate)

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
