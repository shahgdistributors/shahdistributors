"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { Distributor } from "@/lib/storage"
import { storage } from "@/lib/storage"

interface DistributorFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  distributor?: Distributor | null
  onSuccess: () => void
}

export function DistributorFormDialog({ open, onOpenChange, distributor, onSuccess }: DistributorFormDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gstNumber: "",
    creditLimit: "",
    outstandingBalance: "",
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (distributor) {
      setFormData({
        name: distributor.name,
        contactPerson: distributor.contactPerson,
        email: distributor.email,
        phone: distributor.phone,
        address: distributor.address,
        city: distributor.city,
        state: distributor.state,
        pincode: distributor.pincode,
        gstNumber: distributor.gstNumber,
        creditLimit: distributor.creditLimit.toString(),
        outstandingBalance: distributor.outstandingBalance.toString(),
      })
    } else {
      setFormData({
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        gstNumber: "",
        creditLimit: "",
        outstandingBalance: "0",
      })
    }
  }, [distributor, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (distributor) {
        storage.updateDistributor(distributor.id, {
          name: formData.name,
          contactPerson: formData.contactPerson,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          gstNumber: formData.gstNumber,
          creditLimit: Number.parseFloat(formData.creditLimit),
          outstandingBalance: Number.parseFloat(formData.outstandingBalance),
        })
      } else {
        storage.createDistributor({
          id: Date.now().toString(),
          name: formData.name,
          contactPerson: formData.contactPerson,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          gstNumber: formData.gstNumber,
          creditLimit: Number.parseFloat(formData.creditLimit),
          outstandingBalance: Number.parseFloat(formData.outstandingBalance),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving distributor:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{distributor ? "Edit Distributor" : "Add New Distributor"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person *</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Address Details</h3>
            <div className="space-y-2">
              <Label htmlFor="address">Street Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Business Details</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gstNumber">GST Number</Label>
                <Input
                  id="gstNumber"
                  value={formData.gstNumber}
                  onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="creditLimit">Credit Limit (PKR) *</Label>
                <Input
                  id="creditLimit"
                  type="number"
                  step="0.01"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="outstandingBalance">Outstanding (PKR)</Label>
                <Input
                  id="outstandingBalance"
                  type="number"
                  step="0.01"
                  value={formData.outstandingBalance}
                  onChange={(e) => setFormData({ ...formData, outstandingBalance: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : distributor ? "Update Distributor" : "Add Distributor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
