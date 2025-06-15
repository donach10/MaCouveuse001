"use client"

import { useState, useEffect } from "react"
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Alert } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Icon from "react-native-vector-icons/MaterialIcons"
import { LineChart } from "react-native-chart-kit"
import { Dimensions } from "react-native"

const screenWidth = Dimensions.get("window").width

// Données simulées
const generateRealtimeData = () => ({
  temperature: 37.5 + (Math.random() - 0.5) * 0.2,
  humidity: 60 + (Math.random() - 0.5) * 4,
  co2: 350 + Math.random() * 200,
  lastRotation: new Date(Date.now() - Math.random() * 3600000),
  batteryLevel: 85 + Math.random() * 15,
  wifiStrength: 75 + Math.random() * 25,
})

const generateCriticalData = () => {
  const scenarios = [
    { temperature: 41.2, humidity: 58, co2: 450 },
    { temperature: 34.1, humidity: 62, co2: 480 },
    { temperature: 37.8, humidity: 59, co2: 650 },
    { temperature: 37.5, humidity: 60, co2: 420 },
  ]

  if (Math.random() < 0.2) {
    const scenario = scenarios[Math.floor(Math.random() * 3)]
    return {
      ...generateRealtimeData(),
      ...scenario,
    }
  }

  return generateRealtimeData()
}

const historicalData = Array.from({ length: 24 }, (_, i) => ({
  time: `${i}h`,
  temperature: 37.5 + Math.sin(i * 0.5) * 0.3,
  humidity: 60 + Math.cos(i * 0.3) * 3,
  co2: 450 + Math.sin(i * 0.2) * 50,
}))

