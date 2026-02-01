"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Filter } from "lucide-react"
import { ProductTable } from "@/components/products/product-table"
import { ProductFormDialog } from "@/components/products/product-form-dialog"
import { storage, type Product } from "@/lib/storage"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const loadProducts = () => {
    const allProducts = storage.getProducts()
    setProducts(allProducts)
    setFilteredProducts(allProducts)
  }

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    let filtered = products

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((p) => p.category === categoryFilter)
    }

    // Stock filter
    if (stockFilter === "low") {
      filtered = filtered.filter((p) => p.stock <= p.minStock)
    } else if (stockFilter === "out") {
      filtered = filtered.filter((p) => p.stock === 0)
    }

    setFilteredProducts(filtered)
  }, [searchQuery, categoryFilter, stockFilter, products])

  const handleEdit = (product: Product) => {
    setSelectedProduct(product)
    setDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    storage.deleteProduct(id)
    loadProducts()
  }

  const handleAddNew = () => {
    setSelectedProduct(null)
    setDialogOpen(true)
  }

  const categories = Array.from(new Set(products.map((p) => p.category))).filter(Boolean)

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground mt-1">Manage your product catalog and inventory</p>
          </div>
          <Button onClick={handleAddNew} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name, category, or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={stockFilter} onValueChange={setStockFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Stock Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="low">Low Stock</SelectItem>
              <SelectItem value="out">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-card border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Total Products</div>
            <div className="text-2xl font-bold mt-1">{products.length}</div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Categories</div>
            <div className="text-2xl font-bold mt-1">{categories.length}</div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Low Stock Items</div>
            <div className="text-2xl font-bold mt-1 text-destructive">
              {products.filter((p) => p.stock <= p.minStock && p.stock > 0).length}
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Out of Stock</div>
            <div className="text-2xl font-bold mt-1 text-destructive">
              {products.filter((p) => p.stock === 0).length}
            </div>
          </div>
        </div>

        {/* Table */}
        <ProductTable products={filteredProducts} onEdit={handleEdit} onDelete={handleDelete} />

        {/* Form Dialog */}
        <ProductFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          product={selectedProduct}
          onSuccess={loadProducts}
        />
      </div>
    </DashboardLayout>
  )
}
