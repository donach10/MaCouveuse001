"use client"

import { useState } from "react"
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface EggBatch {
  id: number
  species: string
  day: number
  totalDays: number
  status: "healthy" | "attention" | "critical"
  hatchDate: string
  initialQuantity: number
  currentQuantity: number
  miragePerformed: boolean
  mirageDate?: string
  successRate?: number
}

const eggBatches: EggBatch[] = [
  {
    id: 1,
    species: "Poule",
    day: 18,
    totalDays: 21,
    status: "healthy",
    hatchDate: "2024-01-20",
    initialQuantity: 12,
    currentQuantity: 10,
    miragePerformed: true,
    mirageDate: "2024-01-10",
  },
  {
    id: 2,
    species: "Canard",
    day: 25,
    totalDays: 28,
    status: "healthy",
    hatchDate: "2024-01-22",
    initialQuantity: 8,
    currentQuantity: 8,
    miragePerformed: false,
  },
  {
    id: 3,
    species: "Caille",
    day: 15,
    totalDays: 18,
    status: "attention",
    hatchDate: "2024-01-18",
    initialQuantity: 24,
    currentQuantity: 18,
    miragePerformed: true,
    mirageDate: "2024-01-12",
  },
]

const completedBatches = [
  {
    id: 11,
    species: "Poule",
    initialQuantity: 15,
    currentQuantity: 12,
    successRate: 92.31,
    completedDate: "2023-12-16",
    status: "excellent",
  },
  {
    id: 10,
    species: "Canard",
    initialQuantity: 10,
    currentQuantity: 6,
    successRate: 75.0,
    completedDate: "2023-11-26",
    status: "partial",
  },
  {
    id: 9,
    species: "Caille",
    initialQuantity: 24,
    currentQuantity: 21,
    successRate: 95.45,
    completedDate: "2023-11-02",
    status: "excellent",
  },
]

