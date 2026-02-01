// Local Storage Manager for DMS
// Handles all data persistence using browser localStorage

export interface User {
  id: string
  username: string
  password: string
  fullName: string
  role: "Admin" | "Sales" | "Inventory Manager"
  createdAt: string
}

export interface Product {
  id: string
  name: string
  category: string
  brand: string
  description: string
  price: number
  stock: number
  minStock: number
  unit: string
  createdAt: string
  updatedAt: string
}

export interface Distributor {
  id: string
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  pincode: string
  gstNumber: string
  creditLimit: number
  outstandingBalance: number
  createdAt: string
  updatedAt: string
}

export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  address?: string
  city?: string
  outstandingBalance: number
  totalPurchases: number
  createdAt: string
  updatedAt: string
}

export interface SalesOrder {
  id: string
  orderNumber: string
  distributorId: string
  items: OrderItem[]
  subtotal: number
  taxAmount: number
  discount: number
  totalAmount: number
  paymentStatus: "Pending" | "Partial" | "Paid"
  deliveryStatus: "Pending" | "Processing" | "Shipped" | "Delivered"
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  productId: string
  quantity: number
  price: number
  total: number
}

export interface POSTransaction {
  id: string
  receiptNumber: string
  customerId?: string
  customerName?: string
  customerPhone?: string
  items: OrderItem[]
  subtotal: number
  taxAmount: number
  discount: number
  totalAmount: number
  paymentMethod: "Cash" | "Card" | "UPI" | "Other"
  amountPaid: number
  change: number
  createdBy: string
  createdAt: string
}

export interface InventoryTransaction {
  id: string
  productId: string
  quantity: number
  transactionType: "In" | "Out"
  createdAt: string
}

export interface ReceiptRecord {
  id: string
  receiptNumber: string
  transactionId: string
  customerName?: string
  createdAt: string
  html: string
}

const inMemoryLocal = new Map<string, string>()
const inMemorySession = new Map<string, string>()
const serverSyncEnabled = () =>
  typeof window !== "undefined" && (process.env.NEXT_PUBLIC_DMS_SYNC || "true") !== "false"

const getStorageItem = (storage: Storage | null, key: string, fallback: Map<string, string>) => {
  if (!storage) return fallback.get(key) ?? null
  try {
    const value = storage.getItem(key)
    if (value !== null) {
      fallback.set(key, value)
    }
    return value
  } catch {
    return fallback.get(key) ?? null
  }
}

const setStorageItem = (storage: Storage | null, key: string, value: string, fallback: Map<string, string>) => {
  fallback.set(key, value)
  if (!storage) return
  try {
    storage.setItem(key, value)
  } catch {
    // Fall back to in-memory cache when storage fails.
  }
}

const removeStorageItem = (storage: Storage | null, key: string, fallback: Map<string, string>) => {
  fallback.delete(key)
  if (!storage) return
  try {
    storage.removeItem(key)
  } catch {
    // Ignore remove failures to keep app usable.
  }
}

const parseArray = <T>(raw: string | null, key: string, storage: Storage | null, fallback: Map<string, string>) => {
  if (!raw) return [] as T[]
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    removeStorageItem(storage, key, fallback)
    return [] as T[]
  }
}

const parseObject = <T>(
  raw: string | null,
  key: string,
  storage: Storage | null,
  fallback: Map<string, string>,
): T | null => {
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    removeStorageItem(storage, key, fallback)
    return null
  }
}

class StorageManager {
  private static instance: StorageManager
  private syncTimer: ReturnType<typeof setTimeout> | null = null

