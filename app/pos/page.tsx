"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Minus, Plus, Trash2, Printer, CreditCard, Banknote } from "lucide-react"
import { getProducts, type Product, storage, type Customer, type ReceiptRecord } from "@/lib/storage"
import { getCurrentUser } from "@/lib/auth"
import { formatPKR, formatPKRWithDecimals } from "@/lib/utils"
import type { OrderItem, POSTransaction } from "@/lib/storage"
import "./print-styles.css"

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedCustomerId, setSelectedCustomerId] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card">("cash")
  const [amountReceived, setAmountReceived] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [showReceipt, setShowReceipt] = useState(false)
  const [lastTransaction, setLastTransaction] = useState<POSTransaction | null>(null)

  useEffect(() => {
    loadProducts()
    loadCustomers()
  }, [])

  useEffect(() => {
    const handleFocus = () => loadCustomers()
    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [])

  const loadProducts = () => {
    setProducts(getProducts())
    setFilteredProducts(getProducts())
  }

  const loadCustomers = () => {
    setCustomers(storage.getCustomers())
  }

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId)
    const customer = customers.find((c) => c.id === customerId)
    if (customer) {
      setCustomerName(customer.name)
    }
  }

  const buildReceiptHtml = (transaction: POSTransaction) => {
    const rows = transaction.items
      .map((item) => {
        const product = products.find((p) => p.id === item.productId)
        return `
          <tr>
            <td>${product?.name || "Unknown"}</td>
            <td style="text-align:center;">${item.quantity}</td>
            <td style="text-align:right;">${formatPKR(item.price)}</td>
            <td style="text-align:right;font-weight:600;">${formatPKR(item.total)}</td>
          </tr>
        `
      })
      .join("")

    return `
      <html>
        <head>
          <title>Receipt ${transaction.receiptNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111; margin: 0; padding: 24px; }
            h1, h2, h3, p { margin: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { padding: 6px 0; border-bottom: 1px dashed #ccc; font-size: 12px; }
            .summary { margin-top: 12px; font-size: 13px; }
            .summary-row { display: flex; justify-content: space-between; margin: 4px 0; }
            .total { font-weight: 700; border-top: 1px solid #111; padding-top: 6px; }
          </style>
        </head>
        <body>
          <div style="text-align:center;">
            <h2>Shah Distributors</h2>
            <p style="font-size:12px;color:#666;">Distribution Management System</p>
            <p style="font-size:11px;color:#888;margin-top:4px;">Thank you for your business!</p>
          </div>
          <div style="margin:12px 0;border-top:1px dashed #888;border-bottom:1px dashed #888;padding:8px 0;font-size:12px;">
            <div style="display:flex;justify-content:space-between;">
              <span>Receipt #:</span>
              <span style="font-family:monospace;font-weight:600;">${transaction.receiptNumber}</span>
            </div>
            <div style="display:flex;justify-content:space-between;">
              <span>Date:</span>
              <span>${new Date(transaction.createdAt).toLocaleString()}</span>
            </div>
            ${transaction.customerName ? `<div style="display:flex;justify-content:space-between;"><span>Customer:</span><span>${transaction.customerName}</span></div>` : ""}
          </div>
          <table>
            <thead>
              <tr>
                <th style="text-align:left;">Item</th>
                <th style="text-align:center;">Qty</th>
                <th style="text-align:right;">Price</th>
                <th style="text-align:right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
          <div class="summary">
            <div class="summary-row"><span>Subtotal:</span><span>${formatPKRWithDecimals(transaction.subtotal)}</span></div>
            <div class="summary-row"><span>Tax (18% GST):</span><span>${formatPKRWithDecimals(transaction.taxAmount)}</span></div>
            <div class="summary-row total"><span>Total:</span><span>${formatPKRWithDecimals(transaction.totalAmount)}</span></div>
            <div class="summary-row"><span>Payment (${transaction.paymentMethod}):</span><span>${formatPKRWithDecimals(transaction.amountReceived)}</span></div>
            ${transaction.change > 0 ? `<div class="summary-row"><span>Change:</span><span>${formatPKRWithDecimals(transaction.change)}</span></div>` : ""}
          </div>
          <div style="text-align:center;margin-top:12px;border-top:1px dashed #888;padding-top:8px;font-size:11px;color:#666;">
            Thank you for shopping with us! Please visit again.
          </div>
        </body>
      </html>
    `
  }

  const downloadReceipt = (transaction: POSTransaction, html: string) => {
    const date = new Date(transaction.createdAt).toISOString().split("T")[0]
    const fileName = `Receipt_${date}_${transaction.receiptNumber}.html`
    const blob = new Blob([html], { type: "text/html" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = fileName
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const handlePrint = () => {
    if (!lastTransaction) return
    const html = buildReceiptHtml(lastTransaction)
    const printWindow = window.open("", "_blank", "width=900,height=700")
    if (!printWindow) return
    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    printWindow.onload = () => {
      printWindow.print()
      printWindow.close()
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value.toLowerCase())
    setFilteredProducts(
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm) ||
          p.category.toLowerCase().includes(searchTerm) ||
          p.brand.toLowerCase().includes(searchTerm),
      ),
    )
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    setFilteredProducts(
      products.filter((p) => (value === "all" ? true : p.category.toLowerCase() === value.toLowerCase())),
    )
  }

  const addToCart = (product: Product) => {
    const existingItem = cart.find((item) => item.productId === product.id)

    if (existingItem) {
      updateCartItem(cart.indexOf(existingItem), "quantity", existingItem.quantity + 1)
    } else {
      setCart([...cart, { productId: product.id, quantity: 1, price: product.price, total: product.price }])
    }
  }

  const updateCartItem = (index: number, field: keyof OrderItem, value: any) => {
    const updated = [...cart]
    updated[index] = { ...updated[index], [field]: value }

    if (field === "quantity" || field === "price") {
      updated[index].total = updated[index].quantity * updated[index].price
    }

    setCart(updated)
  }

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index))
  }

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * 0.18
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const calculateChange = () => {
    const received = Number.parseFloat(amountReceived || "0")
    const total = calculateTotal()
    return received - total
  }

  const handleCheckout = () => {
    if (cart.length === 0) return

    const user = getCurrentUser()
    if (!user) return

    const receiptNumber = `REC-${Date.now()}`
    const subtotal = calculateSubtotal()
    const taxAmount = calculateTax()
    const totalAmount = calculateTotal()
    const received = Number.parseFloat(amountReceived || "0")
    const change = calculateChange()

    const transaction: POSTransaction = {
      id: Date.now().toString(),
      receiptNumber,
      customerId: selectedCustomerId || undefined,
      customerName: customerName || undefined,
      items: cart,
      subtotal,
      taxAmount,
      totalAmount,
      paymentMethod,
      amountReceived: received,
      change,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
    }

    // Update customer outstanding balance and purchase count if customer is selected
    if (selectedCustomerId) {
      const customer = customers.find((c) => c.id === selectedCustomerId)
      if (customer) {
        storage.updateCustomer(selectedCustomerId, {
          outstandingBalance: (customer.outstandingBalance || 0) + totalAmount,
          totalPurchases: (customer.totalPurchases || 0) + 1,
        })
      }
    }

    // Save transaction to storage
    storage.createPOSTransaction(transaction)

    const receiptHtml = buildReceiptHtml(transaction)
    const receiptRecord: ReceiptRecord = {
      id: `${Date.now()}-${Math.random()}`,
      receiptNumber,
      transactionId: transaction.id,
      customerName: customerName || undefined,
      createdAt: transaction.createdAt,
      html: receiptHtml,
    }
    storage.createReceipt(receiptRecord)
    downloadReceipt(transaction, receiptHtml)

    // Update product stock and create inventory transactions
    cart.forEach((item) => {
      const product = products.find((p) => p.id === item.productId)
      if (product) {
        setProducts(products.map((p) => (p.id === product.id ? { ...p, stock: p.stock - item.quantity } : p)))

        // storage.createInventoryTransaction({
        //   id: `${Date.now()}-${item.productId}`,
        //   productId: item.productId,
        //   type: "Sale",
        //   quantity: -item.quantity,
        //   reference: receiptNumber,
        //   notes: `POS Sale${customerName ? ` - ${customerName}` : ""}`,
        //   createdBy: user.id,
        //   createdAt: new Date().toISOString(),
        // })
      }
    })

    setLastTransaction(transaction)
    setShowReceipt(true)
    loadProducts()
  }

  const resetPOS = () => {
    setCart([])
    setCustomerName("")
    setSelectedCustomerId("")
    setAmountReceived("")
    setPaymentMethod("cash")
    setShowReceipt(false)
    setLastTransaction(null)
    loadCustomers()
  }

  const getSelectedCustomer = () => {
    return customers.find((c) => c.id === selectedCustomerId)
  }

  if (showReceipt && lastTransaction) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-6 print:hidden">
              <h1 className="text-2xl font-bold">Transaction Complete</h1>
              <div className="flex gap-2">
                <Button onClick={handlePrint} className="gap-2">
                  <Printer className="w-4 h-4" />
                  Print Receipt
                </Button>
                  <Button
                    variant="outline"
                    onClick={() => downloadReceipt(lastTransaction, buildReceiptHtml(lastTransaction))}
                  >
                    Download Receipt
                  </Button>
                <Button variant="outline" onClick={resetPOS}>
                  New Transaction
                </Button>
              </div>
            </div>

            {/* Receipt Preview */}
            <Card id="receipt-print-area">
              <CardContent className="p-0">
                <div className="p-8 bg-white text-black receipt-container">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold">Shah Distributors</h2>
                    <p className="text-sm text-gray-600">Distribution Management System</p>
                    <p className="text-xs text-gray-500 mt-1">Thank you for your business!</p>
                  </div>

                  <div className="border-t border-b border-dashed border-gray-400 py-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Receipt #:</span>
                      <span className="font-mono font-semibold">{lastTransaction.receiptNumber}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Date:</span>
                      <span>{new Date(lastTransaction.createdAt).toLocaleString()}</span>
                    </div>
                    {lastTransaction.customerName && (
                      <div className="flex justify-between text-sm">
                        <span>Customer:</span>
                        <span>{lastTransaction.customerName}</span>
                      </div>
                    )}
                  </div>

                  <table className="w-full mb-4">
                    <thead>
                      <tr className="border-b border-gray-400">
                        <th className="text-left py-2 text-sm">Item</th>
                        <th className="text-center py-2 text-sm">Qty</th>
                        <th className="text-right py-2 text-sm">Price</th>
                        <th className="text-right py-2 text-sm">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lastTransaction.items.map((item, index) => {
                        const product = products.find((p) => p.id === item.productId)
                        return (
                          <tr key={index} className="border-b border-dashed border-gray-300">
                            <td className="py-2 text-sm">{product?.name || "Unknown"}</td>
                            <td className="text-center py-2 text-sm">{item.quantity}</td>
                            <td className="text-right py-2 text-sm">{formatPKR(item.price)}</td>
                            <td className="text-right py-2 text-sm font-semibold">{formatPKR(item.total)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>

                  <div className="border-t border-gray-400 pt-3 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatPKRWithDecimals(lastTransaction.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax (18% GST):</span>
                      <span>{formatPKRWithDecimals(lastTransaction.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-gray-400 pt-2">
                      <span>Total:</span>
                      <span>{formatPKRWithDecimals(lastTransaction.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment ({lastTransaction.paymentMethod}):</span>
                      <span>{formatPKRWithDecimals(lastTransaction.amountReceived)}</span>
                    </div>
                    {lastTransaction.change > 0 && (
                      <div className="flex justify-between font-semibold">
                        <span>Change:</span>
                        <span>{formatPKRWithDecimals(lastTransaction.change)}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-center mt-6 pt-4 border-t border-dashed border-gray-400">
                    <p className="text-xs text-gray-600">Thank you for shopping with us!</p>
                    <p className="text-xs text-gray-500">Please visit again</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold">Point of Sale (POS)</h1>
          <p className="text-muted-foreground">Quick sales and billing system</p>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Products */}
          <div className="flex-1 p-6 overflow-y-auto border-r">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search products..." value={searchTerm} onChange={handleSearch} className="pl-10" />
              </div>
            </div>

            <ScrollArea className="h-[60vh]">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => addToCart(product)}
                  >
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-1">{product.name}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{product.category}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-primary">{formatPKR(product.price)}</span>
                        <span className="text-xs text-muted-foreground">Stock: {product.stock}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>No products found</p>
              </div>
            )}
          </div>

          {/* Right Panel - Cart */}
          <div className="w-[500px] flex flex-col bg-muted/30">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Current Sale</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Customer Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Select Customer</Label>
                    <Select value={selectedCustomerId} onValueChange={handleCustomerSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose customer..." />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name} {customer.outstandingBalance > 0 ? `(Outstanding: ${formatPKR(customer.outstandingBalance)})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedCustomerId && getSelectedCustomer() && (
                    <div className="p-3 bg-muted rounded-lg space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Outstanding Balance:</span>
                        <span className="font-semibold">{formatPKR(getSelectedCustomer()!.outstandingBalance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Purchases:</span>
                        <span className="font-semibold">{getSelectedCustomer()!.totalPurchases}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="customerName" className="text-xs">
                      Name
                    </Label>
                    <Input
                      id="customerName"
                      placeholder="Or enter name for new customer"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Cart Items */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Items ({cart.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {cart.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-8">Cart is empty</p>
                  ) : (
                    cart.map((item, index) => {
                      const product = products.find((p) => p.id === item.productId)
                      return (
                        <div key={index} className="flex items-center gap-2 p-2 bg-background rounded border">
                          <div className="flex-1">
                            <p className="text-sm font-medium line-clamp-1">{product?.name}</p>
                            <p className="text-xs text-muted-foreground">{formatPKR(item.price)} each</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateCartItem(index, "quantity", item.quantity - 1)}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateCartItem(index, "quantity", Number.parseInt(e.target.value))}
                              className="w-16 h-8 text-center"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateCartItem(index, "quantity", item.quantity + 1)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="w-24 text-right font-semibold text-sm">{formatPKR(item.total)}</div>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFromCart(index)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      )
                    })
                  )}
                </CardContent>
              </Card>

              {/* Payment */}
              {cart.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Payment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Payment Method</Label>
                      <Select value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">
                            <Banknote className="w-4 h-4 mr-2" />
                            Cash
                          </SelectItem>
                          <SelectItem value="card">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Card
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Amount Received (PKR)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={amountReceived}
                        onChange={(e) => setAmountReceived(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="pt-2 space-y-2 border-t">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>{formatPKRWithDecimals(calculateSubtotal())}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tax (18%):</span>
                        <span>{formatPKRWithDecimals(calculateTax())}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>{formatPKRWithDecimals(calculateTotal())}</span>
                      </div>
                      {Number.parseFloat(amountReceived) > 0 && (
                        <div className="flex justify-between font-semibold">
                          <span>Change:</span>
                          <span className={calculateChange() < 0 ? "text-destructive" : "text-green-600"}>
                            {formatPKRWithDecimals(Math.abs(calculateChange()))}
                            {calculateChange() < 0 && " (Insufficient)"}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="p-6 border-t space-y-2">
              <Button
                className="w-full h-12 text-base font-semibold gap-2"
                onClick={handleCheckout}
                disabled={cart.length === 0 || calculateChange() < 0}
              >
                <Printer className="w-5 h-5" />
                Complete Sale & Print Receipt
              </Button>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={resetPOS}
                disabled={cart.length === 0}
              >
                Clear Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

type CartItem = {
  productId: string
  quantity: number
  price: number
  total: number
}
