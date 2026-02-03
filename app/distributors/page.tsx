"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { DistributorTable } from "@/components/distributors/distributor-table"
import { DistributorFormDialog } from "@/components/distributors/distributor-form-dialog"
import { DistributorViewDialog } from "@/components/distributors/distributor-view-dialog"
import { storage, type Distributor, type SalesOrder } from "@/lib/storage"
import { formatPKR } from "@/lib/utils"

const getTotalsByDistributor = (orders: SalesOrder[]) =>
  orders.reduce<Record<string, number>>((acc, order) => {
    acc[order.distributorId] = (acc[order.distributorId] || 0) + order.totalAmount
    return acc
  }, {})

export default function DistributorsPage() {
  const [distributors, setDistributors] = useState<Distributor[]>([])
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [filteredDistributors, setFilteredDistributors] = useState<Distributor[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedDistributor, setSelectedDistributor] = useState<Distributor | null>(null)

  const loadDistributors = () => {
    const allDistributors = storage.getDistributors()
    const allOrders = storage.getSalesOrders()
    setDistributors(allDistributors)
    setOrders(allOrders)
    setFilteredDistributors(allDistributors)
  }

  useEffect(() => {
    loadDistributors()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = distributors.filter(
        (d) =>
          d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.phone.includes(searchQuery) ||
          (d.city && d.city.toLowerCase().includes(searchQuery.toLowerCase())),
      )
      setFilteredDistributors(filtered)
    } else {
      setFilteredDistributors(distributors)
    }
  }, [searchQuery, distributors])

  const handleEdit = (distributor: Distributor) => {
    setSelectedDistributor(distributor)
    setFormDialogOpen(true)
  }

  const handleView = (distributor: Distributor) => {
    setSelectedDistributor(distributor)
    setViewDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    storage.deleteDistributor(id)
    loadDistributors()
  }

  const handleAddNew = () => {
    setSelectedDistributor(null)
    setFormDialogOpen(true)
  }

  const totalsByDistributor = getTotalsByDistributor(orders)
  const totalPurchased = Object.values(totalsByDistributor).reduce((sum, total) => sum + total, 0)
  const totalOutstanding = distributors.reduce((sum, d) => sum + d.outstandingBalance, 0)

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
            <p className="text-muted-foreground mt-1">Track suppliers you buy from and total purchases</p>
          </div>
          <Button onClick={handleAddNew} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Company
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Total Companies</div>
            <div className="text-2xl font-bold mt-1">{distributors.length}</div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Total Purchased</div>
            <div className="text-2xl font-bold mt-1">{formatPKR(totalPurchased)}</div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Outstanding Payables</div>
            <div className="text-2xl font-bold mt-1 text-orange-500">{formatPKR(totalOutstanding)}</div>
          </div>
        </div>

        {/* Table */}
        <DistributorTable
          distributors={filteredDistributors}
          totalsByDistributor={totalsByDistributor}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />

        {/* Dialogs */}
        <DistributorFormDialog
          open={formDialogOpen}
          onOpenChange={setFormDialogOpen}
          distributor={selectedDistributor}
          onSuccess={loadDistributors}
        />

        <DistributorViewDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          distributor={selectedDistributor}
          totalPurchased={selectedDistributor ? totalsByDistributor[selectedDistributor.id] || 0 : 0}
        />
      </div>
    </DashboardLayout>
  )
}
