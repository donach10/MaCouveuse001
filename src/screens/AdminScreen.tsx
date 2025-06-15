"use client"

import { useState } from "react"
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, TextInput, Modal } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"

interface User {
  id: number
  name: string
  email: string
  phone: string
  status: "active" | "inactive"
  totalEggs: number
  successRate: number
}

interface EggBatch {
  id: number
  userId: number
  userName: string
  species: string
  initialQuantity: number
  currentQuantity: number
  mirageDate?: string
  miragePerformed: boolean
  startDate: string
  expectedHatchDate: string
  status: "healthy" | "attention" | "critical"
  day: number
  totalDays: number
}

const users: User[] = [
  {
    id: 1,
    name: "Marie Laurent",
    email: "marie.laurent@email.fr",
    phone: "06.12.34.56.78",
    status: "active",
    totalEggs: 45,
    successRate: 92,
  },
  {
    id: 2,
    name: "Pierre Martin",
    email: "pierre.martin@email.fr",
    phone: "06.23.45.67.89",
    status: "active",
    totalEggs: 32,
    successRate: 88,
  },
  {
    id: 3,
    name: "Sophie Dubois",
    email: "sophie.dubois@email.fr",
    phone: "06.34.56.78.90",
    status: "active",
    totalEggs: 28,
    successRate: 95,
  },
  {
    id: 4,
    name: "Jean Rousseau",
    email: "jean.rousseau@email.fr",
    phone: "06.45.67.89.01",
    status: "active",
    totalEggs: 18,
    successRate: 85,
  },
]

const initialEggBatches: EggBatch[] = [
  {
    id: 1,
    userId: 1,
    userName: "Marie Laurent",
    species: "Poule",
    initialQuantity: 12,
    currentQuantity: 10,
    mirageDate: "2024-01-10",
    miragePerformed: true,
    startDate: "2024-01-02",
    expectedHatchDate: "2024-01-23",
    status: "healthy",
    day: 18,
    totalDays: 21,
  },
  {
    id: 2,
    userId: 2,
    userName: "Pierre Martin",
    species: "Canard",
    initialQuantity: 8,
    currentQuantity: 8,
    miragePerformed: false,
    startDate: "2023-12-25",
    expectedHatchDate: "2024-01-22",
    status: "healthy",
    day: 25,
    totalDays: 28,
  },
  {
    id: 3,
    userId: 3,
    userName: "Sophie Dubois",
    species: "Caille",
    initialQuantity: 24,
    currentQuantity: 18,
    mirageDate: "2024-01-12",
    miragePerformed: true,
    startDate: "2024-01-05",
    expectedHatchDate: "2024-01-23",
    status: "attention",
    day: 15,
    totalDays: 18,
  },
]

const TOTAL_CAPACITY = 1056
const CURRENT_OCCUPANCY = 847

