"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { SalesOrder, Distributor, Product } from "@/lib/storage"
import { storage } from "@/lib/storage"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatPKR, formatPKRWithDecimals } from "@/lib/utils"

interface OrderViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: SalesOrder | null
  distributor: Distributor | null
  products: Product[]
  onUpdate: () => void
}

export function OrderViewDialog({ open, onOpenChange, order, distributor, products, onUpdate }: OrderViewDialogProps) {
  const [paymentStatus, setPaymentStatus] = useState(order?.paymentStatus || "Pending")
  const [deliveryStatus, setDeliveryStatus] = useState(order?.deliveryStatus || "Pending")

  if (!order || !distributor) return null

  const getProductName = (id: string) => {
    return products.find((p) => p.id === id)?.name || "Unknown Product"
  }

  const handleUpdate = () => {
    storage.updateSalesOrder(order.id, {
      paymentStatus: paymentStatus as any,
      deliveryStatus: deliveryStatus as any,
    })
    onUpdate()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Order Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Order Number</div>
              <div className="text-xl font-mono font-bold">{order.orderNumber}</div>
              <div className="text-sm text-muted-foreground mt-2">{new Date(order.createdAt).toLocaleString()}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Total Amount</div>
              <div className="text-2xl font-bold">{formatPKR(order.totalAmount)}</div>
            </div>
          </div>

          {/* Company Information */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="font-semibold mb-2">Company Details</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Company</div>
                <div className="font-medium">{distributor.name}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Contact Person</div>
                <div className="font-medium">{distributor.contactPerson}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Phone</div>
                <div className="font-medium">{distributor.phone}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Location</div>
                <div className="font-medium">
                  {distributor.city}, {distributor.state}
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <div className="font-semibold mb-3">Order Items</div>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{getProductName(item.productId)}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatPKRWithDecimals(item.price)}</TableCell>
                      <TableCell className="text-right">{formatPKRWithDecimals(item.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>{formatPKRWithDecimals(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax (18% GST):</span>
              <span>{formatPKRWithDecimals(order.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Discount:</span>
              <span>-{formatPKRWithDecimals(order.discount)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total Amount:</span>
              <span>{formatPKRWithDecimals(order.totalAmount)}</span>
            </div>
          </div>

          {/* Status Management */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Payment Status</div>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Partial">Partial</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">Delivery Status</div>
              <Select value={deliveryStatus} onValueChange={setDeliveryStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                handleUpdate()
                onOpenChange(false)
              }}
            >
              Update Status
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
