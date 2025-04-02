"use client"

import { useState } from "react"
import { CalendarIcon, Hotel, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { ja } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { NotificationSettings } from "@/components/notification-settings"
import { cn } from "@/lib/utils"
import { checkAvailability, bookHotel } from "@/lib/hotel-service"

export function HotelMonitor() {
  const [hotelName, setHotelName] = useState("")
  const [hotelUrl, setHotelUrl] = useState("")
  const [checkInterval, setCheckInterval] = useState("5")
  const [date, setDate] = useState<Date>()
  const [guests, setGuests] = useState("2")
  const [rooms, setRooms] = useState("1")
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [autoBook, setAutoBook] = useState(true)
  const [status, setStatus] = useState<"idle" | "monitoring" | "found" | "booked" | "error">("idle")
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [monitoringId, setMonitoringId] = useState<NodeJS.Timeout | null>(null)

  const startMonitoring = () => {
    if (!hotelName || !hotelUrl || !date) {
      setStatus("error")
      return
    }

    setIsMonitoring(true)
    setStatus("monitoring")

    // 定期的に空室をチェック
    const id = setInterval(
      async () => {
        setLastChecked(new Date())
        try {
          // 実際のアプリケーションでは、ここで実際のホテル予約サイトをチェック
          const available = await checkAvailability(hotelUrl, date, Number.parseInt(guests), Number.parseInt(rooms))

          if (available) {
            setStatus("found")
            clearInterval(id)

            if (autoBook) {
              try {
                // 実際のアプリケーションでは、ここで実際に予約を行う
                await bookHotel(hotelUrl, date, Number.parseInt(guests), Number.parseInt(rooms))
                setStatus("booked")
              } catch (error) {
                console.error("予約に失敗しました", error)
                setStatus("error")
              }
            }
          }
        } catch (error) {
          console.error("空室チェックに失敗しました", error)
          setStatus("error")
          clearInterval(id)
          setIsMonitoring(false)
        }
      },
      Number.parseInt(checkInterval) * 60 * 1000,
    ) // 分をミリ秒に変換

    setMonitoringId(id)
  }

  const stopMonitoring = () => {
    if (monitoringId) {
      clearInterval(monitoringId)
    }
    setIsMonitoring(false)
    setStatus("idle")
  }

  return (
    <div className="grid gap-6">
      <Tabs defaultValue="monitor" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="monitor">監視設定</TabsTrigger>
          <TabsTrigger value="notifications">通知設定</TabsTrigger>
        </TabsList>
        <TabsContent value="monitor">
          <Card>
            <CardHeader>
              <CardTitle>ホテル監視設定</CardTitle>
              <CardDescription>監視したいホテルと日程を設定してください</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hotel-name">ホテル名</Label>
                <Input
                  id="hotel-name"
                  placeholder="例: ヒルトン東京"
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                  disabled={isMonitoring}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hotel-url">予約ページURL</Label>
                <Input
                  id="hotel-url"
                  placeholder="https://example.com/hotel/booking"
                  value={hotelUrl}
                  onChange={(e) => setHotelUrl(e.target.value)}
                  disabled={isMonitoring}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>チェックイン日</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                        disabled={isMonitoring}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "yyyy年MM月dd日", { locale: ja }) : "日付を選択"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="check-interval">チェック間隔（分）</Label>
                  <Select value={checkInterval} onValueChange={setCheckInterval} disabled={isMonitoring}>
                    <SelectTrigger id="check-interval">
                      <SelectValue placeholder="チェック間隔を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1分</SelectItem>
                      <SelectItem value="5">5分</SelectItem>
                      <SelectItem value="10">10分</SelectItem>
                      <SelectItem value="15">15分</SelectItem>
                      <SelectItem value="30">30分</SelectItem>
                      <SelectItem value="60">1時間</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guests">宿泊人数</Label>
                  <Select value={guests} onValueChange={setGuests} disabled={isMonitoring}>
                    <SelectTrigger id="guests">
                      <SelectValue placeholder="人数を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1人</SelectItem>
                      <SelectItem value="2">2人</SelectItem>
                      <SelectItem value="3">3人</SelectItem>
                      <SelectItem value="4">4人</SelectItem>
                      <SelectItem value="5">5人</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rooms">部屋数</Label>
                  <Select value={rooms} onValueChange={setRooms} disabled={isMonitoring}>
                    <SelectTrigger id="rooms">
                      <SelectValue placeholder="部屋数を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1部屋</SelectItem>
                      <SelectItem value="2">2部屋</SelectItem>
                      <SelectItem value="3">3部屋</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="auto-book" checked={autoBook} onCheckedChange={setAutoBook} disabled={isMonitoring} />
                <Label htmlFor="auto-book">空室が見つかったら自動予約する</Label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              {isMonitoring ? (
                <Button variant="destructive" onClick={stopMonitoring}>
                  監視を停止
                </Button>
              ) : (
                <Button onClick={startMonitoring}>監視を開始</Button>
              )}

              <div className="flex items-center gap-2">
                {status === "monitoring" && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    監視中
                  </Badge>
                )}
                {status === "found" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    空室あり
                  </Badge>
                )}
                {status === "booked" && (
                  <Badge variant="default" className="flex items-center gap-1">
                    予約完了
                  </Badge>
                )}
                {status === "error" && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    エラー
                  </Badge>
                )}
              </div>
            </CardFooter>
          </Card>

          {status !== "idle" && (
            <div className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>監視状況</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ホテル:</span>
                      <span>{hotelName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">チェックイン日:</span>
                      <span>{date ? format(date, "yyyy年MM月dd日", { locale: ja }) : "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">最終チェック:</span>
                      <span>{lastChecked ? format(lastChecked, "HH:mm:ss", { locale: ja }) : "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ステータス:</span>
                      <span>
                        {status === "monitoring" && "監視中"}
                        {status === "found" && "空室あり"}
                        {status === "booked" && "予約完了"}
                        {status === "error" && "エラー"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {status === "booked" && (
            <Alert className="mt-4">
              <Hotel className="h-4 w-4" />
              <AlertTitle>予約が完了しました！</AlertTitle>
              <AlertDescription>
                {hotelName}の{date ? format(date, "yyyy年MM月dd日", { locale: ja }) : ""}の予約が完了しました。
                予約確認メールをご確認ください。
              </AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>エラーが発生しました</AlertTitle>
              <AlertDescription>監視中にエラーが発生しました。設定を確認して再度お試しください。</AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}