"use client"

import { CartItem } from "@/app/types/inventory"

type CartItemRowProps = {
  item: CartItem
  onRemove: (id: string) => void
}

export default function CartItemRow({ item, onRemove }: CartItemRowProps) {
  return (
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
}
