"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye } from "lucide-react"
import { storage, type POSTransaction, type Customer, type ReceiptRecord } from "@/lib/storage"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatPKR } from "@/lib/utils"

export default function SalesPage() {
  const [transactions, setTransactions] = useState<POSTransaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<POSTransaction[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [receipts, setReceipts] = useState<ReceiptRecord[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [paymentFilter, setPaymentFilter] = useState("all")

  const loadData = () => {
    const allTransactions = storage.getPOSTransactions()
    const allCustomers = storage.getCustomers()
    const allReceipts = storage.getReceipts()
    setTransactions(allTransactions)
    setCustomers(allCustomers)
    setReceipts(allReceipts)
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    let filtered = transactions

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((t) => {
        const customerName = getCustomerName(t).toLowerCase()
        return t.receiptNumber.toLowerCase().includes(query) || customerName.includes(query)
      })
    }

    // Payment filter
    if (paymentFilter !== "all") {
      filtered = filtered.filter((t) => getPaymentStatus(t) === paymentFilter)
    }

    setFilteredTransactions(filtered)
  }, [searchQuery, paymentFilter, transactions])

  const getCustomerName = (transaction: POSTransaction) => {
    if (transaction.customerName) return transaction.customerName
    const customer = customers.find((c) => c.id === transaction.customerId)
    return customer?.name || "Walk-in Customer"
  }

  const getOutstanding = (transaction: POSTransaction) => {
    if (typeof transaction.outstandingAmount === "number") {
      return Math.max(0, transaction.outstandingAmount)
    }
    const received = transaction.amountReceived || 0
    return Math.max(0, transaction.totalAmount - received)
  }

  const getPaymentStatus = (transaction: POSTransaction) => {
    const received = transaction.amountReceived || 0
    const outstanding = getOutstanding(transaction)
    if (outstanding <= 0) return "Paid"
    if (received > 0) return "Partial"
    return "Pending"
  }

  const handleViewReceipt = (transactionId: string) => {
    const receipt = receipts.find((r) => r.transactionId === transactionId)
    if (!receipt) return
    const receiptWindow = window.open("", "_blank", "width=900,height=700")
    if (!receiptWindow) return
    receiptWindow.document.open()
    receiptWindow.document.write(receipt.html)
    receiptWindow.document.close()
    receiptWindow.focus()
  }

  const totalRevenue = transactions.reduce((sum, t) => sum + t.totalAmount, 0)
  const outstandingTotal = transactions.reduce((sum, t) => sum + getOutstanding(t), 0)
  const pendingPayments = transactions.filter((t) => getPaymentStatus(t) !== "Paid").length

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
            <p className="text-muted-foreground mt-1">All POS sales and customer payments</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by receipt number or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Partial">Partial</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-card border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Total Orders</div>
            <div className="text-2xl font-bold mt-1">{transactions.length}</div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Total Revenue</div>
            <div className="text-2xl font-bold mt-1">{formatPKR(totalRevenue)}</div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Outstanding Amount</div>
            <div className="text-2xl font-bold mt-1 text-orange-500">{formatPKR(outstandingTotal)}</div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Pending Payments</div>
            <div className="text-2xl font-bold mt-1 text-orange-500">{pendingPayments}</div>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Receipt #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No sales found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => {
                  const outstanding = getOutstanding(transaction)
                  const status = getPaymentStatus(transaction)
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono font-medium">{transaction.receiptNumber}</TableCell>
                      <TableCell>{getCustomerName(transaction)}</TableCell>
                      <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right font-semibold">{formatPKR(transaction.totalAmount)}</TableCell>
                      <TableCell className="text-right">{formatPKR(transaction.amountReceived || 0)}</TableCell>
                      <TableCell className="text-right">{formatPKR(outstanding)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={status === "Paid" ? "secondary" : "outline"}>{status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewReceipt(transaction.id)}
                          disabled={!receipts.some((r) => r.transactionId === transaction.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  )
}
