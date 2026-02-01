"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { storage } from "@/lib/storage"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, Package, Users, ShoppingCart } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatPKR } from "@/lib/utils"

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("all")
  const [reports, setReports] = useState({
    salesByDistributor: [] as Array<{ id: string; name: string; orders: number; revenue: number }>,
    salesByProduct: [] as Array<{ id: string; name: string; quantity: number; revenue: number }>,
    topProducts: [] as Array<{ id: string; name: string; quantity: number; revenue: number }>,
    topDistributors: [] as Array<{ id: string; name: string; orders: number; revenue: number }>,
    summary: {
      totalRevenue: 0,
      totalOrders: 0,
      totalProducts: 0,
      totalDistributors: 0,
      avgOrderValue: 0,
    },
  })

  useEffect(() => {
    generateReports()
  }, [timeRange])

  const generateReports = () => {
    const products = storage.getProducts()
    const distributors = storage.getDistributors()
    let orders = storage.getSalesOrders()

    // Filter by time range
    const now = new Date()
    if (timeRange === "month") {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      orders = orders.filter((o) => new Date(o.createdAt) >= monthStart)
    } else if (timeRange === "week") {
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      orders = orders.filter((o) => new Date(o.createdAt) >= weekStart)
    }

    // Sales by Distributor
    const salesByDist = distributors.map((dist) => {
      const distOrders = orders.filter((o) => o.distributorId === dist.id)
      return {
        id: dist.id,
        name: dist.name,
        orders: distOrders.length,
        revenue: distOrders.reduce((sum, o) => sum + o.totalAmount, 0),
      }
    })
    salesByDist.sort((a, b) => b.revenue - a.revenue)

    // Sales by Product
    const productSales = new Map<string, { quantity: number; revenue: number }>()
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const existing = productSales.get(item.productId) || { quantity: 0, revenue: 0 }
        productSales.set(item.productId, {
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + item.total,
        })
      })
    })

    const salesByProd = Array.from(productSales.entries()).map(([id, data]) => {
      const product = products.find((p) => p.id === id)
      return {
        id,
        name: product?.name || "Unknown",
        quantity: data.quantity,
        revenue: data.revenue,
      }
    })
    salesByProd.sort((a, b) => b.revenue - a.revenue)

    // Summary
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0)
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0

    setReports({
      salesByDistributor: salesByDist,
      salesByProduct: salesByProd,
      topProducts: salesByProd.slice(0, 5),
      topDistributors: salesByDist.slice(0, 5),
      summary: {
        totalRevenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        totalDistributors: distributors.length,
        avgOrderValue,
      },
    })
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
            <p className="text-muted-foreground mt-1">View detailed insights and performance metrics</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPKR(reports.summary.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Avg: {formatPKR(reports.summary.avgOrderValue)} per order
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              <ShoppingCart className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.summary.totalOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">In selected period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Products</CardTitle>
              <Package className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.summary.totalProducts}</div>
              <p className="text-xs text-muted-foreground mt-1">In catalog</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Distributors</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reports.summary.totalDistributors}</div>
              <p className="text-xs text-muted-foreground mt-1">Partners</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              {reports.topProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No sales data available for this period.</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Qty Sold</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.topProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell className="text-right">{product.quantity}</TableCell>
                          <TableCell className="text-right font-semibold">{formatPKR(product.revenue)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Distributors */}
          <Card>
            <CardHeader>
              <CardTitle>Top Distributors</CardTitle>
            </CardHeader>
            <CardContent>
              {reports.topDistributors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No sales data available for this period.</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Distributor</TableHead>
                        <TableHead className="text-right">Orders</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.topDistributors.map((dist) => (
                        <TableRow key={dist.id}>
                          <TableCell className="font-medium">{dist.name}</TableCell>
                          <TableCell className="text-right">{dist.orders}</TableCell>
                          <TableCell className="text-right font-semibold">{formatPKR(dist.revenue)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Complete Sales by Product */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Product (Complete List)</CardTitle>
          </CardHeader>
          <CardContent>
            {reports.salesByProduct.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No sales data available for this period.</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Product Name</TableHead>
                      <TableHead className="text-right">Quantity Sold</TableHead>
                      <TableHead className="text-right">Total Revenue</TableHead>
                      <TableHead className="text-right">% of Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.salesByProduct.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-right">{product.quantity}</TableCell>
                        <TableCell className="text-right font-semibold">{formatPKR(product.revenue)}</TableCell>
                        <TableCell className="text-right">
                          {((product.revenue / reports.summary.totalRevenue) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Complete Sales by Distributor */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Distributor (Complete List)</CardTitle>
          </CardHeader>
          <CardContent>
            {reports.salesByDistributor.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No sales data available for this period.</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Distributor Name</TableHead>
                      <TableHead className="text-right">Total Orders</TableHead>
                      <TableHead className="text-right">Total Revenue</TableHead>
                      <TableHead className="text-right">Avg Order Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.salesByDistributor.map((dist) => (
                      <TableRow key={dist.id}>
                        <TableCell className="font-medium">{dist.name}</TableCell>
                        <TableCell className="text-right">{dist.orders}</TableCell>
                        <TableCell className="text-right font-semibold">{formatPKR(dist.revenue)}</TableCell>
                        <TableCell className="text-right">
                          {formatPKR(dist.orders > 0 ? dist.revenue / dist.orders : 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