export default function DashboardScreen() {
  const [realtimeData, setRealtimeData] = useState(generateRealtimeData())
  const [userType, setUserType] = useState("")
  const [isRotating, setIsRotating] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [systemStatus, setSystemStatus] = useState<"optimal" | "warning" | "critical">("optimal")

  useEffect(() => {
    getUserType()
    const interval = setInterval(() => {
      const newData = generateCriticalData()
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
  }, [])

  const getUserType = async () => {
    try {
      const type = await AsyncStorage.getItem("userType")
      if (type) {
        setUserType(type)
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du type d'utilisateur:", error)
    }
  }

  const handleRotate = () => {
    if (userType !== "admin") {
      Alert.alert("Accès refusé", "Cette action est réservée aux administrateurs")
      return
    }

    setIsRotating(true)
    setTimeout(() => {
      setIsRotating(false)
      setRealtimeData((prev) => ({
        ...prev,
        lastRotation: new Date(),
      }))
      Alert.alert("Succès", "Retournement des œufs effectué")
    }, 3000)
  }

  const handleSystemAction = (action: string) => {
    if (userType !== "admin") {
      Alert.alert("Accès refusé", "Cette action est réservée aux administrateurs")
      return
    }

    Alert.alert("Confirmation", `Voulez-vous vraiment ${action} ?`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Confirmer",
        onPress: () => {
          if (action === "oxygéner/refroidir") {
            setRealtimeData((prev) => ({
              ...prev,
              co2: Math.max(300, prev.co2 - 50),
              temperature: Math.max(35, prev.temperature - 0.5),
            }))
          } else if (action === "chauffer") {
            setRealtimeData((prev) => ({
              ...prev,
              temperature: Math.min(42, prev.temperature + 0.8),
            }))
          }
          Alert.alert("Succès", `Action "${action}" effectuée`)
        },
      },
    ])
  }

  const onRefresh = () => {
    setRefreshing(true)
    setTimeout(() => {
      setRealtimeData(generateCriticalData())
      setRefreshing(false)
    }, 1000)
  }

  const formatDuration = (date: Date) => {
    const hours = Math.floor((Date.now() - date.getTime()) / 3600000)
    const minutes = Math.floor(((Date.now() - date.getTime()) % 3600000) / 60000)
    return `${hours}h${minutes}min`
  }

  const getStatusColor = () => {
    switch (systemStatus) {
      case "optimal":
        return "#10b981"
      case "warning":
        return "#f59e0b"
      case "critical":
        return "#ef4444"
      default:
        return "#6b7280"
    }
  }

  const getStatusText = () => {
    switch (systemStatus) {
      case "optimal":
        return "Optimal"
      case "warning":
        return "Attention"
      case "critical":
        return "Critique"
      default:
        return "Inconnu"
    }
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* En-tête avec statut système */}
      <View style={styles.header}>
        <View style={styles.statusContainer}>
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
          <Text style={styles.statusText}>Système {getStatusText()}</Text>
        </View>
        <View style={styles.systemInfo}>
          <View style={styles.infoItem}>
            <Icon name="battery-std" size={16} color="#6b7280" />
            <Text style={styles.infoText}>{Math.round(realtimeData.batteryLevel)}%</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="wifi" size={16} color="#6b7280" />
            <Text style={styles.infoText}>{Math.round(realtimeData.wifiStrength)}%</Text>
          </View>
        </View>
      </View>

      {/* Paramètres en temps réel */}
      <View style={styles.parametersContainer}>
        <Text style={styles.sectionTitle}>Paramètres en Temps Réel</Text>

        <View style={styles.parametersGrid}>
          {/* Température */}
          <View style={[styles.parameterCard, styles.temperatureCard]}>
            <View style={styles.parameterHeader}>
              <Icon name="thermostat" size={24} color="#ef4444" />
              <Text style={styles.parameterTitle}>Température</Text>
            </View>
            <Text style={styles.parameterValue}>{realtimeData.temperature.toFixed(1)}°C</Text>
            <Text style={styles.parameterTarget}>Cible: 37.5°C ±0.1°C</Text>
            {(realtimeData.temperature >= 40 || realtimeData.temperature <= 35) && (
              <Text style={styles.criticalAlert}>⚠️ Seuil critique atteint</Text>
            )}
          </View>

          {/* Humidité */}
          <View style={[styles.parameterCard, styles.humidityCard]}>
            <View style={styles.parameterHeader}>
              <Icon name="water-drop" size={24} color="#3b82f6" />
              <Text style={styles.parameterTitle}>Humidité</Text>
            </View>
            <Text style={styles.parameterValue}>{realtimeData.humidity.toFixed(1)}%</Text>
            <Text style={styles.parameterTarget}>Cible: 60% ±3%</Text>
          </View>

          {/* CO₂ */}
          <View style={[styles.parameterCard, styles.co2Card]}>
            <View style={styles.parameterHeader}>
              <Icon name="air" size={24} color="#10b981" />
              <Text style={styles.parameterTitle}>CO₂</Text>
            </View>
            <Text style={styles.parameterValue}>{Math.round(realtimeData.co2)} ppm</Text>
            <Text style={styles.parameterTarget}>Optimal: 300-500 ppm</Text>
            {realtimeData.co2 >= 600 && <Text style={styles.warningAlert}>⚠️ Niveau élevé détecté</Text>}
          </View>

          {/* Retournement */}
          <View style={[styles.parameterCard, styles.rotationCard]}>
            <View style={styles.parameterHeader}>
              <Icon name="rotate-right" size={24} color="#8b5cf6" style={isRotating ? styles.rotating : {}} />
              <Text style={styles.parameterTitle}>Retournement</Text>
            </View>
            <Text style={styles.parameterValue}>{formatDuration(realtimeData.lastRotation)}</Text>
            <TouchableOpacity
              style={[
                styles.actionButton,
                isRotating && styles.actionButtonDisabled,
                userType !== "admin" && styles.actionButtonRestricted,
              ]}
              onPress={handleRotate}
              disabled={isRotating}
            >
              <Text style={styles.actionButtonText}>{isRotating ? "En cours..." : "Retourner"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Actions système (admin seulement) */}
      {userType === "admin" && (
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Actions Système</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.systemActionButton}
              onPress={() => handleSystemAction("oxygéner/refroidir")}
            >
              <Icon name="air" size={24} color="#06b6d4" />
              <Text style={styles.systemActionText}>Oxygéner/Refroidir</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.systemActionButton} onPress={() => handleSystemAction("chauffer")}>
              <Icon name="thermostat" size={24} color="#f59e0b" />
              <Text style={styles.systemActionText}>Chauffer</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Graphique historique */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>Évolution (24h)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <LineChart
            data={{
              labels: historicalData.slice(-12).map((d) => d.time),
              datasets: [
                {
                  data: historicalData.slice(-12).map((d) => d.temperature),
                  color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
                  strokeWidth: 2,
                },
                {
                  data: historicalData.slice(-12).map((d) => d.humidity),
                  color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
                  strokeWidth: 2,
                },
              ],
              legend: ["Température (°C)", "Humidité (%)"],
            }}
            width={screenWidth + 50}
            height={220}
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "4",
                strokeWidth: "2",
              },
            }}
            bezier
            style={styles.chart}
          />
        </ScrollView>
      </View>

      {/* Informations de capacité */}
      <View style={styles.capacityContainer}>
        <Text style={styles.sectionTitle}>Capacité de la Couveuse</Text>
        <View style={styles.capacityInfo}>
          <View style={styles.capacityItem}>
            <Icon name="egg" size={20} color="#f59e0b" />
            <Text style={styles.capacityText}>847/1056 œufs</Text>
          </View>
          <View style={styles.capacityItem}>
            <Icon name="people" size={20} color="#3b82f6" />
            <Text style={styles.capacityText}>47 utilisateurs actifs</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fef3c7",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#ffffff",
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  systemInfo: {
    flexDirection: "row",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
  },
  infoText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#6b7280",
  },
  parametersContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#92400e",
    marginBottom: 16,
  },
  parametersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  parameterCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  temperatureCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
  },
  humidityCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  co2Card: {
    borderLeftWidth: 4,
    borderLeftColor: "#10b981",
  },
  rotationCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#8b5cf6",
  },
  parameterHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  parameterTitle: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  parameterValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  parameterTarget: {
    fontSize: 12,
    color: "#6b7280",
  },
  criticalAlert: {
    fontSize: 12,
    color: "#ef4444",
    fontWeight: "600",
    marginTop: 4,
  },
  warningAlert: {
    fontSize: 12,
    color: "#f59e0b",
    fontWeight: "600",
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: "#8b5cf6",
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionButtonRestricted: {
    backgroundColor: "#d1d5db",
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  rotating: {
    transform: [{ rotate: "360deg" }],
  },
  actionsContainer: {
    padding: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  systemActionButton: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
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
  systemActionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  chartContainer: {
    padding: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  capacityContainer: {
    padding: 16,
    marginBottom: 20,
  },
  capacityInfo: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  capacityItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  capacityText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#374151",
  },
})
