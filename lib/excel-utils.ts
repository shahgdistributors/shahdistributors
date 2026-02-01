// Excel Import/Export Utilities using SheetJS (xlsx)
import * as XLSX from "xlsx"
import type { Product, Distributor, SalesOrder, Customer, POSTransaction } from "./storage"

// Export functions
export function exportProductsToExcel(products: Product[]) {
  const data = products.map((p) => ({
    ID: p.id,
    Name: p.name,
    Category: p.category,
    Brand: p.brand,
    Description: p.description,
    "Price (Rs)": p.price,
    Stock: p.stock,
    "Min Stock": p.minStock,
    Unit: p.unit,
    "Created At": new Date(p.createdAt).toLocaleDateString('en-PK'),
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Products")

  // Auto-size columns
  const maxWidth = data.reduce((w: any, r: any) => {
    return Object.keys(r).reduce((a, key) => {
      const value = String(r[key])
      return { ...a, [key]: Math.max(a[key] || 10, value.length) }
    }, w)
  }, {})

  ws["!cols"] = Object.keys(maxWidth).map((key) => ({ wch: maxWidth[key] + 2 }))

  XLSX.writeFile(wb, `products_${new Date().toLocaleDateString('en-PK')}.xlsx`)
}

export function exportDistributorsToExcel(distributors: Distributor[]) {
  const data = distributors.map((d) => ({
    ID: d.id,
    "Company Name": d.name,
    "Contact Person": d.contactPerson,
    Email: d.email,
    Phone: d.phone,
    Address: d.address,
    City: d.city,
    State: d.state,
    Pincode: d.pincode,
    "GST Number": d.gstNumber,
    "Credit Limit (Rs)": d.creditLimit,
    "Outstanding (Rs)": d.outstandingBalance,
    "Created At": new Date(d.createdAt).toLocaleString(),
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Distributors")

  ws["!cols"] = [
    { wch: 15 },
    { wch: 25 },
    { wch: 20 },
    { wch: 25 },
    { wch: 15 },
    { wch: 30 },
    { wch: 15 },
    { wch: 15 },
    { wch: 10 },
    { wch: 18 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
  ]

  XLSX.writeFile(wb, `distributors_${Date.now()}.xlsx`)
}

export function exportOrdersToExcel(orders: SalesOrder[], distributorNames: Map<string, string>) {
  const data = orders.map((o) => ({
    "Order Number": o.orderNumber,
    Distributor: distributorNames.get(o.distributorId) || "Unknown",
    "Items Count": o.items.length,
    "Subtotal (Rs)": o.subtotal,
    "Tax (Rs)": o.taxAmount,
    "Discount (Rs)": o.discount,
    "Total Amount (Rs)": o.totalAmount,
    "Payment Status": o.paymentStatus,
    "Delivery Status": o.deliveryStatus,
    "Created At": new Date(o.createdAt).toLocaleDateString('en-PK'),
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Orders")

  ws["!cols"] = [
    { wch: 18 },
    { wch: 25 },
    { wch: 12 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
  ]

  XLSX.writeFile(wb, `orders_${new Date().toLocaleDateString('en-PK')}.xlsx`)
}

export function exportCustomersOutstandingToExcel(customers: Customer[]) {
  const data = customers
    .filter((c) => c.outstandingBalance > 0)
    .map((c) => ({
      "Customer ID": c.id,
      "Customer Name": c.name,
      Phone: c.phone,
      Email: c.email || "-",
      City: c.city || "-",
      "Outstanding Balance (Rs)": c.outstandingBalance,
      "Total Purchases": c.totalPurchases,
      "Last Updated": new Date(c.updatedAt).toLocaleDateString('en-PK'),
    }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Outstanding Customers")

  ws["!cols"] = [
    { wch: 15 },
    { wch: 20 },
    { wch: 15 },
    { wch: 20 },
    { wch: 15 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
  ]

  XLSX.writeFile(wb, `outstanding_customers_${new Date().toLocaleDateString('en-PK')}.xlsx`)
}

export function exportInventoryToExcel(products: Product[]) {
  const data = products.map((p) => ({
    "Product ID": p.id,
    "Product Name": p.name,
    Category: p.category,
    Brand: p.brand,
    "Unit Price (Rs)": p.price,
    "Current Stock": p.stock,
    "Minimum Stock": p.minStock,
    Unit: p.unit,
    Status: p.stock <= p.minStock ? "Low Stock" : "Available",
    "Last Updated": new Date(p.updatedAt).toLocaleDateString('en-PK'),
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Inventory")

  ws["!cols"] = [
    { wch: 15 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 10 },
    { wch: 12 },
    { wch: 15 },
  ]

  XLSX.writeFile(wb, `inventory_${new Date().toLocaleDateString('en-PK')}.xlsx`)
}

export function exportPOSTransactionsToExcel(transactions: POSTransaction[]) {
  const data = transactions.map((t) => ({
    "Receipt Number": t.receiptNumber,
    "Customer Name": t.customerName || "-",
    "Phone": t.customerPhone || "-",
    "Items Count": t.items.length,
    "Subtotal (Rs)": t.subtotal,
    "Tax (Rs)": t.taxAmount,
    "Discount (Rs)": t.discount,
    "Total Amount (Rs)": t.totalAmount,
    "Amount Paid (Rs)": t.amountPaid,
    "Payment Method": t.paymentMethod,
    "Date": new Date(t.createdAt).toLocaleDateString('en-PK'),
    "Time": new Date(t.createdAt).toLocaleTimeString('en-PK'),
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "POS Transactions")

  ws["!cols"] = [
    { wch: 18 },
    { wch: 20 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 10 },
    { wch: 12 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
  ]

  XLSX.writeFile(wb, `pos_transactions_${new Date().toLocaleDateString('en-PK')}.xlsx`)
}

export function exportAllDataToExcel(
  products: Product[],
  distributors: Distributor[],
  orders: SalesOrder[],
  distributorNames: Map<string, string>,
) {
  const wb = XLSX.utils.book_new()

  // Products sheet
  const productsData = products.map((p) => ({
    ID: p.id,
    Name: p.name,
    Category: p.category,
    Brand: p.brand,
    "Price (Rs)": p.price,
    Stock: p.stock,
    "Min Stock": p.minStock,
    Unit: p.unit,
  }))
  const wsProducts = XLSX.utils.json_to_sheet(productsData)
  XLSX.utils.book_append_sheet(wb, wsProducts, "Products")

  // Distributors sheet
  const distData = distributors.map((d) => ({
    ID: d.id,
    "Company Name": d.name,
    "Contact Person": d.contactPerson,
    Phone: d.phone,
    City: d.city,
    "Credit Limit (Rs)": d.creditLimit,
    "Outstanding (Rs)": d.outstandingBalance,
  }))
  const wsDist = XLSX.utils.json_to_sheet(distData)
  XLSX.utils.book_append_sheet(wb, wsDist, "Distributors")

  // Orders sheet
  const ordersData = orders.map((o) => ({
    "Order Number": o.orderNumber,
    Distributor: distributorNames.get(o.distributorId) || "Unknown",
    "Total Amount (₹)": o.totalAmount,
    "Payment Status": o.paymentStatus,
    "Delivery Status": o.deliveryStatus,
    Date: new Date(o.createdAt).toLocaleDateString(),
  }))
  const wsOrders = XLSX.utils.json_to_sheet(ordersData)
  XLSX.utils.book_append_sheet(wb, wsOrders, "Orders")

  XLSX.writeFile(wb, `dms_complete_data_${Date.now()}.xlsx`)
}

// Import functions
export async function importProductsFromExcel(file: File): Promise<Partial<Product>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: "binary" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        const products = jsonData.map((row: any) => ({
          name: row.Name || row.name,
          category: row.Category || row.category,
          brand: row.Brand || row.brand,
          description: row.Description || row.description || "",
          price: Number.parseFloat(row["Price (₹)"] || row.price || 0),
          stock: Number.parseInt(row.Stock || row.stock || 0),
          minStock: Number.parseInt(row["Min Stock"] || row.minStock || 0),
          unit: row.Unit || row.unit || "Pieces",
        }))

        resolve(products)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsBinaryString(file)
  })
}

export async function importDistributorsFromExcel(file: File): Promise<Partial<Distributor>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: "binary" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        const distributors = jsonData.map((row: any) => ({
          name: row["Company Name"] || row.name,
          contactPerson: row["Contact Person"] || row.contactPerson,
          email: row.Email || row.email,
          phone: row.Phone || row.phone,
          address: row.Address || row.address || "",
          city: row.City || row.city,
          state: row.State || row.state,
          pincode: row.Pincode || row.pincode,
          gstNumber: row["GST Number"] || row.gstNumber || "",
          creditLimit: Number.parseFloat(row["Credit Limit (₹)"] || row.creditLimit || 0),
          outstandingBalance: Number.parseFloat(row["Outstanding (₹)"] || row.outstandingBalance || 0),
        }))

        resolve(distributors)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsBinaryString(file)
  })
}
