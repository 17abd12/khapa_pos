"use client"

import { useEffect, useState } from "react"
import { X, ShoppingCart } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"

// -------------------- Types --------------------
export type InventoryItem = {
  id: string
  name: string
  cost_price: number
  sale_price: number
}

export type CartItem = InventoryItem & { quantity: number }

// -------------------- Cart Button (Mobile Only) --------------------
type CartButtonProps = {
  totalItems: number
  onClick: () => void
}

const CartButton = ({ totalItems, onClick }: CartButtonProps) => (
  <button className="relative md:hidden" onClick={onClick}>
    <ShoppingCart className="w-8 h-8" />
    {totalItems > 0 && (
      <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-2 py-0.5">
        {totalItems}
      </span>
    )}
  </button>
)

// -------------------- Inventory Grid --------------------
type InventoryGridProps = {
  items: InventoryItem[]
  onAddToCart: (item: InventoryItem) => void
  selectedItems: string[]  // ✅ new prop
}

const InventoryGrid = ({ items, onAddToCart, selectedItems }: InventoryGridProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
    {items.map(item => {
      const isSelected = selectedItems.includes(item.id)
      return (
        <button
          key={item.id}
          type="button"
          onClick={() => onAddToCart(item)}
          className="text-left cursor-pointer border rounded-xl p-4 bg-white shadow hover:shadow-lg transition"
        >
          <h2 className="text-lg font-bold mb-2">{item.name}</h2>
          <p className={`text-3xl font-extrabold ${isSelected ? "text-green-600" : "text-blue-600"}`}>
            Rs. {item.sale_price}
          </p>
        </button>
      )
    })}
  </div>
)

// -------------------- Cart Item Row --------------------
type CartItemRowProps = {
  item: CartItem
  onRemove: (id: string) => void
}

const CartItemRow = ({ item, onRemove }: CartItemRowProps) => (
  <li className="flex justify-between items-center border-b pb-2">
    <div>
      <p className="font-semibold text-sm">{item.name}</p>
      <p className="text-gray-600 text-xs">
        Rs. {item.sale_price} × {item.quantity}
      </p>
    </div>
    <button
      onClick={() => onRemove(item.id)}
      className="text-red-600 hover:underline text-sm"
    >
      ❌
    </button>
  </li>
)

// -------------------- Desktop Cart Sidebar --------------------
type CartSidebarProps = {
  cart: CartItem[]
  onRemove: (id: string) => void
  onPlaceOrder: (paymentMethod: string) => void
  onClearCart: () => void
  placing: boolean
}

