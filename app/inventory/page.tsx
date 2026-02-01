"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Minus, Search, TrendingUp, TrendingDown, Package, SlidersHorizontal } from "lucide-react"
import { AddStockDialog } from "@/components/inventory/add-stock-dialog"
import { ReduceStockDialog } from "@/components/inventory/reduce-stock-dialog"
import { ManualAdjustDialog } from "@/components/inventory/manual-adjust-dialog"
import { storage, type InventoryTransaction, type Product } from "@/lib/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatPKR } from "@/lib/utils"

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<InventoryTransaction[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [reduceDialogOpen, setReduceDialogOpen] = useState(false)
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false)

  const loadData = () => {
    setProducts(storage.getProducts())
    const allTransactions = storage.getInventoryTransactions()
    // Sort by date descending
    allTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    setTransactions(allTransactions)
    setFilteredTransactions(allTransactions)
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = transactions.filter((t) => {
        const product = products.find((p) => p.id === t.productId)
        return (
          product?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.type.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })
      setFilteredTransactions(filtered)
    } else {
      setFilteredTransactions(transactions)
    }
  }, [searchQuery, transactions, products])

  const getProductName = (id: string) => {
    return products.find((p) => p.id === id)?.name || "Unknown Product"
  }

  const getTransactionIcon = (type: string) => {
    if (type === "Sale") return <TrendingDown className="w-4 h-4 text-destructive" />
    return <TrendingUp className="w-4 h-4 text-primary" />
  }

  const getTransactionBadge = (type: string) => {
    const variants: Record<string, any> = {
      Purchase: "default",
      Sale: "secondary",
      Return: "outline",
      Adjustment: "outline",
    }
    return <Badge variant={variants[type] || "secondary"}>{type}</Badge>
  }

  const totalProducts = products.length
  const lowStockItems = products.filter((p) => p.stock <= p.minStock).length
  const outOfStockItems = products.filter((p) => p.stock === 0).length
  const totalValue = products.reduce((sum, p) => sum + p.stock * p.price, 0)

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
            <p className="text-muted-foreground mt-1">Track stock levels and manage inventory transactions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setReduceDialogOpen(true)} className="gap-2">
              <Minus className="w-4 h-4" />
              Reduce Stock
            </Button>
            <Button variant="outline" onClick={() => setAdjustDialogOpen(true)} className="gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Manual Adjustment
            </Button>
            <Button onClick={() => setAddDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Stock
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
              <Package className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Inventory Value</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPKR(totalValue)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock</CardTitle>
              <TrendingDown className="w-4 h-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{lowStockItems}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Out of Stock</CardTitle>
              <Package className="w-4 h-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{outOfStockItems}</div>
            </CardContent>
          </Card>
        </div>

        {/* Stock Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Current Stock Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Current Stock</TableHead>
                    <TableHead className="text-right">Min Level</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.slice(0, 10).map((product) => {
                    const isLowStock = product.stock <= product.minStock
                    const isOutOfStock = product.stock === 0
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell className="text-right">
                          {product.stock} {product.unit}
                        </TableCell>
                        <TableCell className="text-right">
                          {product.minStock} {product.unit}
                        </TableCell>
                        <TableCell className="text-right">{formatPKR(product.stock * product.price)}</TableCell>
                        <TableCell className="text-center">
                          {isOutOfStock ? (
                            <Badge variant="destructive">Out of Stock</Badge>
                          ) : isLowStock ? (
                            <Badge variant="outline" className="border-orange-500 text-orange-500">
                              Low Stock
                            </Badge>
                          ) : (
                            <Badge variant="secondary">In Stock</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
            {products.length > 10 && (
              <div className="text-center text-sm text-muted-foreground mt-4">
                Showing 10 of {products.length} products. View all in Products page.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No transactions found.</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Date</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-center">Type</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.slice(0, 20).map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="text-sm">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                          <div className="text-xs text-muted-foreground">
                            {new Date(transaction.createdAt).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{getProductName(transaction.productId)}</TableCell>
                        <TableCell className="text-center">{getTransactionBadge(transaction.type)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {getTransactionIcon(transaction.type)}
                            <span className={transaction.quantity < 0 ? "text-destructive" : "text-primary"}>
                              {Math.abs(transaction.quantity)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{transaction.reference || "-"}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{transaction.notes || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {filteredTransactions.length > 20 && (
              <div className="text-center text-sm text-muted-foreground mt-4">
                Showing 20 of {filteredTransactions.length} transactions
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialogs */}
        <AddStockDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onSuccess={loadData} />
        <ReduceStockDialog open={reduceDialogOpen} onOpenChange={setReduceDialogOpen} onSuccess={loadData} />
        <ManualAdjustDialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen} onSuccess={loadData} />
      </div>
    </DashboardLayout>
  )
}
