import type React from "react"
import Image from "next/image"
import { Logo } from "@/components/ui/logo"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-10 flex-col justify-between">
        <div>
          <Logo width={180} height={48} />
          <p className="mt-2 text-blue-100">AI-powered exam grading for educators</p>
        </div>
        <div className="relative h-64 w-full">
          <Image
            src="/placeholder.svg?height=400&width=400"
            alt="Education illustration"
            fill
            className="object-contain"
            priority
          />
        </div>
        <div>
          <p className="text-sm text-blue-100">
            Grade exams faster and more consistently with our AI-powered platform. Support for Math, Physics, Biology,
            and Chemistry.
          </p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">{children}</div>
    </div>
  )
}
