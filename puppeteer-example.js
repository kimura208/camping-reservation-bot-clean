// このファイルは実際のプロジェクトには含まれません。
// Puppeteerを使用したスクレイピングの例として参考にしてください。

import puppeteer from "puppeteer"

async function checkCampingAvailability(campingUrl, date, cottageType) {
  console.log(`キャンプ場の空き状況をチェック: ${campingUrl}, 日付: ${date}, タイプ: ${cottageType}`)

  // ブラウザを起動
  const browser = await puppeteer.launch({
    headless: "new", // 新しいヘッドレスモード
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  try {
    // 新しいページを開く
    const page = await browser.newPage()

    // ユーザーエージェントを設定（ボット対策）
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    )

    // ページに移動
    await page.goto(campingUrl, { waitUntil: "networkidle2" })
    console.log("ページを読み込みました")

    // デバッグ用にスクリーンショットを撮影
    await page.screenshot({ path: "camping-site.png" })

    // 日付選択フォームを探して入力
    // 注意: 実際のサイトの構造に合わせて調整が必要
    try {
      // 日付入力フィールドを探す（サイトによって異なる）
      await page.waitForSelector('input[type="date"], .date-picker, #date-input', { timeout: 5000 })
      await page.type('input[type="date"], .date-picker, #date-input', date)

      // 検索ボタンをクリック
      await page.click('button[type="submit"], .search-button, #search-button')

      // 結果が表示されるのを待つ
      await page.waitForSelector(".availability, .results, .cottage-list", { timeout: 10000 })

      // 結果ページのスクリーンショットを撮影
      await page.screenshot({ path: "results-page.png" })

      // 空き状況を確認
      const availability = await page.evaluate((cottageTypeParam) => {
        // 注意: 実際のサイトの構造に合わせて調整が必要
        const cottageElements = document.querySelectorAll(".cottage-item, .room-item, .availability-item")

        for (const element of Array.from(cottageElements)) {
          const cottageTypeElement = element.querySelector(".cottage-type, .room-type")
          const statusElement = element.querySelector(".status, .availability")
          const nameElement = element.querySelector(".cottage-name, .room-name")

          const cottageTypeText = cottageTypeElement ? cottageTypeElement.textContent : ""
          const statusText = statusElement ? statusElement.textContent : ""
          const nameText = nameElement ? nameElement.textContent : ""

          // 空き状況を確認（「空き」「予約可能」などの文字列を探す）
          const isAvailable =
            statusText &&
            (statusText.includes("空き") ||
              statusText.includes("予約可能") ||
              statusText.includes("Available") ||
              statusText.includes("available"))

          // コテージタイプをチェック
          const matchesType =
            cottageTypeParam === "any" || (cottageTypeText && cottageTypeText.includes(cottageTypeParam))

          if (isAvailable && matchesType) {
            return {
              available: true,
              cottageType: cottageTypeText?.trim() || "",
              cottageName: nameText?.trim() || "コテージ",
              cottageId: element.id || `cottage-${Math.random().toString(36).substring(2, 9)}`,
            }
          }
        }

        return { available: false }
      }, cottageType)

      console.log("空き状況:", availability)
      return availability
    } catch (error) {
      console.error("スクレイピング中にエラーが発生しました:", error)

      // スクレイピングに失敗した場合、ページのスクリーンショットを取得して調査
      await page.screenshot({ path: "error-screenshot.png" })

      return {
        available: false,
        error: "予約ページの解析に失敗しました。サイトの構造が変更された可能性があります。",
      }
    }
  } finally {
    // ブラウザを閉じる
    await browser.close()
  }
}

// 使用例
async function main() {
  const result = await checkCampingAvailability(
    "https://www.magotaro-camp.com/", // 実際のURLに置き換えてください
    "2025-07-26",
    "any",
  )

  console.log("結果:", result)
}

main().catch(console.error)