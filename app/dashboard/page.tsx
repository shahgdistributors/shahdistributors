"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Users, ShoppingCart, TrendingUp, AlertTriangle, TrendingDown } from "lucide-react"
import { storage, type Product, type SalesOrder } from "@/lib/storage"
import { Badge } from "@/components/ui/badge"
import { formatPKR } from "@/lib/utils"

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<SalesOrder[]>([])
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalDistributors: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStockItems: 0,
    pendingOrders: 0,
    monthRevenue: 0,
    recentOrders: [] as SalesOrder[],
    lowStockProducts: [] as Product[],
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const allProducts = storage.getProducts()
    const allOrders = storage.getSalesOrders()
    const allDistributors = storage.getDistributors()

    // Calculate stats
    const lowStockProducts = allProducts.filter((p) => p.stock <= p.minStock)
    const pendingOrders = allOrders.filter((o) => o.deliveryStatus === "Pending").length
    const totalRevenue = allOrders.reduce((sum, o) => sum + o.totalAmount, 0)

    // Calculate month revenue
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthOrders = allOrders.filter((o) => new Date(o.createdAt) >= monthStart)
    const monthRevenue = monthOrders.reduce((sum, o) => sum + o.totalAmount, 0)

    // Get recent orders
    const recentOrders = [...allOrders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)

    setProducts(allProducts)
    setOrders(allOrders)
    setStats({
      totalProducts: allProducts.length,
      totalDistributors: allDistributors.length,
      totalOrders: allOrders.length,
      totalRevenue,
      lowStockItems: lowStockProducts.length,
      pendingOrders,
      monthRevenue,
      recentOrders,
      lowStockProducts: lowStockProducts.slice(0, 5),
    })
  }

  const getDistributorName = (id: string) => {
    return storage.getDistributors().find((d) => d.id === id)?.name || "Unknown"
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome to your distribution management system</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
              <Package className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground mt-1">Active in inventory</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Companies</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDistributors}</div>
              <p className="text-xs text-muted-foreground mt-1">Active partners</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              <ShoppingCart className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.pendingOrders} pending delivery</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Month Revenue</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPKR(stats.monthRevenue)}</div>
              <p className="text-xs text-muted-foreground mt-1">Total: {formatPKR(stats.totalRevenue)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        {stats.lowStockItems > 0 && (
          <Card className="border-orange-500/50 bg-orange-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-500">
                <AlertTriangle className="w-5 h-5" />
                Low Stock Alert
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {stats.lowStockItems} product{stats.lowStockItems > 1 ? "s are" : " is"} running low on stock. Please
                restock soon.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No orders yet. Create your first order to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-mono font-medium text-sm">{order.orderNumber}</div>
                        <div className="text-xs text-muted-foreground">{getDistributorName(order.distributorId)}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatPKR(order.totalAmount)}</div>
                        <Badge variant="outline" className="text-xs mt-1">
                          {order.deliveryStatus}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Low Stock Products */}
          <Card>
            <CardHeader>
              <CardTitle>Low Stock Products</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.lowStockProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>All products are well stocked.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{product.name}</div>
                        <div className="text-xs text-muted-foreground">{product.category}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold flex items-center gap-2">
                          <TrendingDown className="w-4 h-4 text-orange-500" />
                          {product.stock} {product.unit}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">Min: {product.minStock}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
