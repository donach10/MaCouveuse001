"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Egg, Users, CheckCircle, AlertCircle, User, Eye, TrendingDown } from "lucide-react"

// Types
type UserType = {
  id: number
  name: string
  email: string
  phone: string
  status: "active" | "inactive"
  totalEggs: number
  successRate: number
}

type EggBatch = {
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

// Données simulées des utilisateurs
const users: UserType[] = [
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
  {
    id: 5,
    name: "Claire Bernard",
    email: "claire.bernard@email.fr",
    phone: "06.56.78.90.12",
    status: "inactive",
    totalEggs: 12,
    successRate: 90,
  },
]

// Données simulées des couvées avec mirage
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
  {
    id: 4,
    userId: 4,
    userName: "Jean Rousseau",
    species: "Poule",
    initialQuantity: 6,
    currentQuantity: 6,
    miragePerformed: false,
    startDate: "2024-01-08",
    expectedHatchDate: "2024-01-29",
    status: "healthy",
    day: 12,
    totalDays: 21,
  },
]

// Espèces disponibles avec durées d'incubation
const species = [
  { name: "Poule", days: 21 },
  { name: "Canard", days: 28 },
  { name: "Oie", days: 30 },
  { name: "Caille", days: 18 },
  { name: "Dinde", days: 28 },
  { name: "Pintade", days: 26 },
]

interface AdminPanelProps {
  totalCapacity: number
  currentOccupancy: number
}

