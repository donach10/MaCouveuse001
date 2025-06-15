"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle, Thermometer, Wind, Clock, CheckCircle, Bell, BellRing, History } from "lucide-react"

// Types pour les alertes
type AlertType = "temperature_high" | "temperature_low" | "co2_high" | "system_failure"
type AlertSeverity = "warning" | "critical" | "emergency"

interface SystemAlert {
  id: string
  type: AlertType
  severity: AlertSeverity
  title: string
  message: string
  value: number
  threshold: number
  startTime: Date
  duration: number // en minutes
  acknowledged: boolean
  resolvedTime?: Date
}

interface AlertSystemProps {
  currentTemperature: number
  currentCO2: number
  onAcknowledgeAlert: (alertId: string) => void
}

// Seuils d'alerte
const ALERT_THRESHOLDS = {
  temperature: {
    high: 40, // °C
    low: 35, // °C
    duration: 60, // minutes
  },
  co2: {
    high: 600, // ppm (au lieu de 800)
    duration: 30, // minutes
  },
}

export default function AlertSystem({ currentTemperature, currentCO2, onAcknowledgeAlert }: AlertSystemProps) {
  const [alerts, setAlerts] = useState<SystemAlert[]>([])
  const [temperatureHistory, setTemperatureHistory] = useState<{ time: Date; value: number }[]>([])
  const [co2History, setCO2History] = useState<{ time: Date; value: number }[]>([])
  const [selectedAlert, setSelectedAlert] = useState<SystemAlert | null>(null)
  const [showAlertDialog, setShowAlertDialog] = useState(false)

  // Surveiller les paramètres et créer des alertes
  useEffect(() => {
    const now = new Date()

    // Ajouter aux historiques
    setTemperatureHistory((prev) => [
      ...prev.slice(-120), // Garder les 2 dernières heures
      { time: now, value: currentTemperature },
    ])

    setCO2History((prev) => [
      ...prev.slice(-120), // Garder les 2 dernières heures
      { time: now, value: currentCO2 },
    ])
  }, [currentTemperature, currentCO2])

  // Vérifier les conditions d'alerte
  useEffect(() => {
    const checkAlerts = () => {
      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - ALERT_THRESHOLDS.temperature.duration * 60 * 1000)
      const thirtyMinAgo = new Date(now.getTime() - ALERT_THRESHOLDS.co2.duration * 60 * 1000)

      // Vérifier température haute
      const highTempPeriod = temperatureHistory.filter(
        (record) => record.time >= oneHourAgo && record.value >= ALERT_THRESHOLDS.temperature.high,
      )

      if (highTempPeriod.length >= 12 && !alerts.some((a) => a.type === "temperature_high" && !a.resolvedTime)) {
        // 12 mesures = 1 heure (mesure toutes les 5 minutes)
        const newAlert: SystemAlert = {
          id: `temp_high_${Date.now()}`,
          type: "temperature_high",
          severity: "emergency",
          title: "TEMPÉRATURE CRITIQUE ÉLEVÉE",
          message: `Température ≥ ${ALERT_THRESHOLDS.temperature.high}°C depuis plus d'une heure`,
          value: currentTemperature,
          threshold: ALERT_THRESHOLDS.temperature.high,
          startTime: highTempPeriod[0].time,
          duration: Math.round((now.getTime() - highTempPeriod[0].time.getTime()) / 60000),
          acknowledged: false,
        }
        setAlerts((prev) => [newAlert, ...prev])
      }

      // Vérifier température basse
      const lowTempPeriod = temperatureHistory.filter(
        (record) => record.time >= oneHourAgo && record.value <= ALERT_THRESHOLDS.temperature.low,
      )

      if (lowTempPeriod.length >= 12 && !alerts.some((a) => a.type === "temperature_low" && !a.resolvedTime)) {
        const newAlert: SystemAlert = {
          id: `temp_low_${Date.now()}`,
          type: "temperature_low",
          severity: "emergency",
          title: "TEMPÉRATURE CRITIQUE BASSE",
          message: `Température ≤ ${ALERT_THRESHOLDS.temperature.low}°C depuis plus d'une heure`,
          value: currentTemperature,
          threshold: ALERT_THRESHOLDS.temperature.low,
          startTime: lowTempPeriod[0].time,
          duration: Math.round((now.getTime() - lowTempPeriod[0].time.getTime()) / 60000),
          acknowledged: false,
        }
        setAlerts((prev) => [newAlert, ...prev])
      }

      // Vérifier CO2 élevé
      const highCO2Period = co2History.filter(
        (record) => record.time >= thirtyMinAgo && record.value >= ALERT_THRESHOLDS.co2.high,
      )

      if (highCO2Period.length >= 6 && !alerts.some((a) => a.type === "co2_high" && !a.resolvedTime)) {
        // 6 mesures = 30 minutes
        const newAlert: SystemAlert = {
          id: `co2_high_${Date.now()}`,
          type: "co2_high",
          severity: "critical",
          title: "NIVEAU CO₂ ÉLEVÉ",
          message: `CO₂ ≥ ${ALERT_THRESHOLDS.co2.high} ppm depuis plus de 30 minutes (optimal: 300-500 ppm)`,
          value: currentCO2,
          threshold: ALERT_THRESHOLDS.co2.high,
          startTime: highCO2Period[0].time,
          duration: Math.round((now.getTime() - highCO2Period[0].time.getTime()) / 60000),
          acknowledged: false,
        }
        setAlerts((prev) => [newAlert, ...prev])
      }

      // Résoudre les alertes si les conditions sont revenues à la normale
      setAlerts((prev) =>
        prev.map((alert) => {
          if (alert.resolvedTime) return alert

          let shouldResolve = false

          if (alert.type === "temperature_high" && currentTemperature < ALERT_THRESHOLDS.temperature.high) {
            shouldResolve = true
          } else if (alert.type === "temperature_low" && currentTemperature > ALERT_THRESHOLDS.temperature.low) {
            shouldResolve = true
          } else if (alert.type === "co2_high" && currentCO2 < ALERT_THRESHOLDS.co2.high) {
            shouldResolve = true
          }

          if (shouldResolve) {
            return { ...alert, resolvedTime: now }
          }

          return alert
        }),
      )
    }

    const interval = setInterval(checkAlerts, 5000) // Vérifier toutes les 5 secondes
    return () => clearInterval(interval)
  }, [temperatureHistory, co2History, currentTemperature, currentCO2, alerts])

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, acknowledged: true } : alert)))
    onAcknowledgeAlert(alertId)
  }

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case "temperature_high":
      case "temperature_low":
        return <Thermometer className="w-5 h-5" />
      case "co2_high":
        return <Wind className="w-5 h-5" />
      default:
        return <AlertTriangle className="w-5 h-5" />
    }
  }

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case "warning":
        return "border-amber-500 bg-amber-50 text-amber-800"
      case "critical":
        return "border-orange-500 bg-orange-50 text-orange-800"
      case "emergency":
        return "border-red-500 bg-red-50 text-red-800"
      default:
        return "border-gray-500 bg-gray-50 text-gray-800"
    }
  }

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case "warning":
        return <Badge className="bg-amber-500">Attention</Badge>
      case "critical":
        return <Badge className="bg-orange-500">Critique</Badge>
      case "emergency":
        return <Badge className="bg-red-500">Urgence</Badge>
      default:
        return <Badge>Info</Badge>
    }
  }

  const activeAlerts = alerts.filter((alert) => !alert.resolvedTime)
  const unacknowledgedAlerts = activeAlerts.filter((alert) => !alert.acknowledged)

  return (
    <div className="space-y-4">
      {/* Alertes actives en haut */}
      {activeAlerts.length > 0 && (
        <div className="space-y-2">
          {activeAlerts.map((alert) => (
            <Alert key={alert.id} className={`border-2 ${getSeverityColor(alert.severity)}`}>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">{getAlertIcon(alert.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <AlertTitle className="flex items-center space-x-2">
                      <span>{alert.title}</span>
                      {getSeverityBadge(alert.severity)}
                      {alert.severity === "emergency" && !alert.acknowledged && (
                        <BellRing className="w-4 h-4 text-red-500 animate-pulse" />
                      )}
                    </AlertTitle>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAlert(alert)
                          setShowAlertDialog(true)
                        }}
                      >
                        Détails
                      </Button>
                      {!alert.acknowledged && (
                        <Button size="sm" onClick={() => handleAcknowledgeAlert(alert.id)}>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Acquitter
                        </Button>
                      )}
                    </div>
                  </div>
                  <AlertDescription className="mt-2">
                    <div className="space-y-1">
                      <div>{alert.message}</div>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Durée: {alert.duration} min</span>
                        </span>
                        <span>Valeur actuelle: {alert.value.toFixed(1)}</span>
                        <span>Seuil: {alert.threshold}</span>
                      </div>
                    </div>
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          ))}
        </div>
      )}

      {/* Panneau de gestion des alertes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Système d'Alertes</span>
            {unacknowledgedAlerts.length > 0 && (
              <Badge className="bg-red-500">{unacknowledgedAlerts.length} non acquittées</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{activeAlerts.length}</div>
              <div className="text-sm text-gray-600">Alertes actives</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{unacknowledgedAlerts.length}</div>
              <div className="text-sm text-gray-600">Non acquittées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{alerts.filter((a) => a.resolvedTime).length}</div>
              <div className="text-sm text-gray-600">Résolues</div>
            </div>
          </div>

          {/* Seuils configurés */}
          <div className="space-y-3">
            <h4 className="font-medium">Seuils d'Alerte Configurés</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Thermometer className="w-4 h-4 text-red-500" />
                  <span className="font-medium">Température</span>
                </div>
                <div className="ml-6 space-y-1">
                  <div>• Haute: ≥ {ALERT_THRESHOLDS.temperature.high}°C</div>
                  <div>• Basse: ≤ {ALERT_THRESHOLDS.temperature.low}°C</div>
                  <div>• Durée: {ALERT_THRESHOLDS.temperature.duration} minutes</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Wind className="w-4 h-4 text-green-500" />
                  <span className="font-medium">CO₂</span>
                </div>
                <div className="ml-6 space-y-1">
                  <div>• Optimal: 300-500 ppm</div>
                  <div>• Seuil d'alerte: ≥ {ALERT_THRESHOLDS.co2.high} ppm</div>
                  <div>• Durée: {ALERT_THRESHOLDS.co2.duration} minutes</div>
                </div>
              </div>
            </div>
          </div>

          {/* Historique des alertes */}
          {alerts.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium mb-3 flex items-center space-x-2">
                <History className="w-4 h-4" />
                <span>Historique des Alertes</span>
              </h4>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {alerts
                    .slice()
                    .reverse()
                    .map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-3 rounded border ${alert.resolvedTime ? "bg-gray-50" : getSeverityColor(alert.severity)}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {getAlertIcon(alert.type)}
                            <span className="font-medium">{alert.title}</span>
                            {getSeverityBadge(alert.severity)}
                          </div>
                          <div className="text-xs text-gray-500">{alert.startTime.toLocaleString()}</div>
                        </div>
                        <div className="mt-1 text-sm">
                          {alert.message}
                          {alert.resolvedTime && (
                            <span className="text-green-600 ml-2">
                              (Résolue le {alert.resolvedTime.toLocaleString()})
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de détails d'alerte */}
      <Dialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {selectedAlert && getAlertIcon(selectedAlert.type)}
              <span>{selectedAlert?.title}</span>
            </DialogTitle>
            <DialogDescription>Détails de l'alerte système</DialogDescription>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Sévérité</Label>
                  <div>{getSeverityBadge(selectedAlert.severity)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Statut</Label>
                  <div>
                    {selectedAlert.resolvedTime ? (
                      <Badge className="bg-green-500">Résolue</Badge>
                    ) : selectedAlert.acknowledged ? (
                      <Badge className="bg-blue-500">Acquittée</Badge>
                    ) : (
                      <Badge className="bg-red-500">Active</Badge>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Message</Label>
                <div className="text-sm">{selectedAlert.message}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Valeur actuelle</Label>
                  <div className="text-sm">{selectedAlert.value.toFixed(1)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Seuil</Label>
                  <div className="text-sm">{selectedAlert.threshold}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Début</Label>
                  <div className="text-sm">{selectedAlert.startTime.toLocaleString()}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Durée</Label>
                  <div className="text-sm">{selectedAlert.duration} minutes</div>
                </div>
              </div>
              {selectedAlert.resolvedTime && (
                <div>
                  <Label className="text-sm font-medium">Résolue le</Label>
                  <div className="text-sm">{selectedAlert.resolvedTime.toLocaleString()}</div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAlertDialog(false)}>
              Fermer
            </Button>
            {selectedAlert && !selectedAlert.acknowledged && !selectedAlert.resolvedTime && (
              <Button
                onClick={() => {
                  handleAcknowledgeAlert(selectedAlert.id)
                  setShowAlertDialog(false)
                }}
              >
                Acquitter l'Alerte
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={`font-medium ${className}`}>{children}</div>
}
