import type React from "react"
import { Bell, Mail, Smartphone } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

// 空のpropsを使用しない場合は、インターフェースを定義せずにReact.FCだけを使用
const NotificationSettings: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>Manage your notification preferences.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid grid-cols-3 items-center gap-4">
          <Label htmlFor="email" className="text-right">
            Email
          </Label>
          <Switch id="email" defaultChecked />
          <Bell className="ml-2 h-4 w-4 text-muted-foreground" />
        </div>
        <div className="grid grid-cols-3 items-center gap-4">
          <Label htmlFor="push" className="text-right">
            Push Notifications
          </Label>
          <Switch id="push" />
          <Smartphone className="ml-2 h-4 w-4 text-muted-foreground" />
        </div>
        <div className="grid grid-cols-3 items-center gap-4">
          <Label htmlFor="sms" className="text-right">
            SMS
          </Label>
          <Switch id="sms" />
          <Mail className="ml-2 h-4 w-4 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  )
}

export default NotificationSettings