export default function AdminPanel({ totalCapacity, currentOccupancy }: AdminPanelProps) {
  const [eggBatches, setEggBatches] = useState<EggBatch[]>(initialEggBatches)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isMirageDialogOpen, setIsMirageDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingBatch, setEditingBatch] = useState<EggBatch | null>(null)
  const [mirageData, setMirageData] = useState({
    batchId: 0,
    newQuantity: "",
  })
  const [newBatch, setNewBatch] = useState({
    userId: "",
    species: "",
    quantity: "",
    startDate: new Date().toISOString().split("T")[0],
  })

  // Calculer la capacité actuelle basée sur les quantités après mirage
  const actualCurrentOccupancy = eggBatches.reduce((sum, batch) => sum + batch.currentQuantity, 0)
  const remainingCapacity = totalCapacity - actualCurrentOccupancy

  const handleAddBatch = () => {
    if (!newBatch.userId || !newBatch.species || !newBatch.quantity) return

    const selectedUser = users.find((u) => u.id === Number.parseInt(newBatch.userId))
    const selectedSpecies = species.find((s) => s.name === newBatch.species)

    if (!selectedUser || !selectedSpecies) return

    const startDate = new Date(newBatch.startDate)
    const expectedHatchDate = new Date(startDate)
    expectedHatchDate.setDate(startDate.getDate() + selectedSpecies.days)

    const quantity = Number.parseInt(newBatch.quantity)
    const batch: EggBatch = {
      id: Math.max(...eggBatches.map((b) => b.id)) + 1,
      userId: selectedUser.id,
      userName: selectedUser.name,
      species: newBatch.species,
      initialQuantity: quantity,
      currentQuantity: quantity,
      miragePerformed: false,
      startDate: newBatch.startDate,
      expectedHatchDate: expectedHatchDate.toISOString().split("T")[0],
      status: "healthy",
      day: 1,
      totalDays: selectedSpecies.days,
    }

    setEggBatches([...eggBatches, batch])
    setNewBatch({ userId: "", species: "", quantity: "", startDate: new Date().toISOString().split("T")[0] })
    setIsAddDialogOpen(false)
  }

  const handleMirage = (batch: EggBatch) => {
    setMirageData({
      batchId: batch.id,
      newQuantity: batch.currentQuantity.toString(),
    })
    setIsMirageDialogOpen(true)
  }

  const handleMirageConfirm = () => {
    const newQuantity = Number.parseInt(mirageData.newQuantity)
    if (newQuantity < 0 || newQuantity > eggBatches.find((b) => b.id === mirageData.batchId)?.initialQuantity!) return

    setEggBatches(
      eggBatches.map((batch) =>
        batch.id === mirageData.batchId
          ? {
              ...batch,
              currentQuantity: newQuantity,
              miragePerformed: true,
              mirageDate: new Date().toISOString().split("T")[0],
            }
          : batch,
      ),
    )

    setIsMirageDialogOpen(false)
    setMirageData({ batchId: 0, newQuantity: "" })
  }

  const handleEditBatch = (batch: EggBatch) => {
    setEditingBatch(batch)
    setIsEditDialogOpen(true)
  }

  const handleDeleteBatch = (batchId: number) => {
    setEggBatches(eggBatches.filter((b) => b.id !== batchId))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-100"
      case "attention":
        return "text-yellow-600 bg-yellow-100"
      case "critical":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getUserStatusColor = (status: string) => {
    return status === "active" ? "text-green-600 bg-green-100" : "text-gray-600 bg-gray-100"
  }

  const getMirageStatusColor = (miragePerformed: boolean) => {
    return miragePerformed ? "text-green-600 bg-green-100" : "text-orange-600 bg-orange-100"
  }

  const calculateMirageRate = (batch: EggBatch) => {
    if (!batch.miragePerformed) return null
    return Math.round((batch.currentQuantity / batch.initialQuantity) * 100)
  }

  return (
    <div className="space-y-6">
      {/* Statistiques d'administration */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.filter((u) => u.status === "active").length}</div>
            <p className="text-xs text-muted-foreground">Sur {users.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Couvées Actives</CardTitle>
            <Egg className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eggBatches.length}</div>
            <p className="text-xs text-muted-foreground">{actualCurrentOccupancy} œufs actuels</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacité Restante</CardTitle>
            <AlertCircle className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{remainingCapacity}</div>
            <p className="text-xs text-muted-foreground">Places disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mirages Effectués</CardTitle>
            <Eye className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eggBatches.filter((b) => b.miragePerformed).length}</div>
            <p className="text-xs text-muted-foreground">Sur {eggBatches.length} couvées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Fertilité</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {eggBatches.filter((b) => b.miragePerformed).length > 0
                ? Math.round(
                    (eggBatches.filter((b) => b.miragePerformed).reduce((sum, b) => sum + b.currentQuantity, 0) /
                      eggBatches.filter((b) => b.miragePerformed).reduce((sum, b) => sum + b.initialQuantity, 0)) *
                      100,
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Moyenne après mirage</p>
          </CardContent>
        </Card>
      </div>

      {/* Alerte de capacité */}
      {remainingCapacity < 100 && (
        <Alert variant={remainingCapacity < 50 ? "destructive" : "default"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {remainingCapacity < 50
              ? `Attention : Capacité critique ! Seulement ${remainingCapacity} places restantes.`
              : `Capacité limitée : ${remainingCapacity} places restantes. Planifiez les nouvelles couvées.`}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="batches" className="space-y-4">
        <TabsList>
          <TabsTrigger value="batches">Gestion des Couvées</TabsTrigger>
          <TabsTrigger value="users">Gestion des Utilisateurs</TabsTrigger>
        </TabsList>

        {/* Gestion des Couvées */}
        <TabsContent value="batches" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Couvées en Cours</h3>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter une Couvée
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Ajouter une Nouvelle Couvée</DialogTitle>
                  <DialogDescription>Assignez une nouvelle couvée à un utilisateur</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="user">Utilisateur</Label>
                    <Select
                      value={newBatch.userId}
                      onValueChange={(value) => setNewBatch({ ...newBatch, userId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un utilisateur" />
                      </SelectTrigger>
                      <SelectContent>
                        {users
                          .filter((u) => u.status === "active")
                          .map((user) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.name} - {user.email}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="species">Espèce</Label>
                    <Select
                      value={newBatch.species}
                      onValueChange={(value) => setNewBatch({ ...newBatch, species: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une espèce" />
                      </SelectTrigger>
                      <SelectContent>
                        {species.map((spec) => (
                          <SelectItem key={spec.name} value={spec.name}>
                            {spec.name} ({spec.days} jours)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Nombre d'œufs</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max={remainingCapacity}
                      value={newBatch.quantity}
                      onChange={(e) => setNewBatch({ ...newBatch, quantity: e.target.value })}
                      placeholder="Nombre d'œufs"
                    />
                    <p className="text-xs text-gray-500">Maximum: {remainingCapacity} œufs disponibles</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Date de début</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newBatch.startDate}
                      onChange={(e) => setNewBatch({ ...newBatch, startDate: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleAddBatch}>Ajouter la Couvée</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Espèce</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead>Mirage</TableHead>
                    <TableHead>Progression</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Éclosion Prévue</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eggBatches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-medium">{batch.userName}</TableCell>
                      <TableCell>{batch.species}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {batch.currentQuantity} œufs
                            {batch.initialQuantity !== batch.currentQuantity && (
                              <span className="text-gray-500 ml-1">({batch.initialQuantity} initial)</span>
                            )}
                          </div>
                          {batch.miragePerformed && batch.initialQuantity !== batch.currentQuantity && (
                            <div className="flex items-center space-x-1">
                              <TrendingDown className="w-3 h-3 text-red-500" />
                              <span className="text-xs text-red-600">
                                -{batch.initialQuantity - batch.currentQuantity} après mirage
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge className={getMirageStatusColor(batch.miragePerformed)}>
                            {batch.miragePerformed ? "Effectué" : "À faire"}
                          </Badge>
                          {batch.miragePerformed && (
                            <div className="text-xs text-gray-600">
                              {batch.mirageDate} ({calculateMirageRate(batch)}% fertile)
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            Jour {batch.day}/{batch.totalDays}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(batch.day / batch.totalDays) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(batch.status)}>
                          {batch.status === "healthy"
                            ? "Sain"
                            : batch.status === "attention"
                              ? "Attention"
                              : "Critique"}
                        </Badge>
                      </TableCell>
                      <TableCell>{batch.expectedHatchDate}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {!batch.miragePerformed && batch.day >= 7 && (
                            <Button variant="outline" size="sm" onClick={() => handleMirage(batch)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => handleEditBatch(batch)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteBatch(batch.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gestion des Utilisateurs */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Liste des Utilisateurs</h3>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouvel Utilisateur
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Œufs Total</TableHead>
                    <TableHead>Taux de Réussite</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>
                        <Badge className={getUserStatusColor(user.status)}>
                          {user.status === "active" ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.totalEggs}</TableCell>
                      <TableCell>{user.successRate}%</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <User className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Mirage */}
      <Dialog open={isMirageDialogOpen} onOpenChange={setIsMirageDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Effectuer le Mirage</DialogTitle>
            <DialogDescription>
              Ajustez la quantité d'œufs après vérification de la fertilité par mirage
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {eggBatches.find((b) => b.id === mirageData.batchId) && (
              <>
                <div className="space-y-2">
                  <Label>Couvée</Label>
                  <div className="text-sm text-gray-600">
                    {eggBatches.find((b) => b.id === mirageData.batchId)?.userName} -{" "}
                    {eggBatches.find((b) => b.id === mirageData.batchId)?.species}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Quantité initiale</Label>
                  <div className="text-sm font-medium">
                    {eggBatches.find((b) => b.id === mirageData.batchId)?.initialQuantity} œufs
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newQuantity">Quantité après mirage</Label>
                  <Input
                    id="newQuantity"
                    type="number"
                    min="0"
                    max={eggBatches.find((b) => b.id === mirageData.batchId)?.initialQuantity}
                    value={mirageData.newQuantity}
                    onChange={(e) => setMirageData({ ...mirageData, newQuantity: e.target.value })}
                    placeholder="Nombre d'œufs fertiles"
                  />
                  <p className="text-xs text-gray-500">Entrez le nombre d'œufs fertiles détectés lors du mirage</p>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMirageDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleMirageConfirm}>Confirmer le Mirage</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
