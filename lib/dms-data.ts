import type {
  Customer,
  Distributor,
  InventoryTransaction,
  POSTransaction,
  Product,
  ReceiptRecord,
  SalesOrder,
  User,
} from "@/lib/storage"

export type DmsDb = {
  users: User[]
  products: Product[]
  distributors: Distributor[]
  customers: Customer[]
  salesOrders: SalesOrder[]
  inventoryTransactions: InventoryTransaction[]
  posTransactions: POSTransaction[]
  receipts: ReceiptRecord[]
  updatedAt: string
}

const createAdminUser = (): User => ({
  id: "1",
  username: "admin",
  password: "admin123",
  fullName: "System Administrator",
  role: "Admin",
  createdAt: new Date().toISOString(),
})

const ensureArray = <T>(value: unknown) => (Array.isArray(value) ? (value as T[]) : [])

export const normalizeDb = (raw: any): DmsDb => {
  const users = ensureArray<User>(raw?.users)
  if (users.length === 0) {
    users.push(createAdminUser())
  }

  return {
    users,
    products: ensureArray<Product>(raw?.products),
    distributors: ensureArray<Distributor>(raw?.distributors),
    customers: ensureArray<Customer>(raw?.customers),
    salesOrders: ensureArray<SalesOrder>(raw?.salesOrders),
    inventoryTransactions: ensureArray<InventoryTransaction>(raw?.inventoryTransactions),
    posTransactions: ensureArray<POSTransaction>(raw?.posTransactions),
    receipts: ensureArray<ReceiptRecord>(raw?.receipts),
    updatedAt: new Date().toISOString(),
  }
}
