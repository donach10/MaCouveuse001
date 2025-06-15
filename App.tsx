"use client"

import { useState, useEffect } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createStackNavigator } from "@react-navigation/stack"
import { View, Text, StyleSheet, StatusBar, Alert, Platform } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import Icon from "react-native-vector-icons/MaterialIcons"

// Screens
import LoginScreen from "./src/screens/LoginScreen"
import DashboardScreen from "./src/screens/DashboardScreen"
import AlertsScreen from "./src/screens/AlertsScreen"
import UserScreen from "./src/screens/UserScreen"
import CollectiveScreen from "./src/screens/CollectiveScreen"
import AdminScreen from "./src/screens/AdminScreen"
import AnalyticsScreen from "./src/screens/AnalyticsScreen"

// Types
interface User {
  id: number
  name: string
  email: string
  role: string
  avatar: string
  permissions: string[]
}

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

// Navigation pour les utilisateurs normaux
function UserTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string

          switch (route.name) {
            case "Dashboard":
              iconName = "dashboard"
              break
            case "Alerts":
              iconName = "warning"
              break
            case "Profile":
              iconName = "person"
              break
            case "Community":
              iconName = "group"
              break
            default:
              iconName = "help"
          }

          return <Icon name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: "#f59e0b",
        tabBarInactiveTintColor: "#6b7280",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          paddingBottom: Platform.OS === "ios" ? 20 : 5,
          height: Platform.OS === "ios" ? 85 : 60,
        },
        headerStyle: {
          backgroundColor: "#f59e0b",
        },
        headerTintColor: "#ffffff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: "Surveillance" }} />
      <Tab.Screen name="Alerts" component={AlertsScreen} options={{ title: "Alertes" }} />
      <Tab.Screen name="Profile" component={UserScreen} options={{ title: "Mon Espace" }} />
      <Tab.Screen name="Community" component={CollectiveScreen} options={{ title: "Communauté" }} />
    </Tab.Navigator>
  )
}

// Navigation pour les administrateurs
function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string

          switch (route.name) {
            case "Dashboard":
              iconName = "dashboard"
              break
            case "Alerts":
              iconName = "warning"
              break
            case "Profile":
              iconName = "person"
              break
            case "Community":
              iconName = "group"
              break
            case "Admin":
              iconName = "admin-panel-settings"
              break
            case "Analytics":
              iconName = "analytics"
              break
            default:
              iconName = "help"
          }

          return <Icon name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: "#f59e0b",
        tabBarInactiveTintColor: "#6b7280",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          paddingBottom: Platform.OS === "ios" ? 20 : 5,
          height: Platform.OS === "ios" ? 85 : 60,
        },
        headerStyle: {
          backgroundColor: "#f59e0b",
        },
        headerTintColor: "#ffffff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: "Surveillance" }} />
      <Tab.Screen name="Alerts" component={AlertsScreen} options={{ title: "Alertes" }} />
      <Tab.Screen name="Profile" component={UserScreen} options={{ title: "Mon Espace" }} />
      <Tab.Screen name="Community" component={CollectiveScreen} options={{ title: "Communauté" }} />
      <Tab.Screen name="Admin" component={AdminScreen} options={{ title: "Administration" }} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} options={{ title: "Analyses" }} />
    </Tab.Navigator>
  )
}

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [userType, setUserType] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const userData = await AsyncStorage.getItem("user")
      const type = await AsyncStorage.getItem("userType")

      if (userData && type) {
        setUser(JSON.parse(userData))
        setUserType(type)
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de l'authentification:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (userType: "admin" | "user", userData: User) => {
    try {
      await AsyncStorage.setItem("user", JSON.stringify(userData))
      await AsyncStorage.setItem("userType", userType)
      setUser(userData)
      setUserType(userType)
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des données utilisateur:", error)
      Alert.alert("Erreur", "Impossible de sauvegarder les données de connexion")
    }
  }

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("user")
      await AsyncStorage.removeItem("userType")
      setUser(null)
      setUserType("")
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
    }
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    )
  }

  return (
    <NavigationContainer>
      <StatusBar backgroundColor="#f59e0b" barStyle="light-content" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main">{() => (userType === "admin" ? <AdminTabs /> : <UserTabs />)}</Stack.Screen>
        ) : (
          <Stack.Screen name="Login">{() => <LoginScreen onLogin={handleLogin} />}</Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fef3c7",
  },
  loadingText: {
    fontSize: 18,
    color: "#92400e",
    fontWeight: "600",
  },
})
