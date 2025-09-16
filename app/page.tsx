"use client"

import { useEffect, useState } from "react"
import toast, { Toaster } from "react-hot-toast"
import { InventoryItem, CartItem } from "@/app/types/inventory"
import CartButton from "@/app/components/CartButton"
import InventoryGrid from "@/app/components/InventoryGrid"
// import CartSidebar from "@/app/components/CartSidebar"
import CartSidebar from "./components/CartSideBar"
import CartModal from "@/app/components/CartModal"

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
    setSelectedItems(prev => prev.filter(itemId => itemId !== id)) // reset color
  }

  const clearCart = () => { 
    setCart([]); 
    localStorage.removeItem("cart") 
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

      {/* Main Content Area */}
      <div className="flex-1 md:w-[70%] p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">🛒 Place Order</h1>
          <CartButton totalItems={totalItems} onClick={() => setIsModalOpen(true)} />
        </div>

        {loadingInventory ? (
          <div className="text-center py-10 text-gray-500">Loading inventory...</div>
        ) : (
          <>
            <InventoryGrid items={items} onAddToCart={addToCart} selectedItems={selectedItems} />

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

      {/* Cart Sidebar - Desktop */}
      <div className="hidden md:block md:w-[30%] h-full">
        <CartSidebar
          cart={cart}
          onRemove={removeFromCart}
          onPlaceOrder={handlePlaceOrder}
          onClearCart={clearCart}
          placing={placing}
        />
      </div>

      {/* Cart Modal - Mobile */}
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
