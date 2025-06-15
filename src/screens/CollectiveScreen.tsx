import { View, Text, ScrollView, StyleSheet } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import { PieChart } from "react-native-chart-kit"
import { Dimensions } from "react-native"

const screenWidth = Dimensions.get("window").width

const TOTAL_CAPACITY = 1056
const TOTAL_EGGS_IN_INCUBATION = 847
const REMAINING_CAPACITY = TOTAL_CAPACITY - TOTAL_EGGS_IN_INCUBATION

const globalStats = [
  { name: "Éclosions réussies", population: 87, color: "#10b981", legendFontColor: "#374151", legendFontSize: 12 },
  { name: "En cours", population: 13, color: "#3b82f6", legendFontColor: "#374151", legendFontSize: 12 },
]

const speciesData = [
  { name: "Poules", population: 425, color: "#f59e0b", legendFontColor: "#374151", legendFontSize: 12 },
  { name: "Canards", population: 312, color: "#3b82f6", legendFontColor: "#374151", legendFontSize: 12 },
  { name: "Cailles", population: 87, color: "#10b981", legendFontColor: "#374151", legendFontSize: 12 },
  { name: "Autres", population: 23, color: "#8b5cf6", legendFontColor: "#374151", legendFontSize: 12 },
]

export default function CollectiveScreen() {
  const occupancyRate = Math.round((TOTAL_EGGS_IN_INCUBATION / TOTAL_CAPACITY) * 100)

  return (
    <ScrollView style={styles.container}>
      {/* Alerte de capacité */}
      {REMAINING_CAPACITY < 100 && (
        <View style={[styles.alertContainer, { backgroundColor: REMAINING_CAPACITY < 50 ? "#fef2f2" : "#fffbeb" }]}>
          <Icon name="warning" size={20} color={REMAINING_CAPACITY < 50 ? "#ef4444" : "#f59e0b"} />
          <Text style={[styles.alertText, { color: REMAINING_CAPACITY < 50 ? "#ef4444" : "#f59e0b" }]}>
            {REMAINING_CAPACITY < 50
              ? `Attention : Capacité critique ! Seulement ${REMAINING_CAPACITY} places restantes.`
              : `Capacité limitée : ${REMAINING_CAPACITY} places restantes. Planifiez les nouvelles couvées.`}
          </Text>
        </View>
      )}

      {/* Capacité de la couveuse */}
      <View style={styles.capacitySection}>
        <Text style={styles.sectionTitle}>Capacité de la Couveuse</Text>

        <View style={styles.capacityOverview}>
          <View style={styles.capacityStats}>
            <View style={styles.capacityStat}>
              <Text style={styles.capacityNumber}>{TOTAL_CAPACITY}</Text>
              <Text style={styles.capacityLabel}>Capacité totale</Text>
            </View>
            <View style={styles.capacityStat}>
              <Text style={[styles.capacityNumber, { color: "#10b981" }]}>{TOTAL_EGGS_IN_INCUBATION}</Text>
              <Text style={styles.capacityLabel}>En incubation</Text>
            </View>
            <View style={styles.capacityStat}>
              <Text style={[styles.capacityNumber, { color: "#8b5cf6" }]}>{REMAINING_CAPACITY}</Text>
              <Text style={styles.capacityLabel}>Places libres</Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Taux d'occupation</Text>
              <Text style={styles.progressPercent}>{occupancyRate}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${occupancyRate}%`,
                    backgroundColor: occupancyRate > 95 ? "#ef4444" : occupancyRate > 85 ? "#f59e0b" : "#10b981",
                  },
                ]}
              />
            </View>
            <View style={styles.progressMarkers}>
              <Text style={styles.progressMarker}>0%</Text>
              <Text style={[styles.progressMarker, { color: "#f59e0b" }]}>85%</Text>
              <Text style={[styles.progressMarker, { color: "#ef4444" }]}>95%</Text>
              <Text style={styles.progressMarker}>100%</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Répartition par espèce */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Répartition par Espèce</Text>
        <View style={styles.chartContainer}>
          <PieChart
            data={speciesData}
            width={screenWidth - 32}
            height={220}
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>

        <View style={styles.speciesDetails}>
          {speciesData.map((species, index) => (
            <View key={index} style={styles.speciesItem}>
              <View style={[styles.speciesColor, { backgroundColor: species.color }]} />
              <Text style={styles.speciesName}>{species.name}</Text>
              <Text style={styles.speciesCount}>{species.population} œufs</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Statistiques globales */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Globale</Text>
        <View style={styles.chartContainer}>
          <PieChart
            data={globalStats}
            width={screenWidth - 32}
            height={220}
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      </View>

      {/* Prévisions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Prévisions</Text>
        <View style={styles.forecastContainer}>
          <View style={styles.forecastItem}>
            <Icon name="trending-up" size={24} color="#10b981" />
            <View style={styles.forecastText}>
              <Text style={styles.forecastTitle}>156 éclosions prévues</Text>
              <Text style={styles.forecastSubtitle}>cette semaine</Text>
            </View>
          </View>
          <View style={styles.forecastItem}>
            <Icon name="group" size={24} color="#3b82f6" />
            <View style={styles.forecastText}>
              <Text style={styles.forecastTitle}>12 nouvelles réservations</Text>
              <Text style={styles.forecastSubtitle}>en attente</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Activité communautaire */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Activité Communautaire</Text>
        <View style={styles.communityStats}>
          <View style={styles.communityStatCard}>
            <Icon name="egg" size={32} color="#f59e0b" />
            <Text style={styles.communityStatNumber}>{TOTAL_EGGS_IN_INCUBATION}</Text>
            <Text style={styles.communityStatLabel}>Œufs en incubation</Text>
          </View>
          <View style={styles.communityStatCard}>
            <Icon name="show-chart" size={32} color="#10b981" />
            <Text style={styles.communityStatNumber}>{occupancyRate}%</Text>
            <Text style={styles.communityStatLabel}>Taux d'occupation</Text>
          </View>
          <View style={styles.communityStatCard}>
            <Icon name="people" size={32} color="#8b5cf6" />
            <Text style={styles.communityStatNumber}>47</Text>
            <Text style={styles.communityStatLabel}>Utilisateurs actifs</Text>
          </View>
        </View>
      </View>

      {/* Informations supplémentaires */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations Système</Text>
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Icon name="check-circle" size={20} color="#10b981" />
            <Text style={styles.infoText}>Taux de réussite global: 87%</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="calendar-today" size={20} color="#3b82f6" />
            <Text style={styles.infoText}>23 éclosions cette semaine</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="schedule" size={20} color="#f59e0b" />
            <Text style={styles.infoText}>Prochaine maintenance: 25/01</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="thermostat" size={20} color="#ef4444" />
            <Text style={styles.infoText}>Température moyenne: 37.5°C</Text>
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
  alertContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fed7aa",
  },
  alertText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  capacitySection: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#92400e",
    marginBottom: 16,
  },
  capacityOverview: {
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
  capacityStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  capacityStat: {
    alignItems: "center",
  },
  capacityNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f59e0b",
  },
  capacityLabel: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 4,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: "#374151",
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
  },
  progressBar: {
    height: 12,
    backgroundColor: "#e5e7eb",
    borderRadius: 6,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
  progressMarkers: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressMarker: {
    fontSize: 12,
    color: "#6b7280",
  },
  section: {
    margin: 16,
  },
  chartContainer: {
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
  speciesDetails: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  speciesItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  speciesColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 12,
  },
  speciesName: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
  },
  speciesCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  forecastContainer: {
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
  forecastItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  forecastText: {
    marginLeft: 12,
  },
  forecastTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  forecastSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  communityStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  communityStatCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
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
  communityStatNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 8,
  },
  communityStatLabel: {
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 4,
  },
  infoContainer: {
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
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 14,
    color: "#374151",
  },
})