export default function AdminScreen() {
  const [activeTab, setActiveTab] = useState<"batches" | "users">("batches")
  const [eggBatches, setEggBatches] = useState<EggBatch[]>(initialEggBatches)
  const [showMirageModal, setShowMirageModal] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState<EggBatch | null>(null)
  const [mirageQuantity, setMirageQuantity] = useState("")

  const actualCurrentOccupancy = eggBatches.reduce((sum, batch) => sum + batch.currentQuantity, 0)
  const remainingCapacity = TOTAL_CAPACITY - actualCurrentOccupancy

  const handleMirage = (batch: EggBatch) => {
    setSelectedBatch(batch)
    setMirageQuantity(batch.currentQuantity.toString())
    setShowMirageModal(true)
  }

  const confirmMirage = () => {
    if (!selectedBatch) return

    const newQuantity = Number.parseInt(mirageQuantity)
    if (newQuantity < 0 || newQuantity > selectedBatch.initialQuantity) {
      Alert.alert("Erreur", "Quantité invalide")
      return
    }

    setEggBatches((prev) =>
      prev.map((batch) =>
        batch.id === selectedBatch.id
          ? {
              ...batch,
              currentQuantity: newQuantity,
              miragePerformed: true,
              mirageDate: new Date().toISOString().split("T")[0],
            }
          : batch,
      ),
    )

    setShowMirageModal(false)
    setSelectedBatch(null)
    setMirageQuantity("")
    Alert.alert("Succès", "Mirage effectué avec succès")
  }

  const handleDeleteBatch = (batchId: number) => {
    Alert.alert("Confirmation", "Voulez-vous vraiment supprimer cette couvée ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: () => {
          setEggBatches((prev) => prev.filter((b) => b.id !== batchId))
          Alert.alert("Succès", "Couvée supprimée")
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

  const renderBatchesTab = () => (
    <ScrollView style={styles.tabContent}>
      {eggBatches.map((batch) => (
        <View key={batch.id} style={styles.batchCard}>
          <View style={styles.batchHeader}>
            <View style={styles.batchInfo}>
              <Text style={styles.batchTitle}>{batch.userName}</Text>
              <Text style={styles.batchSubtitle}>{batch.species}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(batch.status) }]}>
              <Text style={styles.statusBadgeText}>{getStatusText(batch.status)}</Text>
            </View>
          </View>

          <View style={styles.batchDetails}>
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Quantité:</Text>
                <Text style={styles.detailValue}>
                  {batch.currentQuantity} œufs
                  {batch.initialQuantity !== batch.currentQuantity && (
                    <Text style={styles.detailSubValue}> ({batch.initialQuantity} initial)</Text>
                  )}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Progression:</Text>
                <Text style={styles.detailValue}>
                  Jour {batch.day}/{batch.totalDays}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Mirage:</Text>
                <Text style={[styles.detailValue, { color: batch.miragePerformed ? "#10b981" : "#f59e0b" }]}>
                  {batch.miragePerformed ? "Effectué" : "À faire"}
                </Text>
                {batch.miragePerformed && batch.mirageDate && (
                  <Text style={styles.detailSubValue}>le {batch.mirageDate}</Text>
                )}
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Éclosion prévue:</Text>
                <Text style={styles.detailValue}>{batch.expectedHatchDate}</Text>
              </View>
            </View>
          </View>

          <View style={styles.batchActions}>
            {!batch.miragePerformed && batch.day >= 7 && (
              <TouchableOpacity style={styles.actionButton} onPress={() => handleMirage(batch)}>
                <Icon name="visibility" size={16} color="#3b82f6" />
                <Text style={styles.actionButtonText}>Mirage</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteBatch(batch.id)}
            >
              <Icon name="delete" size={16} color="#ef4444" />
              <Text style={[styles.actionButtonText, { color: "#ef4444" }]}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  )

  const renderUsersTab = () => (
    <ScrollView style={styles.tabContent}>
      {users.map((user) => (
        <View key={user.id} style={styles.userCard}>
          <View style={styles.userHeader}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userPhone}>{user.phone}</Text>
            </View>
            <View
              style={[styles.userStatusBadge, { backgroundColor: user.status === "active" ? "#10b981" : "#6b7280" }]}
            >
              <Text style={styles.userStatusText}>{user.status === "active" ? "Actif" : "Inactif"}</Text>
            </View>
          </View>

          <View style={styles.userStats}>
            <View style={styles.userStat}>
              <Text style={styles.userStatValue}>{user.totalEggs}</Text>
              <Text style={styles.userStatLabel}>Œufs total</Text>
            </View>
            <View style={styles.userStat}>
              <Text style={styles.userStatValue}>{user.successRate}%</Text>
              <Text style={styles.userStatLabel}>Taux de réussite</Text>
            </View>
          </View>

          <View style={styles.userActions}>
            <TouchableOpacity style={styles.userActionButton}>
              <Icon name="edit" size={16} color="#3b82f6" />
              <Text style={styles.userActionText}>Modifier</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.userActionButton}>
              <Icon name="person" size={16} color="#6b7280" />
              <Text style={styles.userActionText}>Profil</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  )

  return (
    <View style={styles.container}>
      {/* Statistiques d'administration */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Icon name="people" size={24} color="#3b82f6" />
          <Text style={styles.statNumber}>{users.filter((u) => u.status === "active").length}</Text>
          <Text style={styles.statLabel}>Utilisateurs Actifs</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="egg" size={24} color="#10b981" />
          <Text style={styles.statNumber}>{eggBatches.length}</Text>
          <Text style={styles.statLabel}>Couvées Actives</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="warning" size={24} color="#8b5cf6" />
          <Text style={styles.statNumber}>{remainingCapacity}</Text>
          <Text style={styles.statLabel}>Places Restantes</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="visibility" size={24} color="#f59e0b" />
          <Text style={styles.statNumber}>{eggBatches.filter((b) => b.miragePerformed).length}</Text>
          <Text style={styles.statLabel}>Mirages Effectués</Text>
        </View>
      </View>

      {/* Alerte de capacité */}
      {remainingCapacity < 100 && (
        <View style={[styles.alertContainer, { backgroundColor: remainingCapacity < 50 ? "#fef2f2" : "#fffbeb" }]}>
          <Icon name="warning" size={20} color={remainingCapacity < 50 ? "#ef4444" : "#f59e0b"} />
          <Text style={[styles.alertText, { color: remainingCapacity < 50 ? "#ef4444" : "#f59e0b" }]}>
            {remainingCapacity < 50
              ? `Attention : Capacité critique ! Seulement ${remainingCapacity} places restantes.`
              : `Capacité limitée : ${remainingCapacity} places restantes.`}
          </Text>
        </View>
      )}

      {/* Navigation par onglets */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "batches" && styles.tabButtonActive]}
          onPress={() => setActiveTab("batches")}
        >
          <Text style={[styles.tabButtonText, activeTab === "batches" && styles.tabButtonTextActive]}>Couvées</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "users" && styles.tabButtonActive]}
          onPress={() => setActiveTab("users")}
        >
          <Text style={[styles.tabButtonText, activeTab === "users" && styles.tabButtonTextActive]}>Utilisateurs</Text>
        </TouchableOpacity>
      </View>

      {/* Contenu des onglets */}
      {activeTab === "batches" && renderBatchesTab()}
      {activeTab === "users" && renderUsersTab()}

      {/* Modal de mirage */}
      <Modal
        visible={showMirageModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMirageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Effectuer le Mirage</Text>

            {selectedBatch && (
              <>
                <Text style={styles.modalSubtitle}>
                  {selectedBatch.userName} - {selectedBatch.species}
                </Text>

                <View style={styles.modalInfo}>
                  <Text style={styles.modalInfoLabel}>Quantité initiale:</Text>
                  <Text style={styles.modalInfoValue}>{selectedBatch.initialQuantity} œufs</Text>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Quantité après mirage:</Text>
                  <TextInput
                    style={styles.input}
                    value={mirageQuantity}
                    onChangeText={setMirageQuantity}
                    keyboardType="numeric"
                    placeholder="Nombre d'œufs fertiles"
                  />
                  <Text style={styles.inputHint}>Entrez le nombre d'œufs fertiles détectés lors du mirage</Text>
                </View>
              </>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowMirageModal(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonConfirm]} onPress={confirmMirage}>
                <Text style={styles.modalButtonTextConfirm}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fef3c7',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 2,
  },
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  alertText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabButtonActive: {
    backgroundColor: '#f59e0b',
  },
  tabButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#ffffff',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  batchCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  batchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  batchInfo: {
    flex: 1,
  },
  batchTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  batchSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight
