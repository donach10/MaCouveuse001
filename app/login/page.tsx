"use client"
import { useRouter } from "next/navigation"
import LoginForm from "@/components/login-form"

export default function LoginPage() {
  const router = useRouter()

  const handleLogin = (userType: "admin" | "user", userData: any) => {
    // Stocker les données utilisateur dans le localStorage
    localStorage.setItem("user", JSON.stringify(userData))
    localStorage.setItem("userType", userType)

    // Rediriger vers le dashboard
    router.push("/")
  }

  return <LoginForm onLogin={handleLogin} />
}
