import { NextResponse } from "next/server"
import { Client } from "@line/bot-sdk"

// LINE Messaging APIの設定
const lineConfig = {
  channelSecret: process.env.LINE_CHANNEL_SECRET || "",
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || "",
}

// LINEクライアントの初期化
const client = new Client(lineConfig)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("Received webhook from LINE:", JSON.stringify(body))

    // イベントを処理
    const events = body.events

    if (events && events.length > 0) {
      for (const event of events) {
        // メッセージイベントの場合
        if (event.type === "message" && event.message.type === "text") {
          console.log(`Received message: ${event.message.text} from ${event.source.userId}`)

          // ユーザーIDをログに記録（開発時のみ）
          console.log(`User ID: ${event.source.userId}`)

          // メッセージに応じた返信
          if (event.message.text.includes("予約") || event.message.text.includes("キャンプ")) {
            await client.replyMessage(event.replyToken, {
              type: "text",
              text: "キャンプ場の予約状況を監視中です。空きが出たらお知らせします！",
            })
          } else {
            await client.replyMessage(event.replyToken, {
              type: "text",
              text: "こんにちは！キャンプ場の予約状況を監視するBotです。",
            })
          }
        }
      }
    }

    // LINEサーバーには200 OKを返す必要がある
    return NextResponse.json({ status: "success" })
  } catch (error) {
    console.error("Error processing LINE webhook:", error)
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 })
  }
}