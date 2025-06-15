"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"

interface User {
  id: number
  name: string
  email: string
  role: string
  avatar: string
  permissions: string[]
}

interface LoginScreenProps {
  onLogin: (userType: "admin" | "user", userData: User) => void
}

const demoAccounts = {
  admin: {
    email: "admin@couveuse.fr",
    password: "admin123",
    name: "Administrateur Système",
    role: "admin",
  },
  user: {
    email: "marie.laurent@email.fr",
    password: "user123",
    name: "Marie Laurent",
    role: "user",
  },
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userType, setUserType] = useState<"admin" | "user">("user")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs")
      return
    }

    setIsLoading(true)

    // Simulation d'une authentification
    setTimeout(() => {
      const account = demoAccounts[userType]

      if (email === account.email && password === account.password) {
        onLogin(userType, {
          id: userType === "admin" ? 1 : 2,
          name: account.name,
          email: account.email,
          role: account.role,
          avatar: "",
          permissions:
            userType === "admin"
              ? ["read", "write", "delete", "manage_users", "system_control"]
              : ["read", "write_own"],
        })
      } else {
        Alert.alert("Erreur", "Email ou mot de passe incorrect")
      }
      setIsLoading(false)
    }, 1500)
  }

  const fillDemoCredentials = (type: "admin" | "user") => {
    const account = demoAccounts[type]
    setEmail(account.email)
    setPassword(account.password)
    setUserType(type)
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Logo et titre */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Icon name="egg" size={48} color="#ffffff" />
          </View>
          <Text style={styles.title}>Couveuse Intelligente</Text>
          <Text style={styles.subtitle}>Système IoT de surveillance d'incubation</Text>
        </View>

        {/* Formulaire de connexion */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Connexion</Text>

          {/* Sélection du type d'utilisateur */}
          <View style={styles.userTypeContainer}>
            <TouchableOpacity
              style={[styles.userTypeButton, userType === "user" && styles.userTypeButtonActive]}
              onPress={() => setUserType("user")}
            >
              <Icon name="person" size={20} color={userType === "user" ? "#ffffff" : "#6b7280"} />
              <Text style={[styles.userTypeText, userType === "user" && styles.userTypeTextActive]}>Utilisateur</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.userTypeButton, userType === "admin" && styles.userTypeButtonActive]}
              onPress={() => setUserType("admin")}
            >
              <Icon name="admin-panel-settings" size={20} color={userType === "admin" ? "#ffffff" : "#6b7280"} />
              <Text style={[styles.userTypeText, userType === "admin" && styles.userTypeTextActive]}>Admin</Text>
            </TouchableOpacity>
          </View>

          {/* Champs de saisie */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="votre@email.fr"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mot de passe</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity style={styles.passwordToggle} onPress={() => setShowPassword(!showPassword)}>
                <Icon name={showPassword ? "visibility-off" : "visibility"} size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bouton de connexion */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <Text style={styles.loginButtonText}>Connexion...</Text>
            ) : (
              <>
                <Icon name="lock" size={20} color="#ffffff" />
                <Text style={styles.loginButtonText}>Se connecter</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Comptes de démonstration */}
          <View style={styles.demoContainer}>
            <Text style={styles.demoTitle}>Comptes de démonstration :</Text>

            <TouchableOpacity style={styles.demoButton} onPress={() => fillDemoCredentials("user")}>
              <Icon name="person" size={20} color="#3b82f6" />
              <View style={styles.demoInfo}>
                <Text style={styles.demoName}>Marie Laurent</Text>
                <Text style={styles.demoEmail}>marie.laurent@email.fr</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.demoButton} onPress={() => fillDemoCredentials("admin")}>
              <Icon name="admin-panel-settings" size={20} color="#8b5cf6" />
              <View style={styles.demoInfo}>
                <Text style={styles.demoName}>Administrateur</Text>
                <Text style={styles.demoEmail}>admin@couveuse.fr</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Informations sur les rôles */}
        <View style={styles.rolesContainer}>
          <Text style={styles.rolesTitle}>Rôles et permissions :</Text>
          <View style={styles.roleItem}>
            <Icon name="person" size={16} color="#3b82f6" />
            <Text style={styles.roleText}>Utilisateur : Suivi personnel</Text>
          </View>
          <View style={styles.roleItem}>
            <Icon name="admin-panel-settings" size={16} color="#8b5cf6" />
            <Text style={styles.roleText}>Administrateur : Contrôle total</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fef3c7",
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f59e0b",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#92400e",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#a16207",
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 20,
    textAlign: "center",
  },
  userTypeContainer: {
    flexDirection: "row",
    marginBottom: 24,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 4,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 6,
  },
  userTypeButtonActive: {
    backgroundColor: "#f59e0b",
  },
  userTypeText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  userTypeTextActive: {
    color: "#ffffff",
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#ffffff",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  passwordToggle: {
    paddingHorizontal: 16,
  },
  loginButton: {
    backgroundColor: "#f59e0b",
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  demoContainer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  demoTitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 16,
  },
  demoButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    marginBottom: 8,
  },
  demoInfo: {
    marginLeft: 12,
  },
  demoName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  demoEmail: {
    fontSize: 14,
    color: "#6b7280",
  },
  rolesContainer: {
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
  rolesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
  },
  roleItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  roleText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#6b7280",
  },
})
