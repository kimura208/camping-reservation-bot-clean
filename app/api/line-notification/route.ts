import { NextResponse } from "next/server"
import { Client } from "@line/bot-sdk"

// LINE Messaging APIの設定
const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || "",
}

// LINEクライアントの初期化
const client = new Client(lineConfig)

export async function POST(request: Request) {
  try {
    const { message } = await request.json()

    // 環境変数からユーザーIDを取得
    const userId = process.env.LINE_USER_ID

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "LINE_USER_ID is not set",
        },
        { status: 400 },
      )
    }

    // LINEメッセージを送信
    await client.pushMessage(userId, {
      type: "text",
      text: message || "キャンプ場に空きが出ました！",
    })

    return NextResponse.json({
      success: true,
      message: "LINE notification sent successfully",
    })
  } catch (error) {
    console.error("Error sending LINE notification:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send LINE notification",
      },
      { status: 500 },
    )
  }
}
