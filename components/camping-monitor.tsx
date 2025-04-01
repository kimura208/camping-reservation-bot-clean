"use client"

import type React from "react"

import { Loader2, Tent, Info } from "lucide-react"
import { useEffect, useState } from "react"

interface CampingMonitorProps {
  campingStatus: "available" | "unavailable" | "loading"
}

const CampingMonitor: React.FC<CampingMonitorProps> = ({ campingStatus }) => {
  const [message, setMessage] = useState("")

  useEffect(() => {
    switch (campingStatus) {
      case "available":
        setMessage("Camping is available!")
        break
      case "unavailable":
        setMessage("Camping is currently unavailable.")
        break
      case "loading":
        setMessage("Checking camping availability...")
        break
      default:
        setMessage("Unknown camping status.")
    }
  }, [campingStatus])

  return (
    <div className="flex items-center justify-center p-4 border rounded-md shadow-sm bg-white">
      {campingStatus === "loading" ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-gray-500" />
          <span className="text-sm text-gray-500">{message}</span>
        </>
      ) : campingStatus === "available" ? (
        <>
          <Tent className="mr-2 h-5 w-5 text-green-500" />
          <span className="text-sm text-green-500">{message}</span>
        </>
      ) : (
        <>
          <Info className="mr-2 h-5 w-5 text-red-500" />
          <span className="text-sm text-red-500">{message}</span>
        </>
      )}
    </div>
  )
}

export default CampingMonitor