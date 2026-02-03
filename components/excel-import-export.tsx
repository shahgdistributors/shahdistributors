"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Upload, FileSpreadsheet } from "lucide-react"
import { storage } from "@/lib/storage"
import {
  exportProductsToExcel,
  exportDistributorsToExcel,
  exportOrdersToExcel,
  exportAllDataToExcel,
  importProductsFromExcel,
  importDistributorsFromExcel,
  importCustomersFromExcel,
} from "@/lib/excel-utils"
import { useToast } from "@/hooks/use-toast"

export function ExcelImportExport() {
  const [importing, setImporting] = useState(false)
  const { toast } = useToast()

  const handleExportProducts = () => {
    const products = storage.getProducts()
    exportProductsToExcel(products)
    toast({
      title: "Export Successful",
      description: `${products.length} products exported to Excel`,
    })
  }

  const handleExportDistributors = () => {
    const distributors = storage.getDistributors()
    exportDistributorsToExcel(distributors)
    toast({
      title: "Export Successful",
      description: `${distributors.length} distributors exported to Excel`,
    })
  }

  const handleExportOrders = () => {
    const orders = storage.getSalesOrders()
    const distributors = storage.getDistributors()
    const distMap = new Map(distributors.map((d) => [d.id, d.name]))
    exportOrdersToExcel(orders, distMap)
    toast({
      title: "Export Successful",
      description: `${orders.length} orders exported to Excel`,
    })
  }

  const handleExportAll = () => {
    const products = storage.getProducts()
    const distributors = storage.getDistributors()
    const orders = storage.getSalesOrders()
    const distMap = new Map(distributors.map((d) => [d.id, d.name]))
    exportAllDataToExcel(products, distributors, orders, distMap)
    toast({
      title: "Export Successful",
      description: "Complete database exported to Excel",
    })
  }

  const handleImportProducts = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    try {
      const products = await importProductsFromExcel(file)
      let imported = 0

      products.forEach((product) => {
        if (product.name && product.category && product.brand) {
          storage.createProduct({
            id: Date.now().toString() + Math.random(),
            name: product.name,
            category: product.category,
            brand: product.brand,
            description: product.description || "",
            price: product.price || 0,
            stock: product.stock || 0,
            minStock: product.minStock || 0,
            unit: product.unit || "Pieces",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          imported++
        }
      })

      toast({
        title: "Import Successful",
        description: `${imported} products imported from Excel`,
      })
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Error reading Excel file. Please check the format.",
        variant: "destructive",
      })
    } finally {
      setImporting(false)
      e.target.value = ""
    }
  }

  const handleImportDistributors = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    try {
      const distributors = await importDistributorsFromExcel(file)
      let imported = 0

      distributors.forEach((dist) => {
        if (dist.name && dist.contactPerson && dist.phone) {
          storage.createDistributor({
            id: Date.now().toString() + Math.random(),
            name: dist.name,
            contactPerson: dist.contactPerson,
            email: dist.email || "",
            phone: dist.phone,
            address: dist.address || "",
            city: dist.city || "",
            state: dist.state || "",
            pincode: dist.pincode || "",
            gstNumber: dist.gstNumber || "",
            creditLimit: dist.creditLimit || 0,
            outstandingBalance: dist.outstandingBalance || 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          imported++
        }
      })

      toast({
        title: "Import Successful",
        description: `${imported} distributors imported from Excel`,
      })
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Error reading Excel file. Please check the format.",
        variant: "destructive",
      })
    } finally {
      setImporting(false)
      e.target.value = ""
    }
  }

  const handleImportCustomers = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    try {
      const customers = await importCustomersFromExcel(file)
      let imported = 0

      customers.forEach((customer) => {
        if (customer.name && customer.phone) {
          storage.createCustomer({
            id: Date.now().toString() + Math.random(),
            name: customer.name,
            phone: customer.phone,
            email: customer.email || "",
            address: customer.address || "",
            city: customer.city || "",
            outstandingBalance: customer.outstandingBalance || 0,
            totalPurchases: customer.totalPurchases || 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          imported++
        }
      })

      toast({
        title: "Import Successful",
        description: `${imported} customers imported from Excel`,
      })
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Error reading Excel file. Please check the format.",
        variant: "destructive",
      })
    } finally {
      setImporting(false)
      e.target.value = ""
    }
  }

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Data to Excel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button variant="outline" onClick={handleExportProducts} className="gap-2 bg-transparent">
              <FileSpreadsheet className="w-4 h-4" />
              Export Products
            </Button>
            <Button variant="outline" onClick={handleExportDistributors} className="gap-2 bg-transparent">
              <FileSpreadsheet className="w-4 h-4" />
              Export Companies
            </Button>
            <Button variant="outline" onClick={handleExportOrders} className="gap-2 bg-transparent">
              <FileSpreadsheet className="w-4 h-4" />
              Export Orders
            </Button>
            <Button onClick={handleExportAll} className="gap-2">
              <Download className="w-4 h-4" />
              Export All Data
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Download your data in Excel format for backup or reporting</p>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Import Data from Excel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImportProducts}
                disabled={importing}
                className="hidden"
                id="import-products"
              />
              <label htmlFor="import-products">
                <Button variant="outline" className="gap-2 w-full bg-transparent" disabled={importing} asChild>
                  <span>
                    <Upload className="w-4 h-4" />
                    Import Products
                  </span>
                </Button>
              </label>
            </div>
            <div>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImportDistributors}
                disabled={importing}
                className="hidden"
                id="import-distributors"
              />
              <label htmlFor="import-distributors">
                <Button variant="outline" className="gap-2 w-full bg-transparent" disabled={importing} asChild>
                  <span>
                    <Upload className="w-4 h-4" />
                    Import Companies
                  </span>
                </Button>
              </label>
            </div>
            <div>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImportCustomers}
                disabled={importing}
                className="hidden"
                id="import-customers"
              />
              <label htmlFor="import-customers">
                <Button variant="outline" className="gap-2 w-full bg-transparent" disabled={importing} asChild>
                  <span>
                    <Upload className="w-4 h-4" />
                    Import Customers
                  </span>
                </Button>
              </label>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Import data from Excel files. Make sure the columns match the expected format.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
