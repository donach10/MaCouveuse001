"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Shield, LogOut, Settings, Bell } from "lucide-react"

interface UserData {
  id: number
  name: string
  email: string
  role: string
  avatar: string
  permissions: string[]
}

interface UserHeaderProps {
  onLogout: () => void
}

export default function UserHeader({ onLogout }: UserHeaderProps) {
  const [user, setUser] = useState<UserData | null>(null)
  const [userType, setUserType] = useState<string>("")

  useEffect(() => {
    const userData = localStorage.getItem("user")
    const type = localStorage.getItem("userType")

    if (userData && type) {
      setUser(JSON.parse(userData))
      setUserType(type)
    }
  }, [])

  if (!user) return null

  const getRoleIcon = () => {
    return userType === "admin" ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />
  }

  const getRoleBadge = () => {
    return userType === "admin" ? (
      <Badge variant="default">Administrateur</Badge>
    ) : (
      <Badge variant="secondary">Utilisateur</Badge>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      {/* Notifications */}
      <Button variant="ghost" size="sm">
        <Bell className="w-4 h-4" />
      </Button>

      {/* Badge de rôle */}
      {getRoleBadge()}

      {/* Menu utilisateur */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback>
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            {getRoleIcon()}
            <span className="ml-2">Mon profil</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="w-4 h-4" />
            <span className="ml-2">Paramètres</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout}>
            <LogOut className="w-4 h-4" />
            <span className="ml-2">Se déconnecter</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
