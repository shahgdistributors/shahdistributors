"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, Eye, AlertCircle } from "lucide-react"
import type { Distributor } from "@/lib/storage"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { formatPKR } from "@/lib/utils"

interface DistributorTableProps {
  distributors: Distributor[]
  onEdit: (distributor: Distributor) => void
  onDelete: (id: string) => void
  onView: (distributor: Distributor) => void
}

export function DistributorTable({ distributors, onEdit, onDelete, onView }: DistributorTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDelete = () => {
    if (deleteId) {
      onDelete(deleteId)
      setDeleteId(null)
    }
  }

  if (distributors.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No distributors found. Add your first distributor to get started.</p>
      </div>
    )
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Company Name</TableHead>
              <TableHead>Contact Person</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Credit Limit</TableHead>
              <TableHead className="text-right">Outstanding</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {distributors.map((distributor) => {
              const creditUsagePercent = (distributor.outstandingBalance / distributor.creditLimit) * 100
              const isNearLimit = creditUsagePercent >= 80
              const isOverLimit = distributor.outstandingBalance > distributor.creditLimit

              return (
                <TableRow key={distributor.id}>
                  <TableCell className="font-medium">{distributor.name}</TableCell>
                  <TableCell>{distributor.contactPerson}</TableCell>
                  <TableCell>
                    {distributor.city}, {distributor.state}
                  </TableCell>
                  <TableCell>{distributor.phone}</TableCell>
                  <TableCell className="text-right">{formatPKR(distributor.creditLimit)}</TableCell>
                  <TableCell className="text-right">{formatPKR(distributor.outstandingBalance)}</TableCell>
                  <TableCell className="text-center">
                    {isOverLimit ? (
                      <Badge variant="destructive" className="gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Over Limit
                      </Badge>
                    ) : isNearLimit ? (
                      <Badge variant="outline" className="gap-1 border-orange-500 text-orange-500">
                        <AlertCircle className="w-3 h-3" />
                        Near Limit
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => onView(distributor)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onEdit(distributor)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(distributor.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the distributor and all associated records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
