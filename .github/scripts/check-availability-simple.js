// スクリプトの先頭に以下を追加
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const axios = require("axios");
const { Client } = require("@line/bot-sdk");

// LINE Messaging APIの設定
const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || "",
};

// LINEクライアントの初期化
const client = new Client(lineConfig);

// LINE通知を送信する関数
async function sendLineNotification(message) {
  try {
    // 環境変数からユーザーIDを取得
    const userId = process.env.LINE_USER_ID;

    if (!userId) {
      console.error("LINE_USER_ID is not set");
      return false;
    }

    // LINEメッセージを送信
    await client.pushMessage(userId, {
      type: "text",
      text: message,
    });

    console.log("LINE notification sent successfully");
    return true;
  } catch (error) {
    console.error("Error sending LINE notification:", error);
    return false;
  }
}

// キャンプ場の空き状況をチェックする関数（簡易版）
async function checkCampingAvailability(date) {
  try {
    console.log(`Checking availability for ${date}`);

    // 孫太郎オートキャンプ場の予約ページURL
    const reservePageUrl =
      process.env.NEXT_PUBLIC_CAMPING_URL ||
      "https://asp.hotel-story.ne.jp/ver3d/di/?hcod1=08300&hcod2=001&seek=on&def=seek";

    console.log(`Accessing reserve page: ${reservePageUrl}`);

    // ユーザーエージェントを設定してブラウザのように見せる
    const response = await axios.get(reservePageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml",
        "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
      },
      timeout: 60000, // タイムアウトを60秒に設定
    });

    const html = response.data;
    console.log("Response received, analyzing HTML...");

    // 日付文字列を整形（例: 2025-07-26 → 2025年7月26日）
    const dateParts = date.split("-");
    const formattedDate = `${dateParts[0]}年${parseInt(dateParts[1])}月${parseInt(dateParts[2])}日`;
    console.log(`Looking for date: ${formattedDate}`);

    // 日付が含まれているかチェック
    if (html.includes(formattedDate)) {
      console.log(`Date ${formattedDate} found in HTML`);
      
      // 空き状況を示すキーワードを探す
      if (html.includes("空き") || html.includes("予約可能") || html.includes("○")) {
        console.log("Availability keywords found");
        return {
          isAvailable: true,
          date,
          url: reservePageUrl,
        };
      }
    }

    console.log("No availability found");
    return {
      isAvailable: false,
      date,
      url: reservePageUrl,
    };
  } catch (error) {
    console.error("Error checking camping availability:", error);
    return {
      isAvailable: false,
      error: "チェック中にエラーが発生しました",
      date,
      url: reservePageUrl,
    };
  }
}

// メイン処理
async function main() {
  try {
    // 環境変数から情報を取得
    const checkDate = process.env.NEXT_PUBLIC_CHECK_DATE || "2025-07-26";

    console.log(`Starting availability check for date: ${checkDate}`);
    console.log(`Current time: ${new Date().toISOString()}`);

    // 実際にキャンプ場の空き状況をチェック
    const result = await checkCampingAvailability(checkDate);

    // 空きがあった場合、LINE通知を送信
    if (result.isAvailable) {
      const message = `🏕️ ${checkDate}の孫太郎オートキャンプ場に空きが出ました！
今すぐ予約しましょう！
予約ページ: ${result.url}`;
      await sendLineNotification(message);
      console.log("空きが見つかりました！通知を送信しました。");
    } else {
      console.log("空きはありませんでした。");
    }

    console.log("Availability check completed");
  } catch (error) {
    console.error("Error in main process:", error);
    // メイン処理でエラーが発生した場合もLINE通知を送信
    await sendLineNotification(`⚠️ 監視システムでエラーが発生しました: ${error.message}`);
  }
}

// スクリプトを実行
main();