export default function UserScreen() {
  const [activeTab, setActiveTab] = useState<"current" | "history" | "stats">("current")

  const handleLogout = async () => {
    Alert.alert("Déconnexion", "Voulez-vous vraiment vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("user")
            await AsyncStorage.removeItem("userType")
            // Navigation sera gérée par App.tsx
          } catch (error) {
            console.error("Erreur lors de la déconnexion:", error)
          }
        },
      },
    ])
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "#10b981"
      case "attention":
        return "#f59e0b"
      case "critical":
        return "#ef4444"
      default:
        return "#6b7280"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "healthy":
        return "Sain"
      case "attention":
        return "Attention"
      case "critical":
        return "Critique"
      default:
        return "Inconnu"
    }
  }

  const renderCurrentBatches = () => (
    <ScrollView style={styles.tabContent}>
      {eggBatches.map((batch) => (
        <View key={batch.id} style={styles.batchCard}>
          <View style={styles.batchHeader}>
            <Text style={styles.batchTitle}>{batch.species}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(batch.status) }]}>
              <Text style={styles.statusBadgeText}>{getStatusText(batch.status)}</Text>
            </View>
          </View>

          <Text style={styles.batchSubtitle}>Couvée #{batch.id} - Démarrée le 02/01/2024</Text>

          <View style={styles.batchProgress}>
            <View style={styles.progressInfo}>
              <Icon name="egg" size={16} color="#f59e0b" />
              <Text style={styles.progressText}>
                Jour {batch.day}/{batch.totalDays}
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(batch.day / batch.totalDays) * 100}%` }]} />
            </View>
          </View>

          <View style={styles.batchDetails}>
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Œufs initial:</Text>
                <Text style={styles.detailValue}>{batch.initialQuantity}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Après mirage:</Text>
                <Text style={styles.detailValue}>
                  {batch.currentQuantity} ({Math.round((batch.currentQuantity / batch.initialQuantity) * 100)}%)
                </Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Éclosion prévue:</Text>
                <Text style={styles.detailValue}>{batch.hatchDate}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Mirage:</Text>
                <Text style={[styles.detailValue, { color: batch.miragePerformed ? "#10b981" : "#f59e0b" }]}>
                  {batch.miragePerformed ? "Effectué" : "À faire"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.recommendations}>
            <Text style={styles.recommendationsTitle}>Recommandations:</Text>
            {batch.status === "attention" ? (
              <View style={styles.recommendationsList}>
                <Text style={styles.recommendationItem}>• Surveiller la température</Text>
                <Text style={styles.recommendationItem}>• Vérifier l'humidité</Text>
                <Text style={styles.recommendationItem}>• Contrôler le retournement</Text>
              </View>
            ) : (
              <View style={styles.recommendationsList}>
                <Text style={styles.recommendationItem}>• Développement normal</Text>
                <Text style={styles.recommendationItem}>• Continuer la surveillance</Text>
                <Text style={styles.recommendationItem}>• Préparer l'éclosion</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.detailsButton}>
            <Icon name="visibility" size={16} color="#3b82f6" />
            <Text style={styles.detailsButtonText}>Voir Détails</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  )

  const renderHistory = () => (
    <ScrollView style={styles.tabContent}>
      {completedBatches.map((batch) => (
        <View key={batch.id} style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <View style={styles.historyIconContainer}>
              <Icon name="check-circle" size={24} color={batch.status === "excellent" ? "#10b981" : "#f59e0b"} />
            </View>
            <View style={styles.historyInfo}>
              <Text style={styles.historyTitle}>
                Couvée {batch.species} #{batch.id}
              </Text>
              <Text style={styles.historyDate}>Terminée le {batch.completedDate}</Text>
            </View>
            <View
              style={[
                styles.historyBadge,
                {
                  backgroundColor: batch.status === "excellent" ? "#10b981" : "#f59e0b",
                },
              ]}
            >
              <Text style={styles.historyBadgeText}>{batch.status === "excellent" ? "Réussie" : "Partielle"}</Text>
            </View>
          </View>

          <View style={styles.historyStats}>
            <View style={styles.historyStat}>
              <Text style={styles.historyStatLabel}>Œufs initial:</Text>
              <Text style={styles.historyStatValue}>{batch.initialQuantity}</Text>
            </View>
            <View style={styles.historyStat}>
              <Text style={styles.historyStatLabel}>Éclos:</Text>
              <Text style={[styles.historyStatValue, { color: batch.status === "excellent" ? "#10b981" : "#f59e0b" }]}>
                {batch.currentQuantity} ({batch.successRate}%)
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.historyDetailsButton}>
            <Icon name="visibility" size={14} color="#6b7280" />
            <Text style={styles.historyDetailsButtonText}>Détails</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  )

  const renderStats = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Icon name="egg" size={32} color="#3b82f6" />
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Couvées Totales</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="trending-up" size={32} color="#10b981" />
          <Text style={styles.statNumber}>87%</Text>
          <Text style={styles.statLabel}>Taux de Réussite</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="check-circle" size={32} color="#f59e0b" />
          <Text style={styles.statNumber}>156</Text>
          <Text style={styles.statLabel}>Œufs Éclos</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="person" size={32} color="#8b5cf6" />
          <Text style={styles.statNumber}>8 mois</Text>
          <Text style={styles.statLabel}>Expérience</Text>
        </View>
      </View>

      <View style={styles.performanceSection}>
        <Text style={styles.performanceTitle}>Performance par Espèce</Text>
        <View style={styles.performanceList}>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceSpecies}>Poules</Text>
            <View style={styles.performanceBar}>
              <View style={[styles.performanceBarFill, { width: "89%", backgroundColor: "#f59e0b" }]} />
            </View>
            <Text style={styles.performancePercent}>89%</Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceSpecies}>Canards</Text>
            <View style={styles.performanceBar}>
              <View style={[styles.performanceBarFill, { width: "82%", backgroundColor: "#3b82f6" }]} />
            </View>
            <Text style={styles.performancePercent}>82%</Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceSpecies}>Cailles</Text>
            <View style={styles.performanceBar}>
              <View style={[styles.performanceBarFill, { width: "94%", backgroundColor: "#10b981" }]} />
            </View>
            <Text style={styles.performancePercent}>94%</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )

  return (
    <View style={styles.container}>
      {/* En-tête utilisateur */}
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>ML</Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>Marie Laurent</Text>
            <Text style={styles.userEmail}>marie.laurent@email.fr</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* Navigation par onglets */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "current" && styles.tabButtonActive]}
          onPress={() => setActiveTab("current")}
        >
          <Text style={[styles.tabButtonText, activeTab === "current" && styles.tabButtonTextActive]}>En Cours</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "history" && styles.tabButtonActive]}
          onPress={() => setActiveTab("history")}
        >
          <Text style={[styles.tabButtonText, activeTab === "history" && styles.tabButtonTextActive]}>Historique</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "stats" && styles.tabButtonActive]}
          onPress={() => setActiveTab("stats")}
        >
          <Text style={[styles.tabButtonText, activeTab === "stats" && styles.tabButtonTextActive]}>Statistiques</Text>
        </TouchableOpacity>
      </View>

      {/* Contenu des onglets */}
      {activeTab === "current" && renderCurrentBatches()}
      {activeTab === "history" && renderHistory()}
      {activeTab === "stats" && renderStats()}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fef3c7",
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f59e0b",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  userEmail: {
    fontSize: 14,
    color: "#6b7280",
  },
  logoutButton: {
    padding: 8,
  },
  tabNavigation: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#f59e0b",
  },
  tabButtonText: {
    fontSize: 16,
    color: "#6b7280",
  },
  tabButtonTextActive: {
    color: "#f59e0b",
    fontWeight: "600",
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  batchCard: {
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
  batchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  batchTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  batchSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
  },
  batchProgress: {
    marginBottom: 16,
  },
  progressInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  progressText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#374151",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3b82f6",
    borderRadius: 4,
  },
  batchDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  recommendations: {
    marginBottom: 16,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  recommendationsList: {
    marginLeft: 8,
  },
  recommendationItem: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 2,
  },
  detailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#3b82f6",
    borderRadius: 6,
  },
  detailsButtonText: {
    marginLeft: 4,
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "600",
  },
  historyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    marginBottom: 12,
  },
  historyIconContainer: {
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  historyDate: {
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
    fontSize: 12,
    fontWeight: "600",
  },
  historyStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  historyStat: {
    flex: 1,
  },
  historyStatLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 2,
  },
  historyStatValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
  },
  historyDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  historyDetailsButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#6b7280",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
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
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 4,
  },
  performanceSection: {
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
  performanceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },
  performanceList: {
    gap: 12,
  },
  performanceItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  performanceSpecies: {
    width: 80,
    fontSize: 14,
    color: "#374151",
  },
  performanceBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    marginHorizontal: 12,
  },
  performanceBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  performancePercent: {
    width: 40,
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "right",
  },
})
