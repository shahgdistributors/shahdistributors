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
}

export function DistributorViewDialog({ open, onOpenChange, distributor }: DistributorViewDialogProps) {
  if (!distributor) return null

  const creditUsagePercent = (distributor.outstandingBalance / distributor.creditLimit) * 100
  const isOverLimit = distributor.outstandingBalance > distributor.creditLimit

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Distributor Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold">{distributor.name}</h3>
              <p className="text-muted-foreground">{distributor.contactPerson}</p>
            </div>
            {isOverLimit ? (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="w-3 h-3" />
                Over Credit Limit
              </Badge>
            ) : (
              <Badge variant="secondary">Active</Badge>
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

          {/* Business Details */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Business Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="text-xs text-muted-foreground">GST Number</div>
                <div className="font-mono font-medium mt-1">{distributor.gstNumber || "Not provided"}</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <div className="text-xs text-muted-foreground">Credit Limit</div>
                <div className="text-lg font-bold mt-1">{formatPKR(distributor.creditLimit)}</div>
              </div>
            </div>
          </div>

          {/* Credit Status */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Credit Status</h4>
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Outstanding Balance</span>
                <span className="text-lg font-bold">{formatPKR(distributor.outstandingBalance)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Available Credit</span>
                <span className="text-lg font-bold text-primary">
                  {formatPKR(Math.max(0, distributor.creditLimit - distributor.outstandingBalance))}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Credit Usage</span>
                  <span>{creditUsagePercent.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      isOverLimit ? "bg-destructive" : creditUsagePercent >= 80 ? "bg-orange-500" : "bg-primary"
                    }`}
                    style={{ width: `${Math.min(100, creditUsagePercent)}%` }}
                  />
                </div>
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
