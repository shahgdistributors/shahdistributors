"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search } from "lucide-react"
import { OrderTable } from "@/components/sales/order-table"
import { CreateOrderDialog } from "@/components/sales/create-order-dialog"
import { OrderViewDialog } from "@/components/sales/order-view-dialog"
import { storage, type SalesOrder, type Distributor, type Product } from "@/lib/storage"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/utils"

export default function SalesPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [filteredOrders, setFilteredOrders] = useState<SalesOrder[]>([])
  const [distributors, setDistributors] = useState<Distributor[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [deliveryFilter, setDeliveryFilter] = useState("all")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null)

  const loadData = () => {
    setOrders(storage.getSalesOrders())
    setDistributors(storage.getDistributors())
    setProducts(storage.getProducts())
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    let filtered = orders

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((o) => o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Payment filter
    if (paymentFilter !== "all") {
      filtered = filtered.filter((o) => o.paymentStatus === paymentFilter)
    }

    // Delivery filter
    if (deliveryFilter !== "all") {
      filtered = filtered.filter((o) => o.deliveryStatus === deliveryFilter)
    }

    setFilteredOrders(filtered)
  }, [searchQuery, paymentFilter, deliveryFilter, orders])

  const handleView = (order: SalesOrder) => {
    setSelectedOrder(order)
    setViewDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    storage.deleteSalesOrder(id)
    loadData()
  }

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0)
  const pendingPayments = orders.filter((o) => o.paymentStatus === "Pending").length
  const pendingDeliveries = orders.filter((o) => o.deliveryStatus === "Pending").length

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sales & Orders</h1>
            <p className="text-muted-foreground mt-1">Create and manage sales orders</p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Order
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search orders by order number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Partial">Partial</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
            </SelectContent>
          </Select>
          <Select value={deliveryFilter} onValueChange={setDeliveryFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Delivery Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Deliveries</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Processing">Processing</SelectItem>
              <SelectItem value="Shipped">Shipped</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-card border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Total Orders</div>
            <div className="text-2xl font-bold mt-1">{orders.length}</div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Total Revenue</div>
            <div className="text-2xl font-bold mt-1">{formatCurrency(totalRevenue)}</div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Pending Payments</div>
            <div className="text-2xl font-bold mt-1 text-orange-500">{pendingPayments}</div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Pending Deliveries</div>
            <div className="text-2xl font-bold mt-1 text-orange-500">{pendingDeliveries}</div>
          </div>
        </div>

        {/* Table */}
        <OrderTable orders={filteredOrders} distributors={distributors} onView={handleView} onDelete={handleDelete} />

        {/* Dialogs */}
        <CreateOrderDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSuccess={loadData} />

        <OrderViewDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          order={selectedOrder}
          distributor={distributors.find((d) => d.id === selectedOrder?.distributorId) || null}
          products={products}
          onUpdate={loadData}
        />
      </div>
    </DashboardLayout>
  )
}
