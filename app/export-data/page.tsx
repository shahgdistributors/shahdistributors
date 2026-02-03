"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { storage } from "@/lib/storage"
import {
  exportProductsToExcel,
  exportCustomersOutstandingToExcel,
  exportInventoryToExcel,
  exportPOSTransactionsToExcel,
  exportOrdersToExcel,
  exportDistributorsToExcel,
} from "@/lib/excel-utils"
import { Download, FileSpreadsheet, AlertCircle, Users, Package, ShoppingCart, Warehouse } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ExportDataPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleExport = async (type: string, callback: () => void) => {
    setIsLoading(type)
    try {
      // Small delay to show loading state
      setTimeout(() => {
        callback()
        setIsLoading(null)
      }, 300)
    } catch (error) {
      console.error(`Error exporting ${type}:`, error)
      setIsLoading(null)
    }
  }

  const exportCustomersOutstanding = () => {
    const customers = storage.getCustomers()
    exportCustomersOutstandingToExcel(customers)
  }

  const exportInventory = () => {
    const products = storage.getProducts()
    exportInventoryToExcel(products)
  }

  const exportPOSTransactions = () => {
    const transactions = storage.getPOSTransactions()
    exportPOSTransactionsToExcel(transactions)
  }

  const exportProducts = () => {
    const products = storage.getProducts()
    exportProductsToExcel(products)
  }

  const exportOrders = () => {
    const orders = storage.getSalesOrders()
    const distributors = storage.getDistributors()
    const distributorNames = new Map(distributors.map((d) => [d.id, d.name]))
    exportOrdersToExcel(orders, distributorNames)
  }

  const exportDistributors = () => {
    const distributors = storage.getDistributors()
    exportDistributorsToExcel(distributors)
  }

  const exportStats = {
    customers: storage.getCustomers().length,
    products: storage.getProducts().length,
    orders: storage.getSalesOrders().length,
    posTransactions: storage.getPOSTransactions().length,
    outstandingCustomers: storage.getCustomers().filter((c) => c.outstandingBalance > 0).length,
    totalOutstanding: storage.getCustomers().reduce((sum, c) => sum + c.outstandingBalance, 0),
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Export Data</h1>
          <p className="text-muted-foreground mt-1">Download all your business data in Excel format for analysis and backup</p>
        </div>

        {/* Info Alert */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            All exports are generated in Excel format (.xlsx) and saved to your device. Use these exports for reporting, analysis, or backup purposes.
          </AlertDescription>
        </Alert>

        {/* Outstanding Customers Sheet */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  Outstanding Customers Report
                </CardTitle>
                <CardDescription>
                  Export all customers with outstanding balances for follow-up and collections
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground">Customers with Outstanding</div>
                  <div className="text-2xl font-bold">{exportStats.outstandingCustomers}</div>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground">Total Outstanding</div>
                  <div className="text-2xl font-bold">Rs {exportStats.totalOutstanding.toLocaleString("en-PK")}</div>
                </div>
              </div>
              <Button
                onClick={() => handleExport("outstanding", exportCustomersOutstanding)}
                disabled={isLoading === "outstanding"}
                className="w-full"
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                {isLoading === "outstanding" ? "Exporting..." : "Download Outstanding Sheet"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* POS Transactions Sheet */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                  POS Transactions Report
                </CardTitle>
                <CardDescription>
                  Export all POS transactions with customer details, items, and payment information
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground">Total Transactions</div>
                  <div className="text-2xl font-bold">{exportStats.posTransactions}</div>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground">Unique Customers</div>
                  <div className="text-2xl font-bold">{exportStats.customers}</div>
                </div>
              </div>
              <Button
                onClick={() => handleExport("pos", exportPOSTransactions)}
                disabled={isLoading === "pos"}
                className="w-full"
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                {isLoading === "pos" ? "Exporting..." : "Download Order Sheet"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Sheet */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Warehouse className="w-5 h-5 text-green-600" />
                  Inventory Report
                </CardTitle>
                <CardDescription>
                  Export complete inventory with stock levels, pricing, and low stock alerts
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground">Total Products</div>
                  <div className="text-2xl font-bold">{exportStats.products}</div>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground">Low Stock Items</div>
                  <div className="text-2xl font-bold">
                    {storage
                      .getProducts()
                      .filter((p) => p.stock <= p.minStock).length}
                  </div>
                </div>
              </div>
              <Button
                onClick={() => handleExport("inventory", exportInventory)}
                disabled={isLoading === "inventory"}
                className="w-full"
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                {isLoading === "inventory" ? "Exporting..." : "Download Inventory Sheet"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Products Sheet */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-600" />
                  Products Master Data
                </CardTitle>
                <CardDescription>
                  Export all product information including pricing, categories, and descriptions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => handleExport("products", exportProducts)}
              disabled={isLoading === "products"}
              className="w-full"
              size="lg"
            >
              <Download className="w-4 h-4 mr-2" />
              {isLoading === "products" ? "Exporting..." : "Download Products Sheet"}
            </Button>
          </CardContent>
        </Card>

        {/* Sales Orders Sheet */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-red-600" />
                  Sales Orders Report
                </CardTitle>
                <CardDescription>
                  Export all sales orders with distributor details, amounts, and delivery status
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted p-3 rounded-lg">
                  <div className="text-sm text-muted-foreground">Total Orders</div>
                  <div className="text-2xl font-bold">{exportStats.orders}</div>
                </div>
              </div>
              <Button
                onClick={() => handleExport("orders", exportOrders)}
                disabled={isLoading === "orders"}
                className="w-full"
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                {isLoading === "orders" ? "Exporting..." : "Download Orders Sheet"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Companies Sheet */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  Companies Master Data
                </CardTitle>
                <CardDescription>
                  Export all distributor information including contact details and credit limits
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => handleExport("distributors", exportDistributors)}
              disabled={isLoading === "distributors"}
              className="w-full"
              size="lg"
            >
              <Download className="w-4 h-4 mr-2" />
              {isLoading === "distributors" ? "Exporting..." : "Download Companies Sheet"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
