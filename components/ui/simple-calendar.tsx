"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface SimpleCalendarProps {
  selectedDate?: Date
  onDateSelect?: (date: Date) => void
  minDate?: Date
}

export function SimpleCalendar({ selectedDate, onDateSelect, minDate }: SimpleCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date())

  // 月の最初の日と最後の日を取得
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

  // 月の最初の日の曜日（0: 日曜日, 1: 月曜日, ..., 6: 土曜日）
  const firstDayOfWeek = firstDayOfMonth.getDay()

  // カレンダーに表示する日付の配列を作成
  const daysInMonth = []

  // 前月の日を追加
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = new Date(firstDayOfMonth)
    day.setDate(day.getDate() - i)
    daysInMonth.push({ date: day, isCurrentMonth: false })
  }

  // 当月の日を追加
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    const day = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i)
    daysInMonth.push({ date: day, isCurrentMonth: true })
  }

  // 次月の日を追加（6週間分になるように）
  const remainingDays = 42 - daysInMonth.length
  for (let i = 1; i <= remainingDays; i++) {
    const day = new Date(lastDayOfMonth)
    day.setDate(day.getDate() + i)
    daysInMonth.push({ date: day, isCurrentMonth: false })
  }

  // 前月へ
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  // 次月へ
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  // 日付が選択可能かどうかを判定
  const isDateSelectable = (date: Date) => {
    if (minDate) {
      return date >= minDate
    }
    return true
  }

  // 日付が選択されているかどうかを判定
  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false
    return (
      date.getFullYear() === selectedDate.getFullYear() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getDate() === selectedDate.getDate()
    )
  }

  // 曜日の配列
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"]

  // 月の名前の配列
  const months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]

  return (
    <div className="p-3 bg-white rounded-md shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={goToPreviousMonth} className="h-7 w-7">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="font-medium">
          {currentMonth.getFullYear()}年{months[currentMonth.getMonth()]}
        </div>
        <Button variant="outline" size="icon" onClick={goToNextMonth} className="h-7 w-7">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdays.map((day, index) => (
          <div key={index} className="text-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((day, index) => (
          <button
            key={index}
            onClick={() => isDateSelectable(day.date) && onDateSelect?.(day.date)}
            disabled={!isDateSelectable(day.date)}
            className={`
              h-8 w-8 rounded-full flex items-center justify-center text-sm
              ${!day.isCurrentMonth ? "text-gray-300" : ""}
              ${isDateSelected(day.date) ? "bg-blue-500 text-white" : ""}
              ${!isDateSelectable(day.date) ? "text-gray-300 cursor-not-allowed" : "hover:bg-gray-100"}
            `}
          >
            {day.date.getDate()}
          </button>
        ))}
      </div>
    </div>
  )
}
