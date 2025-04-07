export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8">
      <div className="w-full max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">紀北町の孫太郎オートキャンプ場 予約BOT</h1>
        <p className="text-gray-600 mb-8">
          2025年7月26日のコテージの空き状況を監視し、キャンセルが出たら自動的に予約します。
        </p>

        <div className="p-4 bg-white rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">監視状態</h2>
          <p className="text-green-600">GitHub Actionsで監視中です。空きが見つかり次第LINEに通知されます。</p>
        </div>
      </div>
    </main>
  )
}


