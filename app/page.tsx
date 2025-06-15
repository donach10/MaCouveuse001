"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import UserHeader from "@/components/user-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Thermometer,
  Droplets,
  Wind,
  RotateCcw,
  Users,
  Egg,
  TrendingUp,
  Battery,
  Wifi,
  Gauge,
  Download,
  CalendarCheck,
  User,
  Bell,
  Shield,
  Plus,
  Eye,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

// Importer les nouveaux composants
import CapacityOverview from "@/components/capacity-overview"
import AdminPanel from "@/components/admin-panel"
import AlertSystem from "@/components/alert-system"

// Types pour les données
type EggStatus = "healthy" | "attention" | "critical"
type EggData = {
  id: number
  species: string
  user: string
  day: number
  totalDays: number
  status: EggStatus
  hatchDate: string
}

// Données simulées pour les paramètres en temps réel
const generateRealtimeData = () => ({
  temperature: 37.5 + (Math.random() - 0.5) * 0.2,
  humidity: 60 + (Math.random() - 0.5) * 4,
  co2: 350 + Math.random() * 200, // Génère entre 350-550 ppm
  lastRotation: new Date(Date.now() - Math.random() * 3600000),
  batteryLevel: 85 + Math.random() * 15,
  wifiStrength: 75 + Math.random() * 25,
})

// Fonction pour simuler des conditions critiques (pour test)
const generateCriticalData = () => {
  const scenarios = [
    { temperature: 41.2, humidity: 58, co2: 450 }, // Température haute
    { temperature: 34.1, humidity: 62, co2: 480 }, // Température basse
    { temperature: 37.8, humidity: 59, co2: 650 }, // CO2 élevé
    { temperature: 37.5, humidity: 60, co2: 420 }, // Normal
  ]

  // 20% de chance d'avoir une condition critique
  if (Math.random() < 0.2) {
    const scenario = scenarios[Math.floor(Math.random() * 3)] // Exclure le scénario normal
    return {
      ...generateRealtimeData(),
      ...scenario,
    }
  }

  return generateRealtimeData()
}