  private constructor() {
    this.initializeDefaultData()
  }

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager()
    }
    return StorageManager.instance
  }

  private initializeDefaultData() {
    if (!this.getUsers().length) {
      // Create default admin user
      this.createUser({
        id: "1",
        username: "admin",
        password: "admin123",
        fullName: "System Administrator",
        role: "Admin",
        createdAt: new Date().toISOString(),
      })
    }

    if (!this.getProducts().length) {
      const groceryProducts: Product[] = [
        // Wheat variants
        {
          id: "1",
          name: "Premium Wheat Flour",
          category: "Grocery",
          brand: "Golden Harvest",
          description: "Fine quality wheat flour for all purpose use",
          price: 85,
          stock: 500,
          minStock: 100,
          unit: "kg",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "2",
          name: "Whole Wheat Atta",
          category: "Grocery",
          brand: "Golden Harvest",
          description: "100% whole wheat flour for healthy cooking",
          price: 95,
          stock: 400,
          minStock: 80,
          unit: "kg",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "3",
          name: "Multigrain Atta",
          category: "Grocery",
          brand: "Golden Harvest",
          description: "Nutritious blend of wheat and grains",
          price: 120,
          stock: 250,
          minStock: 50,
          unit: "kg",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "4",
          name: "Chakki Fresh Atta",
          category: "Grocery",
          brand: "Village Mills",
          description: "Stone ground fresh wheat flour",
          price: 105,
          stock: 350,
          minStock: 70,
          unit: "kg",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        // Cooking Oil variants
        {
          id: "5",
          name: "Sunflower Cooking Oil",
          category: "Grocery",
          brand: "Pure Gold",
          description: "100% pure sunflower oil",
          price: 450,
          stock: 200,
          minStock: 40,
          unit: "liter",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "6",
          name: "Canola Cooking Oil",
          category: "Grocery",
          brand: "Pure Gold",
          description: "Heart healthy canola oil",
          price: 480,
          stock: 180,
          minStock: 35,
          unit: "liter",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "7",
          name: "Olive Oil",
          category: "Grocery",
          brand: "Mediterranean",
          description: "Extra virgin olive oil imported",
          price: 1200,
          stock: 100,
          minStock: 20,
          unit: "liter",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "8",
          name: "Corn Oil",
          category: "Grocery",
          brand: "Pure Gold",
          description: "Light and healthy corn oil",
          price: 420,
          stock: 220,
          minStock: 45,
          unit: "liter",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "9",
          name: "Mustard Oil",
          category: "Grocery",
          brand: "Kachi Ghani",
          description: "Cold pressed mustard oil",
          price: 380,
          stock: 150,
          minStock: 30,
          unit: "liter",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "10",
          name: "Vegetable Oil Blend",
          category: "Grocery",
          brand: "Pure Gold",
          description: "Premium blend of vegetable oils",
          price: 400,
          stock: 300,
          minStock: 60,
          unit: "liter",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      groceryProducts.forEach((product) => this.createProduct(product))
    }
  }

  private scheduleServerSync() {
    if (!serverSyncEnabled() || typeof window === "undefined") return
    if (this.syncTimer) {
      window.clearTimeout(this.syncTimer)
    }
    this.syncTimer = window.setTimeout(() => {
      this.syncTimer = null
      void this.syncToServer()
    }, 1000)
  }

  async syncToServer() {
    if (!serverSyncEnabled()) return false
    try {
      await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.exportAllData()),
      })
      return true
    } catch {
      return false
    }
  }

  async syncFromServer() {
    if (!serverSyncEnabled() || typeof window === "undefined") return false
    try {
      if (sessionStorage.getItem("dms_server_sync_done") === "true") return false
      const response = await fetch("/api/data", { cache: "no-store" })
      if (!response.ok) return false
      const data = await response.json()
      this.importAllData(data)
      sessionStorage.setItem("dms_server_sync_done", "true")
      return true
    } catch {
      return false
    }
  }

  // Generic storage methods
  private get<T>(key: string): T[] {
    if (typeof window === "undefined") return []
    const data = getStorageItem(typeof localStorage === "undefined" ? null : localStorage, key, inMemoryLocal)
    return parseArray<T>(data, key, typeof localStorage === "undefined" ? null : localStorage, inMemoryLocal)
  }

  private set<T>(key: string, data: T[]): void {
    if (typeof window === "undefined") return
    setStorageItem(
      typeof localStorage === "undefined" ? null : localStorage,
      key,
      JSON.stringify(data),
      inMemoryLocal,
    )
  }

  // User methods
  getUsers(): User[] {
    return this.get<User>("dms_users")
  }

  createUser(user: User): void {
    const users = this.getUsers()
    users.push(user)
    this.set("dms_users", users)
    this.scheduleServerSync()
  }

  getUserByUsername(username: string): User | undefined {
    return this.getUsers().find((u) => u.username === username)
  }

  updateUser(id: string, updates: Partial<User>): void {
    const users = this.getUsers()
    const index = users.findIndex((u) => u.id === id)
    if (index !== -1) {
      users[index] = { ...users[index], ...updates }
      this.set("dms_users", users)
      this.scheduleServerSync()
    }
  }

  deleteUser(id: string): void {
    const users = this.getUsers().filter((u) => u.id !== id)
    this.set("dms_users", users)
    this.scheduleServerSync()
  }

  // Product methods
  getProducts(): Product[] {
    return this.get<Product>("dms_products")
  }

  createProduct(product: Product): void {
    const products = this.getProducts()
    products.push(product)
    this.set("dms_products", products)
    this.scheduleServerSync()
  }

  updateProduct(id: string, updates: Partial<Product>): void {
    const products = this.getProducts()
    const index = products.findIndex((p) => p.id === id)
    if (index !== -1) {
      products[index] = { ...products[index], ...updates, updatedAt: new Date().toISOString() }
      this.set("dms_products", products)
      this.scheduleServerSync()
    }
  }

  deleteProduct(id: string): void {
    const products = this.getProducts().filter((p) => p.id !== id)
    this.set("dms_products", products)
    this.scheduleServerSync()
  }

  // Distributor methods
  getDistributors(): Distributor[] {
    return this.get<Distributor>("dms_distributors")
  }

  createDistributor(distributor: Distributor): void {
    const distributors = this.getDistributors()
    distributors.push(distributor)
    this.set("dms_distributors", distributors)
    this.scheduleServerSync()
  }

  updateDistributor(id: string, updates: Partial<Distributor>): void {
    const distributors = this.getDistributors()
    const index = distributors.findIndex((d) => d.id === id)
    if (index !== -1) {
      distributors[index] = { ...distributors[index], ...updates, updatedAt: new Date().toISOString() }
      this.set("dms_distributors", distributors)
      this.scheduleServerSync()
    }
  }

  deleteDistributor(id: string): void {
    const distributors = this.getDistributors().filter((d) => d.id !== id)
    this.set("dms_distributors", distributors)
    this.scheduleServerSync()
  }

  // Customer methods
  getCustomers(): Customer[] {
    return this.get<Customer>("dms_customers")
  }

  createCustomer(customer: Customer): void {
    const customers = this.getCustomers()
    customers.push(customer)
    this.set("dms_customers", customers)
    this.scheduleServerSync()
  }

  updateCustomer(id: string, updates: Partial<Customer>): void {
    const customers = this.getCustomers()
    const index = customers.findIndex((c) => c.id === id)
    if (index !== -1) {
      customers[index] = { ...customers[index], ...updates, updatedAt: new Date().toISOString() }
      this.set("dms_customers", customers)
      this.scheduleServerSync()
    }
  }

  deleteCustomer(id: string): void {
    const customers = this.getCustomers().filter((c) => c.id !== id)
    this.set("dms_customers", customers)
    this.scheduleServerSync()
  }

  getCustomerById(id: string): Customer | undefined {
    return this.getCustomers().find((c) => c.id === id)
  }

  getCustomerPurchases(customerId: string): POSTransaction[] {
    return this.getPOSTransactions().filter((t) => t.customerId === customerId)
  }

  // Sales Order methods
  getSalesOrders(): SalesOrder[] {
    return this.get<SalesOrder>("dms_sales_orders")
  }

  createSalesOrder(order: SalesOrder): void {
    const orders = this.getSalesOrders()
    orders.push(order)
    this.set("dms_sales_orders", orders)
    this.scheduleServerSync()
  }

  updateSalesOrder(id: string, updates: Partial<SalesOrder>): void {
    const orders = this.getSalesOrders()
    const index = orders.findIndex((o) => o.id === id)
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updates, updatedAt: new Date().toISOString() }
      this.set("dms_sales_orders", orders)
      this.scheduleServerSync()
    }
  }

  deleteSalesOrder(id: string): void {
    const orders = this.getSalesOrders().filter((o) => o.id !== id)
    this.set("dms_sales_orders", orders)
    this.scheduleServerSync()
  }

  // Inventory Transaction methods
  getInventoryTransactions(): InventoryTransaction[] {
    return this.get<InventoryTransaction>("dms_inventory_transactions")
  }

  createInventoryTransaction(transaction: InventoryTransaction): void {
    const transactions = this.getInventoryTransactions()
    transactions.push(transaction)
    this.set("dms_inventory_transactions", transactions)
    this.scheduleServerSync()
  }

  // POS Transaction methods
  getPOSTransactions(): POSTransaction[] {
    return this.get<POSTransaction>("dms_pos_transactions")
  }

  createPOSTransaction(transaction: POSTransaction): void {
    const transactions = this.getPOSTransactions()
    transactions.push(transaction)
    this.set("dms_pos_transactions", transactions)
    this.scheduleServerSync()
  }

  // Receipt methods
  getReceipts(): ReceiptRecord[] {
    return this.get<ReceiptRecord>("dms_receipts")
  }

  createReceipt(receipt: ReceiptRecord): void {
    const receipts = this.getReceipts()
    receipts.push(receipt)
    this.set("dms_receipts", receipts)
    this.scheduleServerSync()
  }

  // Session management
  setCurrentUser(user: User): void {
    if (typeof window === "undefined") return
    setStorageItem(
      typeof sessionStorage === "undefined" ? null : sessionStorage,
      "dms_current_user",
      JSON.stringify(user),
      inMemorySession,
    )
  }

  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null
    const data = getStorageItem(
      typeof sessionStorage === "undefined" ? null : sessionStorage,
      "dms_current_user",
      inMemorySession,
    )
    return parseObject<User>(data, "dms_current_user", typeof sessionStorage === "undefined" ? null : sessionStorage, inMemorySession)
  }

  clearCurrentUser(): void {
    if (typeof window === "undefined") return
    removeStorageItem(
      typeof sessionStorage === "undefined" ? null : sessionStorage,
      "dms_current_user",
      inMemorySession,
    )
  }

  // Export all data
  exportAllData() {
    return {
      users: this.getUsers(),
      products: this.getProducts(),
      distributors: this.getDistributors(),
      customers: this.getCustomers(),
      salesOrders: this.getSalesOrders(),
      inventoryTransactions: this.getInventoryTransactions(),
      posTransactions: this.getPOSTransactions(),
      receipts: this.getReceipts(),
      exportedAt: new Date().toISOString(),
    }
  }

  // Import all data
  importAllData(data: any) {
    if (data.users) this.set("dms_users", data.users)
    if (data.products) this.set("dms_products", data.products)
    if (data.distributors) this.set("dms_distributors", data.distributors)
    if (data.customers) this.set("dms_customers", data.customers)
    if (data.salesOrders) this.set("dms_sales_orders", data.salesOrders)
    if (data.inventoryTransactions) this.set("dms_inventory_transactions", data.inventoryTransactions)
    if (data.posTransactions) this.set("dms_pos_transactions", data.posTransactions)
    if (data.receipts) this.set("dms_receipts", data.receipts)
  }
}

export const storage = StorageManager.getInstance()

export const getProducts = () => storage.getProducts()
export const getDistributors = () => storage.getDistributors()
export const getCustomers = () => storage.getCustomers()
export const getSalesOrders = () => storage.getSalesOrders()
export const getUsers = () => storage.getUsers()
export const getPOSTransactions = () => storage.getPOSTransactions()
export const getInventoryTransactions = () => storage.getInventoryTransactions()
export const getReceipts = () => storage.getReceipts()
