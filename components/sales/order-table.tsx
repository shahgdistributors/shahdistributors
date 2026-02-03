"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Trash2 } from "lucide-react"
import type { SalesOrder, Distributor } from "@/lib/storage"
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

interface OrderTableProps {
  orders: SalesOrder[]
  distributors: Distributor[]
  onView: (order: SalesOrder) => void
  onDelete: (id: string) => void
}

export function OrderTable({ orders, distributors, onView, onDelete }: OrderTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDelete = () => {
    if (deleteId) {
      onDelete(deleteId)
      setDeleteId(null)
    }
  }

  const getDistributorName = (id: string) => {
    return distributors.find((d) => d.id === id)?.name || "Unknown"
  }

  const getPaymentStatusVariant = (status: string) => {
    if (status === "Paid") return "default"
    if (status === "Partial") return "secondary"
    return "outline"
  }

  const getDeliveryStatusVariant = (status: string) => {
    if (status === "Delivered") return "default"
    if (status === "Shipped") return "secondary"
    return "outline"
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No orders found. Create your first order to get started.</p>
      </div>
    )
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Order Number</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-center">Payment</TableHead>
              <TableHead className="text-center">Delivery</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono font-medium">{order.orderNumber}</TableCell>
                <TableCell>{getDistributorName(order.distributorId)}</TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right font-semibold">{formatPKR(order.totalAmount)}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={getPaymentStatusVariant(order.paymentStatus)}>{order.paymentStatus}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={getDeliveryStatusVariant(order.deliveryStatus)}>{order.deliveryStatus}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onView(order)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(order.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the order from your system.
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
