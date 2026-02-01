"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { storage, type Product } from "@/lib/storage"
import { getCurrentUser } from "@/lib/auth"

interface AddStockDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddStockDialog({ open, onOpenChange, onSuccess }: AddStockDialogProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [type, setType] = useState<"Purchase" | "Adjustment" | "Return">("Purchase")
  const [quantity, setQuantity] = useState("")
  const [reference, setReference] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setProducts(storage.getProducts())
      setSelectedProduct("")
      setType("Purchase")
      setQuantity("")
      setReference("")
      setNotes("")
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = getCurrentUser()
      if (!user) throw new Error("User not authenticated")

      const product = products.find((p) => p.id === selectedProduct)
      if (!product) throw new Error("Product not found")

      const qty = Number.parseInt(quantity)

      // Update product stock
      storage.updateProduct(selectedProduct, {
        stock: product.stock + qty,
      })

      // Create inventory transaction
      storage.createInventoryTransaction({
        id: `${Date.now()}-${selectedProduct}`,
        productId: selectedProduct,
        type,
        quantity: qty,
        reference,
        notes,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error adding stock:", error)
    } finally {
      setLoading(false)
    }
  }

  const selectedProductData = products.find((p) => p.id === selectedProduct)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Stock</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product">Product *</Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((prod) => (
                  <SelectItem key={prod.id} value={prod.id}>
                    {prod.name} (Current: {prod.stock} {prod.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProductData && (
              <div className="text-xs text-muted-foreground">
                Current Stock: {selectedProductData.stock} {selectedProductData.unit}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Transaction Type *</Label>
            <Select value={type} onValueChange={(v) => setType(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Purchase">Purchase</SelectItem>
                <SelectItem value="Return">Return from Customer</SelectItem>
                <SelectItem value="Adjustment">Stock Adjustment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity to Add *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
            {selectedProductData && quantity && (
              <div className="text-xs text-muted-foreground">
                New Stock: {selectedProductData.stock + Number.parseInt(quantity)} {selectedProductData.unit}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Reference Number</Label>
            <Input
              id="reference"
              placeholder="e.g., PO-12345, INV-67890"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about this transaction..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedProduct || !quantity || loading}>
              {loading ? "Adding..." : "Add Stock"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
