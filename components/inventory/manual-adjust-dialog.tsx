\"use client\"

import type React from \"react\"

import { useEffect, useState } from \"react\"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from \"@/components/ui/dialog\"
import { Button } from \"@/components/ui/button\"
import { Input } from \"@/components/ui/input\"
import { Label } from \"@/components/ui/label\"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from \"@/components/ui/select\"
import { Textarea } from \"@/components/ui/textarea\"
import { storage, type Product } from \"@/lib/storage\"
import { getCurrentUser } from \"@/lib/auth\"

interface ManualAdjustDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

type AdjustmentDirection = \"add\" | \"reduce\"

export function ManualAdjustDialog({ open, onOpenChange, onSuccess }: ManualAdjustDialogProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState(\"\")
  const [direction, setDirection] = useState<AdjustmentDirection>(\"add\")
  const [quantity, setQuantity] = useState(\"\")
  const [reference, setReference] = useState(\"\")
  const [notes, setNotes] = useState(\"\")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setProducts(storage.getProducts())
      setSelectedProduct(\"\")
      setDirection(\"add\")
      setQuantity(\"\")
      setReference(\"\")
      setNotes(\"\")
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = getCurrentUser()
      if (!user) throw new Error(\"User not authenticated\")

      const product = products.find((p) => p.id === selectedProduct)
      if (!product) throw new Error(\"Product not found\")

      const qty = Math.max(1, Number.parseInt(quantity || \"0\"))
      const delta = direction === \"add\" ? qty : -qty

      storage.updateProduct(selectedProduct, {
        stock: Math.max(0, product.stock + delta),
      })

      storage.createInventoryTransaction({
        id: `${Date.now()}-${selectedProduct}`,
        productId: selectedProduct,
        type: \"Adjustment\",
        quantity: delta,
        reference: reference || \"Manual adjustment\",
        notes,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
      })

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error(\"Error adjusting stock:\", error)
    } finally {
      setLoading(false)
    }
  }

  const selectedProductData = products.find((p) => p.id === selectedProduct)
  const qtyNumber = Number.parseInt(quantity || \"0\")
  const projectedStock =
    selectedProductData && qtyNumber
      ? Math.max(0, selectedProductData.stock + (direction === \"add\" ? qtyNumber : -qtyNumber))
      : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className=\"max-w-lg\">
        <DialogHeader>
          <DialogTitle>Manual Stock Adjustment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className=\"space-y-4\">
          <div className=\"space-y-2\">
            <Label htmlFor=\"product\">Product *</Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger>
                <SelectValue placeholder=\"Select a product\" />
              </SelectTrigger>
              <SelectContent>
                {products.map((prod) => (
                  <SelectItem key={prod.id} value={prod.id}>
                    {prod.name} (Current: {prod.stock} {prod.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProductData && (
              <div className=\"text-xs text-muted-foreground\">
                Current Stock: {selectedProductData.stock} {selectedProductData.unit}
              </div>
            )}
          </div>

          <div className=\"grid grid-cols-2 gap-4\">
            <div className=\"space-y-2\">
              <Label htmlFor=\"direction\">Adjustment Type *</Label>
              <Select value={direction} onValueChange={(value) => setDirection(value as AdjustmentDirection)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=\"add\">Add Stock</SelectItem>
                  <SelectItem value=\"reduce\">Reduce Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className=\"space-y-2\">
              <Label htmlFor=\"quantity\">Quantity *</Label>
              <Input
                id=\"quantity\"
                type=\"number\"
                min=\"1\"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
          </div>

          {selectedProductData && quantity && projectedStock !== null && (
            <div className=\"text-xs text-muted-foreground\">
              New Stock: {projectedStock} {selectedProductData.unit}
            </div>
          )}

          <div className=\"space-y-2\">
            <Label htmlFor=\"reference\">Reference</Label>
            <Input
              id=\"reference\"
              placeholder=\"e.g., Manual adjustment, stock count\"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

          <div className=\"space-y-2\">
            <Label htmlFor=\"notes\">Notes</Label>
            <Textarea
              id=\"notes\"
              placeholder=\"Why is this adjustment needed?\"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className=\"flex justify-end gap-3 pt-4\">
            <Button type=\"button\" variant=\"outline\" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type=\"submit\" disabled={!selectedProduct || !quantity || loading}>
              {loading ? \"Saving...\" : \"Save Adjustment\"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
