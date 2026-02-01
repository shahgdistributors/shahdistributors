"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { Customer, POSTransaction } from "@/lib/storage"
import { storage } from "@/lib/storage"
import { Phone, Mail, MapPin } from "lucide-react"
import { formatPKR } from "@/lib/utils"
import { useState, useEffect } from "react"

interface CustomerViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer | null
}

export function CustomerViewDialog({ open, onOpenChange, customer }: CustomerViewDialogProps) {
  const [purchases, setPurchases] = useState<POSTransaction[]>([])

  useEffect(() => {
    if (customer && open) {
      const purchases = storage.getCustomerPurchases(customer.id)
      setPurchases(purchases)
    }
  }, [customer, open])

  if (!customer) return null

  const hasBalance = customer.outstandingBalance > 0
  const totalSold = purchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Customer Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold">{customer.name}</h3>
              <p className="text-muted-foreground">Customer ID: {customer.id}</p>
            </div>
            {hasBalance ? (
              <Badge variant="outline" className="gap-1 border-orange-500 text-orange-500">
                Outstanding Balance
              </Badge>
            ) : (
              <Badge variant="secondary">Clear</Badge>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Contact Information</h4>
            <div className="grid gap-3">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{customer.phone}</span>
              </div>
              {customer.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{customer.email}</span>
                </div>
              )}
              {customer.address && (
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <div>{customer.address}</div>
                    {customer.city && <div className="text-muted-foreground">{customer.city}</div>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Summary */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Account Summary</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="text-xs text-muted-foreground">Total Sold</div>
                <div className="text-lg font-bold mt-1">{formatPKR(totalSold)}</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="text-xs text-muted-foreground">Outstanding Balance</div>
                <div className={`text-lg font-bold mt-1 ${hasBalance ? "text-orange-500" : "text-primary"}`}>
                  {formatPKR(customer.outstandingBalance)}
                </div>
              </div>
            </div>
          </div>

          {/* Purchase History */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Recent Purchase History</h4>
            {purchases.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm bg-muted/50 rounded-lg">
                No purchases yet
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {purchases.slice().reverse().map((purchase) => (
                  <div key={purchase.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg text-sm">
                    <div>
                      <div className="font-medium">Receipt #{purchase.receiptNumber}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(purchase.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatPKR(purchase.totalAmount)}</div>
                      <div className="text-xs text-muted-foreground">{purchase.items.length} items</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="flex gap-6 text-xs text-muted-foreground border-t pt-4">
            <div>
              <span>Added: </span>
              <span>{new Date(customer.createdAt).toLocaleDateString()}</span>
            </div>
            <div>
              <span>Last Updated: </span>
              <span>{new Date(customer.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
