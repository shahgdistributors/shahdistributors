"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { storage, type Product, type Distributor, type OrderItem } from "@/lib/storage"
import { Plus, Trash2 } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { formatPKRWithDecimals } from "@/lib/utils"

interface CreateOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateOrderDialog({ open, onOpenChange, onSuccess }: CreateOrderDialogProps) {
  const [distributors, setDistributors] = useState<Distributor[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedDistributor, setSelectedDistributor] = useState("")
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [discount, setDiscount] = useState("0")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setDistributors(storage.getDistributors())
      setProducts(storage.getProducts())
      setSelectedDistributor("")
      setOrderItems([])
      setDiscount("0")
    }
  }, [open])

  const addOrderItem = () => {
    setOrderItems([...orderItems, { productId: "", quantity: 1, price: 0, total: 0 }])
  }

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index))
  }

  const updateOrderItem = (index: number, field: keyof OrderItem, value: any) => {
    const updated = [...orderItems]
    updated[index] = { ...updated[index], [field]: value }

    if (field === "productId") {
      const product = products.find((p) => p.id === value)
      if (product) {
        updated[index].price = product.price
        updated[index].total = updated[index].quantity * product.price
      }
    } else if (field === "quantity" || field === "price") {
      updated[index].total = updated[index].quantity * updated[index].price
    }

    setOrderItems(updated)
  }

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * 0.18 // 18% GST
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() - Number.parseFloat(discount || "0")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = getCurrentUser()
      if (!user) throw new Error("User not authenticated")

      const orderNumber = `ORD-${Date.now()}`
      const subtotal = calculateSubtotal()
      const taxAmount = calculateTax()
      const totalAmount = calculateTotal()

      storage.createSalesOrder({
        id: Date.now().toString(),
        orderNumber,
        distributorId: selectedDistributor,
        items: orderItems,
        subtotal,
        taxAmount,
        discount: Number.parseFloat(discount || "0"),
        totalAmount,
        paymentStatus: "Pending",
        deliveryStatus: "Pending",
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      // Update product stock and create inventory transactions (purchase from distributor)
      orderItems.forEach((item) => {
        const product = products.find((p) => p.id === item.productId)
        if (product) {
          storage.updateProduct(item.productId, {
            stock: product.stock + item.quantity,
          })

          storage.createInventoryTransaction({
            id: `${Date.now()}-${item.productId}`,
            productId: item.productId,
            transactionType: "In",
            quantity: item.quantity,
            createdAt: new Date().toISOString(),
          })
        }
      })

      // Update distributor outstanding balance
      const distributor = distributors.find((d) => d.id === selectedDistributor)
      if (distributor) {
        storage.updateDistributor(selectedDistributor, {
          outstandingBalance: distributor.outstandingBalance + totalAmount,
        })
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error creating order:", error)
    } finally {
      setLoading(false)
    }
  }

  const isValid = selectedDistributor && orderItems.length > 0 && orderItems.every((item) => item.productId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Distributor Selection */}
          <div className="space-y-2">
            <Label>Select Distributor *</Label>
            <Select value={selectedDistributor} onValueChange={setSelectedDistributor}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a distributor" />
              </SelectTrigger>
              <SelectContent>
                {distributors.map((dist) => (
                  <SelectItem key={dist.id} value={dist.id}>
                    {dist.name} - {dist.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Order Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Order Items *</Label>
              <Button type="button" variant="outline" size="sm" onClick={addOrderItem} className="gap-2 bg-transparent">
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            </div>

            {orderItems.map((item, index) => (
              <div key={index} className="flex gap-3 items-end border rounded-lg p-3">
                <div className="flex-1 space-y-2">
                  <Label className="text-xs">Product</Label>
                  <Select value={item.productId} onValueChange={(value) => updateOrderItem(index, "productId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((prod) => (
                        <SelectItem key={prod.id} value={prod.id}>
                          {prod.name} (Stock: {prod.stock})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24 space-y-2">
                  <Label className="text-xs">Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateOrderItem(index, "quantity", Number.parseInt(e.target.value))}
                  />
                </div>
                <div className="w-28 space-y-2">
                  <Label className="text-xs">Price (PKR)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => updateOrderItem(index, "price", Number.parseFloat(e.target.value))}
                  />
                </div>
                <div className="w-32 space-y-2">
                  <Label className="text-xs">Total</Label>
                  <div className="h-10 flex items-center font-semibold">{formatPKRWithDecimals(item.total)}</div>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeOrderItem(index)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}

            {orderItems.length === 0 && (
              <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                <p>No items added. Click "Add Item" to start building the order.</p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          {orderItems.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatPKRWithDecimals(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (18% GST):</span>
                <span>{formatPKRWithDecimals(calculateTax())}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Discount:</span>
                <Input
                  type="number"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-32 h-8"
                />
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total Amount:</span>
                <span>{formatPKRWithDecimals(calculateTotal())}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || loading}>
              {loading ? "Creating Order..." : "Create Order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
