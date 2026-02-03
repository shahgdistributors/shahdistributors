"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { Distributor } from "@/lib/storage"
import { MapPin, Phone, Mail, AlertCircle } from "lucide-react"
import { formatPKR } from "@/lib/utils"

interface DistributorViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  distributor: Distributor | null
  totalPurchased: number
}

export function DistributorViewDialog({ open, onOpenChange, distributor, totalPurchased }: DistributorViewDialogProps) {
  if (!distributor) return null

  const hasOutstanding = distributor.outstandingBalance > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Company Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold">{distributor.name}</h3>
              <p className="text-muted-foreground">{distributor.contactPerson}</p>
            </div>
            {hasOutstanding ? (
              <Badge variant="outline" className="gap-1 border-orange-500 text-orange-500">
                <AlertCircle className="w-3 h-3" />
                Outstanding
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
                <span>{distributor.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{distributor.email}</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <div>{distributor.address}</div>
                  <div className="text-muted-foreground">
                    {distributor.city}, {distributor.state} - {distributor.pincode}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Company Details */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Business Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="text-xs text-muted-foreground">GST Number</div>
                <div className="font-mono font-medium mt-1">{distributor.gstNumber || "Not provided"}</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="text-xs text-muted-foreground">Total Purchased</div>
                <div className="text-lg font-bold mt-1">{formatPKR(totalPurchased)}</div>
              </div>
            </div>
          </div>

          {/* Payables Status */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Payables Status</h4>
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Outstanding Balance</span>
                <span className="text-lg font-bold">{formatPKR(distributor.outstandingBalance)}</span>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="flex gap-6 text-xs text-muted-foreground border-t pt-4">
            <div>
              <span>Added: </span>
              <span>{new Date(distributor.createdAt).toLocaleDateString()}</span>
            </div>
            <div>
              <span>Last Updated: </span>
              <span>{new Date(distributor.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
