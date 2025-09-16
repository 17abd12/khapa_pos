"use client"

import { useState } from "react"
import { CartItem } from "@/app/types/inventory"
import CartItemRow from "./CartItemRow"

type CartSidebarProps = {
  cart: CartItem[]
  onRemove: (id: string) => void
  onPlaceOrder: (paymentMethod: string) => void
  onClearCart: () => void
  placing: boolean
}

export default function CartSidebar({ cart, onRemove, onPlaceOrder, onClearCart, placing }: CartSidebarProps) {
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

            <div className="mb-4">
              <p className="font-semibold mb-2 text-sm">Payment Method:</p>
              <div className="flex gap-2">
                {["Cash", "Online"].map(method => (
                  <label
                    key={method}
                    className={`flex-1 cursor-pointer p-2 text-center rounded-lg border text-sm ${
                      paymentMethod === method
                        ? method === "Cash"
                          ? "bg-green-100 border-green-400"
                          : "bg-blue-100 border-blue-400"
                        : "bg-gray-100 border-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method as "Cash" | "Online")}
                      className="hidden"
                    />
                    {method}
                  </label>
                ))}
              </div>
            </div>
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
