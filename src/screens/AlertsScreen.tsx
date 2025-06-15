"use client"

import { useState, useEffect } from "react"
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, RefreshControl } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"

interface SystemAlert {
  id: string
  type: "temperature_high" | "temperature_low" | "co2_high" | "system_failure"
  severity: "warning" | "critical" | "emergency"
  title: string
  message: string
  value: number
  threshold: number
  startTime: Date
  duration: number
  acknowledged: boolean
  resolvedTime?: Date
}

const ALERT_THRESHOLDS = {
  temperature: {
    high: 40,
    low: 35,
    duration: 60,
  },
  co2: {
    high: 600,
    duration: 30,
  },
}

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<SystemAlert[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [currentTemperature] = useState(37.5 + (Math.random() - 0.5) * 0.4)
  const [currentCO2] = useState(400 + Math.random() * 200)

  useEffect(() => {
    // Générer quelques alertes de test
    const testAlerts: SystemAlert[] = [
      {
        id: "alert_1",
        type: "temperature_high",
        severity: "critical",
        title: "TEMPÉRATURE CRITIQUE ÉLEVÉE",
        message: "Température ≥ 40°C depuis plus d'une heure",
        value: 40.2,
        threshold: 40.0,
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
        duration: 120,
        acknowledged: false,
      },
      {
        id: "alert_2",
        type: "co2_high",
        severity: "warning",
        title: "NIVEAU CO₂ ÉLEVÉ",
        message: "CO₂ ≥ 600 ppm depuis plus de 30 minutes (optimal: 300-500 ppm)",
        value: 650,
        threshold: 600,
        startTime: new Date(Date.now() - 45 * 60 * 1000),
        duration: 45,
        acknowledged: true,
      },
      {
        id: "alert_3",
        type: "temperature_low",
        severity: "emergency",
        title: "TEMPÉRATURE CRITIQUE BASSE",
        message: "Température ≤ 35°C depuis plus d'une heure",
        value: 34.8,
        threshold: 35.0,
        startTime: new Date(Date.now() - 6 * 60 * 60 * 1000),
        duration: 360,
        acknowledged: true,
        resolvedTime: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
    ]
    setAlerts(testAlerts)
  }, [])

  const handleAcknowledgeAlert = (alertId: string) => {
    Alert.alert("Acquitter l'alerte", "Voulez-vous acquitter cette alerte ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Acquitter",
        onPress: () => {
          setAlerts((prev) => prev.map((alert) => (alert.id === alertId ? { ...alert, acknowledged: true } : alert)))
          Alert.alert("Succès", "Alerte acquittée")
        },
      },
    ])
  }

  const onRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setRefreshing(false)
    }, 1000)
  }

  const getAlertIcon = (type: SystemAlert["type"]) => {
    switch (type) {
      case "temperature_high":
      case "temperature_low":
        return "thermostat"
      case "co2_high":
        return "air"
      default:
        return "warning"
    }
  }

  const getSeverityColor = (severity: SystemAlert["severity"]) => {
    switch (severity) {
      case "warning":
        return "#f59e0b"
      case "critical":
        return "#f97316"
      case "emergency":
        return "#ef4444"
      default:
        return "#6b7280"
    }
  }

  const getSeverityText = (severity: SystemAlert["severity"]) => {
    switch (severity) {
      case "warning":
        return "Attention"
      case "critical":
        return "Critique"
      case "emergency":
        return "Urgence"
      default:
        return "Info"
    }
  }

  const activeAlerts = alerts.filter((alert) => !alert.resolvedTime)
  const unacknowledgedAlerts = activeAlerts.filter((alert) => !alert.acknowledged)

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Statistiques des alertes */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{activeAlerts.length}</Text>
          <Text style={styles.statLabel}>Alertes actives</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: "#f59e0b" }]}>{unacknowledgedAlerts.length}</Text>
          <Text style={styles.statLabel}>Non acquittées</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: "#10b981" }]}>{alerts.filter((a) => a.resolvedTime).length}</Text>
          <Text style={styles.statLabel}>Résolues</Text>
        </View>
      </View>

      {/* Alertes actives */}
      {activeAlerts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alertes Actives</Text>
          {activeAlerts.map((alert) => (
            <View key={alert.id} style={[styles.alertCard, { borderLeftColor: getSeverityColor(alert.severity) }]}>
              <View style={styles.alertHeader}>
                <View style={styles.alertTitleContainer}>
                  <Icon name={getAlertIcon(alert.type)} size={24} color={getSeverityColor(alert.severity)} />
                  <View style={styles.alertTitleText}>
                    <Text style={styles.alertTitle}>{alert.title}</Text>
                    <View style={styles.alertBadgeContainer}>
                      <View style={[styles.alertBadge, { backgroundColor: getSeverityColor(alert.severity) }]}>
                        <Text style={styles.alertBadgeText}>{getSeverityText(alert.severity)}</Text>
                      </View>
                      {alert.severity === "emergency" && !alert.acknowledged && (
                        <Icon name="notifications-active" size={16} color="#ef4444" />
                      )}
                    </View>
                  </View>
                </View>
                {!alert.acknowledged && (
                  <TouchableOpacity style={styles.acknowledgeButton} onPress={() => handleAcknowledgeAlert(alert.id)}>
                    <Icon name="check-circle" size={20} color="#10b981" />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.alertMessage}>{alert.message}</Text>

              <View style={styles.alertDetails}>
                <View style={styles.alertDetailItem}>
                  <Icon name="schedule" size={16} color="#6b7280" />
                  <Text style={styles.alertDetailText}>Durée: {alert.duration} min</Text>
                </View>
                <View style={styles.alertDetailItem}>
                  <Text style={styles.alertDetailText}>Valeur: {alert.value.toFixed(1)}</Text>
                </View>
                <View style={styles.alertDetailItem}>
                  <Text style={styles.alertDetailText}>Seuil: {alert.threshold}</Text>
                </View>
              </View>

              {alert.acknowledged && (
                <View style={styles.acknowledgedBanner}>
                  <Icon name="check-circle" size={16} color="#10b981" />
                  <Text style={styles.acknowledgedText}>Alerte acquittée</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Configuration des seuils */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seuils d'Alerte Configurés</Text>
        <View style={styles.thresholdsContainer}>
          <View style={styles.thresholdCard}>
            <View style={styles.thresholdHeader}>
              <Icon name="thermostat" size={20} color="#ef4444" />
              <Text style={styles.thresholdTitle}>Température</Text>
            </View>
            <View style={styles.thresholdDetails}>
              <Text style={styles.thresholdText}>• Haute: ≥ {ALERT_THRESHOLDS.temperature.high}°C</Text>
              <Text style={styles.thresholdText}>• Basse: ≤ {ALERT_THRESHOLDS.temperature.low}°C</Text>
              <Text style={styles.thresholdText}>• Durée: {ALERT_THRESHOLDS.temperature.duration} minutes</Text>
            </View>
          </View>

          <View style={styles.thresholdCard}>
            <View style={styles.thresholdHeader}>
              <Icon name="air" size={20} color="#10b981" />
              <Text style={styles.thresholdTitle}>CO₂</Text>
            </View>
            <View style={styles.thresholdDetails}>
              <Text style={styles.thresholdText}>• Optimal: 300-500 ppm</Text>
              <Text style={styles.thresholdText}>• Seuil d'alerte: ≥ {ALERT_THRESHOLDS.co2.high} ppm</Text>
              <Text style={styles.thresholdText}>• Durée: {ALERT_THRESHOLDS.co2.duration} minutes</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Historique des alertes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Historique des Alertes</Text>
        {alerts.map((alert) => (
          <View key={alert.id} style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <Icon
                name={getAlertIcon(alert.type)}
                size={20}
                color={alert.resolvedTime ? "#6b7280" : getSeverityColor(alert.severity)}
              />
              <View style={styles.historyTitleContainer}>
                <Text style={styles.historyTitle}>{alert.title}</Text>
                <Text style={styles.historyTime}>{alert.startTime.toLocaleString()}</Text>
              </View>
              <View
                style={[
                  styles.historyBadge,
                  {
                    backgroundColor: alert.resolvedTime ? "#10b981" : getSeverityColor(alert.severity),
                  },
                ]}
              >
                <Text style={styles.historyBadgeText}>
                  {alert.resolvedTime ? "Résolue" : getSeverityText(alert.severity)}
                </Text>
              </View>
            </View>
            <Text style={styles.historyMessage}>{alert.message}</Text>
            {alert.resolvedTime && (
              <Text style={styles.resolvedText}>Résolue le {alert.resolvedTime.toLocaleString()}</Text>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fef3c7",
  },
  statsContainer: {
    flexDirection: "row",
    padding: 16,
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ef4444",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#92400e",
    marginBottom: 16,
  },
  alertCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  alertTitleContainer: {
    flexDirection: "row",
    flex: 1,
  },
  alertTitleText: {
    marginLeft: 12,
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  alertBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  alertBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  alertBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  acknowledgeButton: {
    padding: 8,
  },
  alertMessage: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 12,
    lineHeight: 20,
  },
  alertDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  alertDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 4,
  },
  alertDetailText: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: 4,
  },
  acknowledgedBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  acknowledgedText: {
    marginLeft: 8,
    fontSize: 12,
    color: "#10b981",
    fontWeight: "600",
  },
  thresholdsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  thresholdCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  thresholdHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  thresholdTitle: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  thresholdDetails: {
    marginLeft: 28,
  },
  thresholdText: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  historyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  historyTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  historyTime: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  historyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  historyBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "600",
  },
  historyMessage: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: 32,
  },
  resolvedText: {
    fontSize: 12,
    color: "#10b981",
    marginLeft: 32,
    marginTop: 4,
    fontStyle: "italic",
  },
})
