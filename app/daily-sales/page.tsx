'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { storage, type POSTransaction } from '@/lib/storage'
import { formatPKR } from '@/lib/utils'
import { Download, Calendar } from 'lucide-react'
import * as XLSX from 'xlsx'

export default function DailySalesPage() {
  const [transactions, setTransactions] = useState<POSTransaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<POSTransaction[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [totalSales, setTotalSales] = useState(0)
  const [totalItems, setTotalItems] = useState(0)

  useEffect(() => {
    loadTransactions()
  }, [])

  useEffect(() => {
    filterByDate()
  }, [transactions, selectedDate])

  const loadTransactions = () => {
    const allTransactions = storage.getPOSTransactions()
    setTransactions(allTransactions)
  }

  const filterByDate = () => {
    const filtered = transactions.filter((t) => {
      const transactionDate = new Date(t.createdAt).toISOString().split('T')[0]
      return transactionDate === selectedDate
    })
    setFilteredTransactions(filtered)

    const total = filtered.reduce((sum, t) => sum + t.totalAmount, 0)
    const items = filtered.reduce((sum, t) => sum + t.items.length, 0)

    setTotalSales(total)
    setTotalItems(items)
  }

  const exportToExcel = () => {
    const data = filteredTransactions.map((t) => ({
      'Receipt #': t.receiptNumber,
      'Customer': t.customerName || 'Walk-in',
      'Items': t.items.length,
      'Subtotal': t.subtotal,
      'Tax': t.taxAmount,
      'Discount': t.discount,
      'Total': t.totalAmount,
      'Payment Method': t.paymentMethod,
      'Time': new Date(t.createdAt).toLocaleTimeString('en-PK'),
    }))

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Daily Sales')

    // Add summary
    const summary = XLSX.utils.sheet_add_aoa(worksheet, [
      [],
      ['DAILY SALES SUMMARY'],
      [`Date: ${selectedDate}`],
      [`Total Sales: Rs ${totalSales.toLocaleString('en-PK')}`],
      [`Total Items Sold: ${totalItems}`],
      [`Total Transactions: ${filteredTransactions.length}`],
    ], { origin: 'A1' })

    XLSX.writeFile(workbook, `Daily-Sales-${selectedDate}.xlsx`)
  }

  return (
    <div className="flex-1 space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">Daily Sales Report</h1>
        <p className="text-muted-foreground">Track your daily sales and export reports</p>
      </div>

      {/* Date Filter and Export */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-4">
            <div>
              <label className="text-sm font-medium">Select Date</label>
              <div className="flex items-center gap-2 mt-2">
                <Calendar className="w-4 h-4" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-48"
                />
              </div>
            </div>
          </div>
          <Button
            onClick={exportToExcel}
            disabled={filteredTransactions.length === 0}
            className="bg-green-600 hover:bg-green-700 gap-2"
          >
            <Download className="w-4 h-4" />
            Export to Excel
          </Button>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs {totalSales.toLocaleString('en-PK')}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredTransactions.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground mt-1">
              items sold
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Average Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rs {filteredTransactions.length > 0 ? (totalSales / filteredTransactions.length).toLocaleString('en-PK', { maximumFractionDigits: 0 }) : '0'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              per transaction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions for {selectedDate}</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found for this date
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead>Tax</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-sm">{transaction.receiptNumber}</TableCell>
                      <TableCell>{transaction.customerName || 'Walk-in'}</TableCell>
                      <TableCell>{transaction.items.length}</TableCell>
                      <TableCell>Rs {transaction.subtotal.toLocaleString('en-PK')}</TableCell>
                      <TableCell>Rs {transaction.taxAmount.toLocaleString('en-PK')}</TableCell>
                      <TableCell>Rs {transaction.discount.toLocaleString('en-PK')}</TableCell>
                      <TableCell className="font-bold">Rs {transaction.totalAmount.toLocaleString('en-PK')}</TableCell>
                      <TableCell className="capitalize">{transaction.paymentMethod}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(transaction.createdAt).toLocaleTimeString('en-PK')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
