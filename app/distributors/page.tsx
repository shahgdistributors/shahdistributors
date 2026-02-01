"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Input } from "@/components/ui/input"
import { Search, AlertCircle, Phone } from "lucide-react"
import { storage, type Customer } from "@/lib/storage"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function DistributorsPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedDistributor, setSelectedDistributor] = useState<Customer | null>(null)

  const loadCustomers = () => {
    const allCustomers = storage.getCustomers().sort((a, b) => b.outstandingBalance - a.outstandingBalance)
    setCustomers(allCustomers)
    setFilteredCustomers(allCustomers)
  }

  const handleAddNew = () => {
    setSelectedDistributor(null)
    setFormDialogOpen(true)
  }

  const handleEdit = (distributor: Customer) => {
    setSelectedDistributor(distributor)
    setFormDialogOpen(true)
  }

  const handleDelete = (distributor: Customer) => {
    // Implement delete logic here
  }

  const handleView = (distributor: Customer) => {
    setSelectedDistributor(distributor)
    setViewDialogOpen(true)
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const filtered = customers.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.phone.includes(searchQuery) ||
          (c.city && c.city.toLowerCase().includes(searchQuery.toLowerCase())),
      )
      setFilteredCustomers(filtered)
    } else {
      setFilteredCustomers(customers)
    }
  }, [searchQuery, customers])

  const totalOutstanding = customers.reduce((sum, c) => sum + c.outstandingBalance, 0)
  const outstandingCustomers = customers.filter((c) => c.outstandingBalance > 0).length
  const overLimitCount = customers.filter((c) => c.outstandingBalance > c.creditLimit).length

  const loadDistributors = () => {
    loadCustomers()
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customer Accounts & Outstanding</h1>
          <p className="text-muted-foreground mt-1">Track all customers and their outstanding balances for follow-up</p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search customers by name, phone, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Customers</div>
            <div className="text-2xl font-bold mt-1">{customers.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Total Outstanding</div>
            <div className="text-2xl font-bold mt-1">Rs {totalOutstanding.toLocaleString('en-PK')}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-muted-foreground">Customers with Balance</div>
            <div className="text-2xl font-bold mt-1">{outstandingCustomers}</div>
          </Card>
        </div>

        {/* Customers Table */}
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Total Purchases</TableHead>
                  <TableHead>Outstanding Balance</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>
                        <a
                          href={`https://wa.me/${customer.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:underline"
                        >
                          <Phone className="w-4 h-4" />
                          {customer.phone}
                        </a>
                      </TableCell>
                      <TableCell>{customer.city || '-'}</TableCell>
                      <TableCell>{customer.totalPurchases}</TableCell>
                      <TableCell className="font-bold text-lg">
                        <span className={customer.outstandingBalance > 0 ? 'text-orange-600' : 'text-green-600'}>
                          Rs {customer.outstandingBalance.toLocaleString('en-PK')}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(customer.updatedAt).toLocaleDateString('en-PK')}
                      </TableCell>
                      <TableCell>
                        {customer.outstandingBalance > 0 ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Outstanding
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Clear</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
