"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { sendCheckInReminder, sendCheckOutReminder } from "@/actions/notification-actions"
import { Bell, Send } from "lucide-react"

export default function SettingsPage() {
  const [isSendingCheckIn, setIsSendingCheckIn] = useState(false)
  const [isSendingCheckOut, setIsSendingCheckOut] = useState(false)

  const handleSendCheckInReminder = async () => {
    setIsSendingCheckIn(true)
    try {
      const result = await sendCheckInReminder()
      if (result.success) {
        toast.success(`Check-in reminders sent to ${result.count} employees`)
      } else if (result.error) {
        toast.error(result.error)
      }
    } finally {
      setIsSendingCheckIn(false)
    }
  }

  const handleSendCheckOutReminder = async () => {
    setIsSendingCheckOut(true)
    try {
      const result = await sendCheckOutReminder()
      if (result.success) {
        toast.success(`Check-out reminders sent to ${result.count} employees`)
      } else if (result.error) {
        toast.error(result.error)
      }
    } finally {
      setIsSendingCheckOut(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold mb-2">Settings</h2>
        <p className="text-muted-foreground">Manage system settings and notifications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Management
          </CardTitle>
          <CardDescription>Send reminders to employees about check-in and check-out</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h3 className="font-medium mb-1">Check-in Reminder</h3>
              <p className="text-sm text-muted-foreground">Send reminder to employees who haven't checked in today</p>
            </div>
            <Button onClick={handleSendCheckInReminder} disabled={isSendingCheckIn}>
              <Send className="h-4 w-4 mr-2" />
              Send Now
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-border rounded-lg">
            <div>
              <h3 className="font-medium mb-1">Check-out Reminder</h3>
              <p className="text-sm text-muted-foreground">Send reminder to employees who are still checked in</p>
            </div>
            <Button onClick={handleSendCheckOutReminder} disabled={isSendingCheckOut}>
              <Send className="h-4 w-4 mr-2" />
              Send Now
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Currency:</span>
            <span className="font-medium">NGN (Nigerian Naira)</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Timezone:</span>
            <span className="font-medium">Africa/Lagos</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Work Hours:</span>
            <span className="font-medium">09:00 - 17:00</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
