"use client"

import { Button } from "@/components/ui/button"
import { signOutAction } from "@/actions/auth-actions"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function HRHeader() {
  const router = useRouter()

  const handleSignOut = async () => {
    const result = await signOutAction()
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success("Signed out successfully")
      router.push("/login")
      router.refresh()
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">HR Management</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </header>
  )
}