const CartSidebar = ({
  cart,
  onRemove,
  onPlaceOrder,
  onClearCart,
  placing,
}: CartSidebarProps) => {
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Online">("Cash")

  const total = cart.reduce((sum, item) => sum + item.sale_price * item.quantity, 0)

  return (
    <div className="w-full h-full bg-white border-l shadow-lg p-4 flex flex-col">
      <h2 className="text-xl font-bold mb-4">Your Cart</h2>

      {cart.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto">
            <ul className="space-y-3">
              {cart.map(ci => (
                <CartItemRow key={ci.id} item={ci} onRemove={onRemove} />
              ))}
            </ul>
          </div>

          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center mb-4">
              <p className="font-bold text-lg">Total:</p>
              <p className="font-bold text-lg">Rs. {total}</p>
            </div>

            {/* Payment Method */}
            <div className="mb-4">
              <p className="font-semibold mb-2 text-sm">Payment Method:</p>
              <div className="flex gap-2">
                <label
                  className={`flex-1 cursor-pointer p-2 text-center rounded-lg border text-sm ${
                    paymentMethod === "Cash"
                      ? "bg-green-100 border-green-400"
                      : "bg-gray-100 border-gray-300 hover:bg-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="Cash"
                    checked={paymentMethod === "Cash"}
                    onChange={() => setPaymentMethod("Cash")}
                    className="hidden"
                  />
                  Cash
                </label>
                <label
                  className={`flex-1 cursor-pointer p-2 text-center rounded-lg border text-sm ${
                    paymentMethod === "Online"
                      ? "bg-blue-100 border-blue-400"
                      : "bg-gray-100 border-gray-300 hover:bg-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="Online"
                    checked={paymentMethod === "Online"}
                    onChange={() => setPaymentMethod("Online")}
                    className="hidden"
                  />
                  Online
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={onClearCart}
                className="flex-1 px-3 py-2 rounded bg-gray-200 text-gray-800 text-sm"
              >
                Clear
              </button>
              <button
                disabled={placing}
                className="flex-1 bg-green-600 disabled:opacity-60 text-white px-3 py-2 rounded font-semibold text-sm"
                onClick={() => onPlaceOrder(paymentMethod)}
              >
                {placing ? "Placing..." : "Place Order"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// -------------------- Cart Modal (Mobile Only) --------------------
type CartModalProps = {
  cart: CartItem[]
  isOpen: boolean
  onClose: () => void
  onRemove: (id: string) => void
  onPlaceOrder: (paymentMethod: string) => void
  onClearCart: () => void
  placing: boolean
}

const CartModal = ({
  cart,
  isOpen,
  onClose,
  onRemove,
  onPlaceOrder,
  onClearCart,
  placing,
}: CartModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Online">("Cash")

  if (!isOpen) return null

  const total = cart.reduce((sum, item) => sum + item.sale_price * item.quantity, 0)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 md:hidden">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-bold mb-4">Your Cart</h2>

        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          <>
            <ul className="space-y-3">
              {cart.map(ci => (
                <CartItemRow key={ci.id} item={ci} onRemove={onRemove} />
              ))}
            </ul>

            <div className="mt-4 flex justify-between items-center border-t pt-4">
              <p className="font-bold text-lg">Total:</p>
              <p className="font-bold text-lg">Rs. {total}</p>
            </div>

            {/* Payment Method */}
            <div className="mt-4">
              <p className="font-semibold mb-2">Select Payment Method:</p>
              <div className="flex gap-4">
                <label
                  className={`flex-1 cursor-pointer p-3 text-center rounded-lg border ${
                    paymentMethod === "Cash"
                      ? "bg-green-100 border-green-400"
                      : "bg-gray-100 border-gray-300 hover:bg-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="Cash"
                    checked={paymentMethod === "Cash"}
                    onChange={() => setPaymentMethod("Cash")}
                    className="hidden"
                  />
                  Cash
                </label>
                <label
                  className={`flex-1 cursor-pointer p-3 text-center rounded-lg border ${
                    paymentMethod === "Online"
                      ? "bg-blue-100 border-blue-400"
                      : "bg-gray-100 border-gray-300 hover:bg-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="Online"
                    checked={paymentMethod === "Online"}
                    onChange={() => setPaymentMethod("Online")}
                    className="hidden"
                  />
                  Online
                </label>
              </div>
            </div>
          </>
        )}

        {cart.length > 0 && (
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={onClearCart}
              className="px-4 py-2 rounded bg-gray-200 text-gray-800"
            >
              Clear
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 text-gray-800"
            >
              Close
            </button>
            <button
              disabled={placing}
              className="bg-green-600 disabled:opacity-60 text-white px-6 py-3 rounded-lg font-semibold"
              onClick={() => onPlaceOrder(paymentMethod)}
            >
              {placing ? "Placing..." : "Place Order"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// -------------------- Main Page --------------------
export default function OrdersPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [loadingInventory, setLoadingInventory] = useState(true)
  const [placing, setPlacing] = useState(false)

  // Load cart
  useEffect(() => {
    const saved = localStorage.getItem("cart")
    if (saved) setCart(JSON.parse(saved))
  }, [])

  // Persist cart
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

  // Fetch inventory
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoadingInventory(true)
        const res = await fetch("/api/inventory")
        const data = await res.json()
        setItems((data?.items || []).map((r: any) => ({
          id: r.id,
          name: r.name,
          cost_price: Number(r.cost_price),
          sale_price: Number(r.sale_price),
        })))
      } catch (e) {
        console.error("Failed to load inventory:", e)
      } finally {
        setLoadingInventory(false)
      }
    }
    fetchItems()
  }, [])

  // Cart handlers
  const addToCart = (item: InventoryItem) => {
    setCart(prev => {
      const found = prev.find(ci => ci.id === item.id)
      if (found) return prev.map(ci => ci.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci)
      return [...prev, { ...item, quantity: 1 }]
    })
    setSelectedItems(prev => (prev.includes(item.id) ? prev : [...prev, item.id]))
  }

const removeFromCart = (id: string) => {
  setCart(prev => prev.filter(ci => ci.id !== id))
  setSelectedItems(prev => prev.filter(itemId => itemId !== id)) // 👈 reset color to blue
}

  const clearCart = () => { setCart([]); localStorage.removeItem("cart") 
  setSelectedItems([]) 
  }

  const totalItems = cart.reduce((sum, ci) => sum + ci.quantity, 0)

  // Place order
  const handlePlaceOrder = async (paymentMethod: string) => {
    if (cart.length === 0) return alert("No items in cart!")

    try {
      setPlacing(true)
      const payload = {
        orderName: "Customer Order",
        items: cart.map(ci => ({ id: ci.id, quantity: ci.quantity })),
        paymentMethod,
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(`❌ Failed: ${data?.message || data?.error || "Unknown error"}`)
        return
      }

      toast.success("✅ Order placed successfully!")
      clearCart()
      setIsModalOpen(false)
    } catch (e: any) {
      toast.error(`❌ Error placing order: ${e?.message || e}`)
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Main Content Area - 70% on desktop */}
      <div className="flex-1 md:w-[70%] p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">🛒 Place Order</h1>
          <CartButton totalItems={totalItems} onClick={() => setIsModalOpen(true)} />
        </div>

        {loadingInventory ? (
          <div className="text-center py-10 text-gray-500">Loading inventory...</div>
        ) : (
          <>
            <InventoryGrid items={items} onAddToCart={addToCart}  selectedItems={selectedItems}/>

            {/* Mobile Place Order Button */}
            <div className="mt-6 md:hidden">
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={cart.length === 0}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50"
              >
                Place Order
              </button>
            </div>
          </>
        )}
      </div>

      {/* Cart Sidebar - 30% on desktop, hidden on mobile */}
      <div className="hidden md:block md:w-[30%] h-full">
        <CartSidebar
          cart={cart}
          onRemove={removeFromCart}
          onPlaceOrder={handlePlaceOrder}
          onClearCart={clearCart}
          placing={placing}
        />
      </div>

      {/* Mobile Cart Modal */}
      <CartModal
        cart={cart}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRemove={removeFromCart}
        onPlaceOrder={handlePlaceOrder}
        onClearCart={clearCart}
        placing={placing}
      />
    </div>
  )
}