"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, User, Shield, Egg, Lock } from "lucide-react"

interface LoginFormProps {
  onLogin: (userType: "admin" | "user", userData: any) => void
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    userType: "user" as "admin" | "user",
  })

  // Comptes de démonstration
  const demoAccounts = {
    admin: {
      email: "admin@couveuse.fr",
      password: "admin123",
      name: "Administrateur Système",
      role: "admin",
    },
    user: {
      email: "marie.laurent@email.fr",
      password: "user123",
      name: "Marie Laurent",
      role: "user",
    },
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulation d'une authentification
    setTimeout(() => {
      const account = demoAccounts[formData.userType]

      if (formData.email === account.email && formData.password === account.password) {
        onLogin(formData.userType, {
          id: formData.userType === "admin" ? 1 : 2,
          name: account.name,
          email: account.email,
          role: account.role,
          avatar: `/placeholder.svg?height=40&width=40`,
          permissions:
            formData.userType === "admin"
              ? ["read", "write", "delete", "manage_users", "system_control"]
              : ["read", "write_own"],
        })
      } else {
        setError("Email ou mot de passe incorrect")
      }
      setIsLoading(false)
    }, 1500)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const fillDemoCredentials = (type: "admin" | "user") => {
    const account = demoAccounts[type]
    setFormData({
      email: account.email,
      password: account.password,
      userType: type,
    })
    setError("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo et titre */}
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center">
            <Egg className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Couveuse Intelligente</h1>
          <p className="text-gray-600">Système IoT de surveillance d'incubation</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Connexion</CardTitle>
            <CardDescription>Accédez à votre espace de surveillance</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={formData.userType} onValueChange={(value) => handleInputChange("userType", value)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="user" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Utilisateur</span>
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Admin</span>
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="votre@email.fr"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Connexion...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Lock className="w-4 h-4" />
                      <span>Se connecter</span>
                    </div>
                  )}
                </Button>
              </form>

              {/* Comptes de démonstration */}
              <div className="mt-6 space-y-3">
                <div className="text-sm text-gray-600 text-center">Comptes de démonstration :</div>

                <TabsContent value="user" className="mt-2">
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => fillDemoCredentials("user")}
                    >
                      <User className="w-4 h-4 mr-2" />
                      <div className="text-left">
                        <div className="font-medium">Marie Laurent</div>
                        <div className="text-xs text-gray-500">marie.laurent@email.fr</div>
                      </div>
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="admin" className="mt-2">
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => fillDemoCredentials("admin")}
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      <div className="text-left">
                        <div className="font-medium">Administrateur</div>
                        <div className="text-xs text-gray-500">admin@couveuse.fr</div>
                      </div>
                    </Button>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Informations sur les rôles */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <h3 className="font-medium text-sm">Rôles et permissions :</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="w-3 h-3" />
                    <span>Utilisateur</span>
                  </div>
                  <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-cyan-500">
                    Suivi personnel
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-3 h-3" />
                    <span>Administrateur</span>
                  </div>
                  <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-indigo-500">
                    Contrôle total
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
