"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { CustomerTable } from "@/components/customers/customer-table"
import { CustomerFormDialog } from "@/components/customers/customer-form-dialog"
import { CustomerViewDialog } from "@/components/customers/customer-view-dialog"
import { storage, type Customer, type POSTransaction } from "@/lib/storage"
import { formatPKR } from "@/lib/utils"

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [transactions, setTransactions] = useState<POSTransaction[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  const loadCustomers = () => {
    const allCustomers = storage.getCustomers()
    const allTransactions = storage.getPOSTransactions()
    setCustomers(allCustomers)
    setTransactions(allTransactions)
    setFilteredCustomers(allCustomers)
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = customers.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.phone.includes(searchQuery) ||
          (c.city && c.city.toLowerCase().includes(searchQuery.toLowerCase())),
      )
      setFilteredCustomers(filtered)
    } else {
      setFilteredCustomers(customers)
    }
  }, [searchQuery, customers])

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer)
    setFormDialogOpen(true)
  }

  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer)
    setViewDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    storage.deleteCustomer(id)
    loadCustomers()
  }

  const handleAddNew = () => {
    setSelectedCustomer(null)
    setFormDialogOpen(true)
  }

  const totalsByCustomer = transactions.reduce<Record<string, number>>((acc, transaction) => {
    if (!transaction.customerId) return acc
    acc[transaction.customerId] = (acc[transaction.customerId] || 0) + transaction.totalAmount
    return acc
  }, {})
  const totalOutstanding = customers.reduce((sum, c) => sum + c.outstandingBalance, 0)
  const totalSold = Object.values(totalsByCustomer).reduce((sum, total) => sum + total, 0)

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
            <p className="text-muted-foreground mt-1">Manage your customers and track their purchase history</p>
          </div>
          <Button onClick={handleAddNew} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Customer
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
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-card border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Total Customers</div>
            <div className="text-2xl font-bold mt-1">{customers.length}</div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Total Sold</div>
            <div className="text-2xl font-bold mt-1">{formatPKR(totalSold)}</div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Outstanding Balance</div>
            <div className="text-2xl font-bold mt-1 text-orange-500">{formatPKR(totalOutstanding)}</div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">With Outstanding</div>
            <div className="text-2xl font-bold mt-1 text-primary">
              {customers.filter((c) => c.outstandingBalance > 0).length}
            </div>
          </div>
        </div>

        {/* Table */}
        <CustomerTable
          customers={filteredCustomers}
          totalsByCustomer={totalsByCustomer}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />

        {/* Dialogs */}
        <CustomerFormDialog
          open={formDialogOpen}
          onOpenChange={setFormDialogOpen}
          customer={selectedCustomer}
          onSuccess={loadCustomers}
        />

        <CustomerViewDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          customer={selectedCustomer}
        />
      </div>
    </DashboardLayout>
  )
}
