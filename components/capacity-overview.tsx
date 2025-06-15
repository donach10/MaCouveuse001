"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Egg, TrendingUp, AlertTriangle, Users } from "lucide-react"

interface CapacityOverviewProps {
  totalCapacity: number
  currentOccupancy: number
  className?: string
}

export default function CapacityOverview({ totalCapacity, currentOccupancy, className = "" }: CapacityOverviewProps) {
  const remainingCapacity = totalCapacity - currentOccupancy
  const occupancyRate = (currentOccupancy / totalCapacity) * 100
  const isNearCapacity = occupancyRate > 85
  const isCriticalCapacity = occupancyRate > 95

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Alerte de capacité */}
      {isNearCapacity && (
        <Alert variant={isCriticalCapacity ? "destructive" : "default"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {isCriticalCapacity
              ? `Capacité critique atteinte ! Seulement ${remainingCapacity} places restantes.`
              : `Attention : Capacité élevée (${occupancyRate.toFixed(1)}%). Planifiez les prochaines incubations.`}
          </AlertDescription>
        </Alert>
      )}

      {/* Carte principale de capacité */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Egg className="w-5 h-5" />
            <span>Capacité de la Couveuse</span>
          </CardTitle>
          <CardDescription>Gestion intelligente de l'espace d'incubation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Indicateurs principaux */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{totalCapacity}</div>
              <div className="text-xs text-gray-600">Capacité totale</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{currentOccupancy}</div>
              <div className="text-xs text-gray-600">En incubation</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-violet-600">{remainingCapacity}</div>
              <div className="text-xs text-gray-600">Places libres</div>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Taux d'occupation</span>
              <span className="font-bold">{occupancyRate.toFixed(1)}%</span>
            </div>
            <Progress
              value={occupancyRate}
              className={`h-3 ${isCriticalCapacity ? "bg-red-100" : isNearCapacity ? "bg-yellow-100" : "bg-green-100"}`}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span className="text-yellow-600">85%</span>
              <span className="text-red-600">95%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Détails supplémentaires */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Répartition par espèce</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Poules</span>
                  <Badge variant="outline" className="text-xs bg-amber-100 text-amber-800">
                    425
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Canards</span>
                  <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800">
                    312
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Cailles</span>
                  <Badge variant="outline" className="text-xs bg-green-100 text-green-800">
                    87
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Autres</span>
                  <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800">
                    23
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Prévisions</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span>156 éclosions prévues cette semaine</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3 text-blue-500" />
                  <span>12 nouvelles réservations</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