// Données historiques simulées
const historicalData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}h`,
  temperature: 37.5 + Math.sin(i * 0.5) * 0.3,
  humidity: 60 + Math.cos(i * 0.3) * 3,
  co2: 450 + Math.sin(i * 0.2) * 50,
}))

// Capacité totale de la couveuse
const TOTAL_CAPACITY = 1056

// Données des œufs en incubation
const eggData: EggData[] = [
  { id: 1, species: "Poule", user: "Marie L.", day: 18, totalDays: 21, status: "healthy", hatchDate: "2024-01-20" },
  { id: 2, species: "Canard", user: "Pierre M.", day: 25, totalDays: 28, status: "healthy", hatchDate: "2024-01-22" },
  { id: 3, species: "Caille", user: "Sophie D.", day: 15, totalDays: 18, status: "attention", hatchDate: "2024-01-18" },
  { id: 4, species: "Poule", user: "Jean R.", day: 12, totalDays: 21, status: "healthy", hatchDate: "2024-01-25" },
  { id: 5, species: "Oie", user: "Claire B.", day: 20, totalDays: 30, status: "healthy", hatchDate: "2024-01-28" },
  { id: 6, species: "Poule", user: "Marc D.", day: 8, totalDays: 21, status: "healthy", hatchDate: "2024-01-30" },
  { id: 7, species: "Canard", user: "Lisa M.", day: 14, totalDays: 28, status: "attention", hatchDate: "2024-01-26" },
  { id: 8, species: "Caille", user: "Paul R.", day: 16, totalDays: 18, status: "healthy", hatchDate: "2024-01-19" },
]

// Simuler un nombre total d'œufs plus réaliste
const TOTAL_EGGS_IN_INCUBATION = 847
const REMAINING_CAPACITY = TOTAL_CAPACITY - TOTAL_EGGS_IN_INCUBATION

// Statistiques globales
const globalStats = [
  { name: "Éclosions réussies", value: 87, color: "#22c55e" },
  { name: "En cours", value: 13, color: "#3b82f6" },
]

// Fonction utilitaire pour formater la durée
const formatDuration = (date: Date) => {
  const hours = Math.floor((Date.now() - date.getTime()) / 3600000)
  const minutes = Math.floor(((Date.now() - date.getTime()) % 3600000) / 60000)
  return `${hours}h${minutes}min`
}

export default function SmartIncubatorDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userType, setUserType] = useState<string>("")
  const [realtimeData, setRealtimeData] = useState(generateRealtimeData())
  const [selectedUser, setSelectedUser] = useState("Tous")
  const [isRotating, setIsRotating] = useState(false)
  const [systemStatus, setSystemStatus] = useState<"optimal" | "warning" | "critical">("optimal")
  const [isLoading, setIsLoading] = useState(true)
  const [hasActiveAlerts, setHasActiveAlerts] = useState(false)

  // Vérification de l'authentification
  useEffect(() => {
    const userData = localStorage.getItem("user")
    const type = localStorage.getItem("userType")

    if (!userData || !type) {
      router.push("/login")
      return
    }

    setUser(JSON.parse(userData))
    setUserType(type)
    setIsLoading(false)
  }, [router])

  // Simulation des données en temps réel
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      const newData = generateCriticalData() // Utiliser la fonction avec conditions critiques
      setRealtimeData(newData)

      // Vérifier le statut du système
      if (newData.temperature < 37.4 || newData.temperature > 37.6 || newData.humidity < 55 || newData.humidity > 65) {
        setSystemStatus("warning")
      } else if (
        newData.temperature < 37.2 ||
        newData.temperature > 37.8 ||
        newData.humidity < 50 ||
        newData.humidity > 70
      ) {
        setSystemStatus("critical")
      } else {
        setSystemStatus("optimal")
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [user])

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("userType")
    router.push("/login")
  }

  const handleAcknowledgeAlert = (alertId: string) => {
    console.log(`Alerte ${alertId} acquittée`)
    // Ici vous pourriez envoyer une notification à un système externe
  }

  // Simuler le retournement des œufs
  const handleRotate = () => {
    setIsRotating(true)
    setTimeout(() => {
      setIsRotating(false)
      setRealtimeData((prev) => ({
        ...prev,
        lastRotation: new Date(),
      }))
    }, 3000)
  }

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status: EggStatus) => {
    switch (status) {
      case "healthy":
        return "bg-green-500"
      case "attention":
        return "bg-yellow-500"
      case "critical":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  // Affichage de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-amber-900">Couveuse Intelligente</h1>
            <p className="text-gray-600 text-amber-700">Système de surveillance et contrôle IoT</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge
              variant={
                systemStatus === "optimal" ? "default" : systemStatus === "warning" ? "secondary" : "destructive"
              }
            >
              <Gauge className="w-4 h-4 mr-1" />
              {systemStatus === "optimal" ? "Optimal" : systemStatus === "warning" ? "Attention" : "Critique"}
            </Badge>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Battery className="w-4 h-4" />
              <span>{Math.round(realtimeData.batteryLevel)}%</span>
              <Wifi className="w-4 h-4" />
              <span>{Math.round(realtimeData.wifiStrength)}%</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 border-l pl-4">
              <Egg className="w-4 h-4" />
              <span>
                {TOTAL_EGGS_IN_INCUBATION}/{TOTAL_CAPACITY}
              </span>
              <span className="text-xs">({REMAINING_CAPACITY} places libres)</span>
            </div>
            {hasActiveAlerts && (
              <div className="flex items-center space-x-1 text-red-600">
                <Bell className="w-4 h-4 animate-pulse" />
                <span className="text-sm font-medium">Alertes</span>
              </div>
            )}
            <UserHeader onLogout={handleLogout} />
          </div>
        </div>

        <Tabs defaultValue="surveillance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="surveillance">Surveillance</TabsTrigger>
            <TabsTrigger value="alertes">
              <div className="flex items-center space-x-1">
                <Bell className="w-4 h-4" />
                <span>Alertes</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="utilisateurs">Utilisateurs</TabsTrigger>
            <TabsTrigger value="collectif">Vue Collective</TabsTrigger>
            {userType === "admin" && <TabsTrigger value="administration">Administration</TabsTrigger>}
            {userType === "admin" && <TabsTrigger value="analyses">Analyses</TabsTrigger>}
          </TabsList>

          {/* Onglet Surveillance */}
          <TabsContent value="surveillance" className="space-y-6">
            {/* Paramètres en temps réel */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <Card className="bg-gradient-to-br from-red-50 to-orange-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Température</CardTitle>
                  <Thermometer className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{realtimeData.temperature.toFixed(1)}°C</div>
                  <p className="text-xs text-muted-foreground">Cible: 37.5°C ±0.1°C</p>
                  <Progress value={((realtimeData.temperature - 37) / 1) * 100} className="mt-2" />
                  {(realtimeData.temperature >= 40 || realtimeData.temperature <= 35) && (
                    <div className="mt-2 text-xs text-red-600 font-medium">⚠️ Seuil critique atteint</div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Humidité</CardTitle>
                  <Droplets className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{realtimeData.humidity.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">Cible: 60% ±3%</p>
                  <Progress value={realtimeData.humidity} className="mt-2" />
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">CO₂</CardTitle>
                  <Wind className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Math.round(realtimeData.co2)} ppm</div>
                  <p className="text-xs text-muted-foreground">Optimal: 300-500 ppm</p>
                  <Progress value={(realtimeData.co2 / 800) * 100} className="mt-2" />
                  {realtimeData.co2 >= 600 && (
                    <div className="mt-2 text-xs text-orange-600 font-medium">⚠️ Niveau élevé détecté</div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-violet-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Retournement</CardTitle>
                  <RotateCcw className={`h-4 w-4 text-purple-500 ${isRotating ? "animate-spin" : ""}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-bold">Dernier: {formatDuration(realtimeData.lastRotation)}</div>
                  {userType === "admin" ? (
                    <Button onClick={handleRotate} disabled={isRotating} className="w-full mt-2" size="sm">
                      {isRotating ? "En cours..." : "Retourner"}
                    </Button>
                  ) : (
                    <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Shield className="w-3 h-3" />
                        <span>Action réservée à l'administrateur</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-cyan-50 to-teal-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Oxygénation</CardTitle>
                  <Wind className="h-4 w-4 text-cyan-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-bold">Ventilation: Active</div>
                  {userType === "admin" ? (
                    <Button
                      onClick={() => {
                        // Simuler l'oxygénation/refroidissement
                        setRealtimeData((prev) => ({
                          ...prev,
                          co2: Math.max(300, prev.co2 - 50),
                          temperature: Math.max(35, prev.temperature - 0.5),
                        }))
                      }}
                      className="w-full mt-2"
                      size="sm"
                      variant="outline"
                    >
                      <Wind className="w-4 h-4 mr-1" />
                      Oxygéner/Refroidir
                    </Button>
                  ) : (
                    <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Shield className="w-3 h-3" />
                        <span>Action réservée à l'administrateur</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-red-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Chauffage</CardTitle>
                  <Thermometer className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-bold">
                    Résistance: {realtimeData.temperature > 37.5 ? "Active" : "Standby"}
                  </div>
                  {userType === "admin" ? (
                    <Button
                      onClick={() => {
                        // Simuler le chauffage
                        setRealtimeData((prev) => ({
                          ...prev,
                          temperature: Math.min(42, prev.temperature + 0.8),
                        }))
                      }}
                      className="w-full mt-2"
                      size="sm"
                      variant="outline"
                    >
                      <Thermometer className="w-4 h-4 mr-1" />
                      Chauffer
                    </Button>
                  ) : (
                    <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <Shield className="w-3 h-3" />
                        <span>Action réservée à l'administrateur</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Graphiques historiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Évolution Température & Humidité</CardTitle>
                  <CardDescription>Dernières 24 heures</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="temperature" stroke="#ef4444" name="Température (°C)" />
                      <Line type="monotone" dataKey="humidity" stroke="#3b82f6" name="Humidité (%)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Niveau CO₂</CardTitle>
                  <CardDescription>Qualité de l'air</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="co2" stroke="#22c55e" name="CO₂ (ppm)" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Onglet Alertes */}
          <TabsContent value="alertes" className="space-y-6">
            <AlertSystem
              currentTemperature={realtimeData.temperature}
              currentCO2={realtimeData.co2}
              onAcknowledgeAlert={handleAcknowledgeAlert}
            />
          </TabsContent>

          {/* Onglet Utilisateurs */}
          <TabsContent value="utilisateurs" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Mon Espace Personnel</h2>
              <div className="flex items-center space-x-2">
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exporter Historique
                </Button>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle Demande
                </Button>
              </div>
            </div>

            {/* Statistiques personnelles */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Couvées Totales</CardTitle>
                  <Egg className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">Depuis le début</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taux de Réussite</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">87%</div>
                  <p className="text-xs text-muted-foreground">Moyenne générale</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-50 to-orange-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Œufs Éclos</CardTitle>
                  <CheckCircle className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-xs text-muted-foreground">Total réussi</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-violet-50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Expérience</CardTitle>
                  <User className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8 mois</div>
                  <p className="text-xs text-muted-foreground">Membre depuis</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="current" className="space-y-4">
              <TabsList>
                <TabsTrigger value="current">Couvées en Cours</TabsTrigger>
                <TabsTrigger value="history">Historique</TabsTrigger>
                <TabsTrigger value="stats">Statistiques</TabsTrigger>
              </TabsList>

              {/* Couvées en cours */}
              <TabsContent value="current" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {eggData.map((egg) => (
                    <Card key={egg.id} className="bg-gradient-to-br from-amber-50 to-orange-50">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{egg.species}</CardTitle>
                          <Badge className={getStatusColor(egg.status)}>
                            {egg.status === "healthy" ? "Sain" : egg.status === "attention" ? "Attention" : "Critique"}
                          </Badge>
                        </div>
                        <CardDescription>Couvée #{egg.id} - Démarrée le 02/01/2024</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Egg className="w-4 h-4" />
                          <span className="text-sm">
                            Jour {egg.day}/{egg.totalDays}
                          </span>
                        </div>
                        <Progress value={(egg.day / egg.totalDays) * 100} className="h-2" />
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <CalendarCheck className="w-4 h-4" />
                          <span>Éclosion prévue: {egg.hatchDate}</span>
                        </div>

                        {/* Détails de la couvée */}
                        <div className="space-y-2 pt-2 border-t">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="font-medium">Œufs initial:</span>
                              <div>12 œufs</div>
                            </div>
                            <div>
                              <span className="font-medium">Après mirage:</span>
                              <div>10 œufs (83%)</div>
                            </div>
                            <div>
                              <span className="font-medium">Température moy:</span>
                              <div>37.4°C</div>
                            </div>
                            <div>
                              <span className="font-medium">Humidité moy:</span>
                              <div>61%</div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Recommandations:</h4>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {egg.status === "attention" ? (
                              <>
                                <li>• Surveiller la température</li>
                                <li>• Vérifier l'humidité</li>
                                <li>• Contrôler le retournement</li>
                              </>
                            ) : (
                              <>
                                <li>• Développement normal</li>
                                <li>• Continuer la surveillance</li>
                                <li>• Préparer l'éclosion</li>
                              </>
                            )}
                          </ul>
                        </div>

                        <Button variant="outline" className="w-full" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Voir Détails
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Historique des couvées */}
              <TabsContent value="history" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Historique de mes Couvées</CardTitle>
                    <CardDescription>Toutes vos couvées terminées avec leurs résultats</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Couvée terminée 1 */}
                      <div className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-emerald-50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-medium">Couvée Poules #11</h4>
                              <p className="text-sm text-gray-600">Terminée le 15/12/2023</p>
                            </div>
                          </div>
                          <Badge className="bg-green-500">Réussie</Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Œufs initial:</span>
                            <div className="text-lg font-bold">15</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Après mirage:</span>
                            <div className="text-lg font-bold">13 (87%)</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Éclos:</span>
                            <div className="text-lg font-bold text-green-600">12 (92%)</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Durée:</span>
                            <div className="text-lg font-bold">21 jours</div>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-green-200">
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span>Temp. moyenne: 37.5°C</span>
                            <span>Humidité moyenne: 60%</span>
                            <span>Retournements: 42</span>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-3 h-3 mr-1" />
                              Détails
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Couvée terminée 2 */}
                      <div className="border rounded-lg p-4 bg-gradient-to-r from-yellow-50 to-amber-50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                              <AlertTriangle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-medium">Couvée Canards #10</h4>
                              <p className="text-sm text-gray-600">Terminée le 28/11/2023</p>
                            </div>
                          </div>
                          <Badge className="bg-yellow-500">Partielle</Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Œufs initial:</span>
                            <div className="text-lg font-bold">10</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Après mirage:</span>
                            <div className="text-lg font-bold">8 (80%)</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Éclos:</span>
                            <div className="text-lg font-bold text-yellow-600">6 (75%)</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Durée:</span>
                            <div className="text-lg font-bold">28 jours</div>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-yellow-200">
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span>Temp. moyenne: 37.3°C</span>
                            <span>Humidité moyenne: 58%</span>
                            <span>Incident: Panne 2h</span>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-3 h-3 mr-1" />
                              Détails
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Couvée terminée 3 */}
                      <div className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-emerald-50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-medium">Couvée Cailles #9</h4>
                              <p className="text-sm text-gray-600">Terminée le 10/11/2023</p>
                            </div>
                          </div>
                          <Badge className="bg-green-500">Excellente</Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Œufs initial:</span>
                            <div className="text-lg font-bold">24</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Après mirage:</span>
                            <div className="text-lg font-bold">22 (92%)</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Éclos:</span>
                            <div className="text-lg font-bold text-green-600">21 (95%)</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Durée:</span>
                            <div className="text-lg font-bold">18 jours</div>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-green-200">
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span>Temp. moyenne: 37.6°C</span>
                            <span>Humidité moyenne: 62%</span>
                            <span>Conditions parfaites</span>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-3 h-3 mr-1" />
                              Détails
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Pagination */}
                      <div className="flex items-center justify-between pt-4">
                        <p className="text-sm text-gray-600">Affichage de 3 sur 9 couvées terminées</p>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            Précédent
                          </Button>
                          <Button variant="outline" size="sm">
                            Suivant
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Statistiques détaillées */}
              <TabsContent value="stats" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Graphique d'évolution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Évolution de mes Performances</CardTitle>
                      <CardDescription>Taux de réussite par couvée</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                          data={[
                            { couvee: "C1", taux: 85 },
                            { couvee: "C2", taux: 78 },
                            { couvee: "C3", taux: 92 },
                            { couvee: "C4", taux: 88 },
                            { couvee: "C5", taux: 95 },
                            { couvee: "C6", taux: 82 },
                            { couvee: "C7", taux: 90 },
                            { couvee: "C8", taux: 87 },
                            { couvee: "C9", taux: 95 },
                            { couvee: "C10", taux: 75 },
                            { couvee: "C11", taux: 92 },
                          ]}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="couvee" />
                          <YAxis domain={[60, 100]} />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="taux"
                            stroke="#22c55e"
                            strokeWidth={2}
                            name="Taux de réussite (%)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Répartition par espèce */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Répartition par Espèce</CardTitle>
                      <CardDescription>Mes couvées par type d'animal</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: "Poules", value: 45, color: "#f59e0b" },
                              { name: "Canards", value: 25, color: "#3b82f6" },
                              { name: "Cailles", value: 20, color: "#22c55e" },
                              { name: "Oies", value: 10, color: "#8b5cf6" },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {[
                              { name: "Poules", value: 45, color: "#f59e0b" },
                              { name: "Canards", value: 25, color: "#3b82f6" },
                              { name: "Cailles", value: 20, color: "#22c55e" },
                              { name: "Oies", value: 10, color: "#8b5cf6" },
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Statistiques détaillées */}
                <Card>
                  <CardHeader>
                    <CardTitle>Analyse Détaillée</CardTitle>
                    <CardDescription>Vos performances par catégorie</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium">Taux de Fertilité</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Poules</span>
                            <span className="font-bold">89%</span>
                          </div>
                          <Progress value={89} className="h-2" />
                          <div className="flex justify-between text-sm">
                            <span>Canards</span>
                            <span className="font-bold">82%</span>
                          </div>
                          <Progress value={82} className="h-2" />
                          <div className="flex justify-between text-sm">
                            <span>Cailles</span>
                            <span className="font-bold">94%</span>
                          </div>
                          <Progress value={94} className="h-2" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium">Taux d'Éclosion</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Poules</span>
                            <span className="font-bold">87%</span>
                          </div>
                          <Progress value={87} className="h-2" />
                          <div className="flex justify-between text-sm">
                            <span>Canards</span>
                            <span className="font-bold">79%</span>
                          </div>
                          <Progress value={79} className="h-2" />
                          <div className="flex justify-between text-sm">
                            <span>Cailles</span>
                            <span className="font-bold">92%</span>
                          </div>
                          <Progress value={92} className="h-2" />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium">Temps Moyen</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Poules</span>
                            <Badge variant="outline">21.2 jours</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Canards</span>
                            <Badge variant="outline">28.5 jours</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Cailles</span>
                            <Badge variant="outline">17.8 jours</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Onglet Vue Collective */}
          <TabsContent value="collectif" className="space-y-6">
            <CapacityOverview totalCapacity={TOTAL_CAPACITY} currentOccupancy={TOTAL_EGGS_IN_INCUBATION} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Statistiques Globales</CardTitle>
                  <CardDescription>Performance de la couveuse</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={globalStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {globalStats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Capacité de la Couveuse</CardTitle>
                  <CardDescription>Utilisation et disponibilité</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Capacité totale</span>
                      <Badge variant="outline">{TOTAL_CAPACITY} œufs</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">En incubation</span>
                      <Badge variant="default">{TOTAL_EGGS_IN_INCUBATION} œufs</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Places disponibles</span>
                      <Badge variant="secondary">{REMAINING_CAPACITY} œufs</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Taux d'occupation</span>
                        <span className="font-bold">
                          {Math.round((TOTAL_EGGS_IN_INCUBATION / TOTAL_CAPACITY) * 100)}%
                        </span>
                      </div>
                      <Progress value={(TOTAL_EGGS_IN_INCUBATION / TOTAL_CAPACITY) * 100} className="h-2" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Taux de réussite</span>
                      <span className="text-sm font-bold text-green-600">87%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Éclosions cette semaine</span>
                      <Badge>23</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Utilisateurs actifs</span>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">47</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Activité Communautaire</CardTitle>
                <CardDescription>Engagement des utilisateurs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{TOTAL_EGGS_IN_INCUBATION}</div>
                    <div className="text-sm text-gray-600">Œufs en incubation</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round((TOTAL_EGGS_IN_INCUBATION / TOTAL_CAPACITY) * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Taux d'occupation</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">47</div>
                    <div className="text-sm text-gray-600">Utilisateurs actifs</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Administration */}
          {userType === "admin" && (
            <TabsContent value="administration" className="space-y-6">
              <AdminPanel totalCapacity={TOTAL_CAPACITY} currentOccupancy={TOTAL_EGGS_IN_INCUBATION} />
            </TabsContent>
          )}

          {/* Onglet Analyses */}
          <TabsContent value="analyses" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Analyse Prédictive</CardTitle>
                  <CardDescription>Tendances et prévisions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Performance en amélioration (+5%)</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Recommandations système:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Calibrer le capteur d'humidité dans 3 jours</li>
                      <li>• Nettoyer les filtres à air la semaine prochaine</li>
                      <li>• Vérifier la batterie de secours</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Maintenance</CardTitle>
                  <CardDescription>Journal et planification</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Dernières interventions:</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>• 15/01 - Calibration capteurs</div>
                      <div>• 10/01 - Nettoyage système</div>
                      <div>• 05/01 - Mise à jour firmware</div>
                    </div>
                  </div>
                  <Button className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Exporter les données
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Métriques de Performance</CardTitle>
                <CardDescription>Indicateurs clés du système</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">99.2%</div>
                    <div className="text-sm text-gray-600">Disponibilité système</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">±0.1°C</div>
                    <div className="text-sm text-gray-600">Précision température</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">±2%</div>
                    <div className="text-sm text-gray-600">Précision humidité</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{"<"}3%</div>
                    <div className="text-sm text-gray-600">Taux de panne</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
