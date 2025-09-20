"use client"

import { useEffect, useState } from "react"

type OrderItem = {
  name: string
  sale_price: number
  quantity: number
}

type Order = {
  orderId: string
  orderCashier: string
  paymentMethod: string
  orderDate: string
  items: OrderItem[]
  totalBill: number
}

export default function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const fetchOrders = async (start?: string, end?: string) => {
    try {
      setLoading(true)
      let url = "/api/orders"
      if (start && end) {
        url += `?startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}`
      }
      const res = await fetch(url)
      const data = await res.json()
      setOrders(data.orders || [])
    } catch (err) {
      console.error("Failed to fetch orders", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleFilter = () => {
    if (startDate && endDate) {
      fetchOrders(startDate, endDate)
    } else {
      fetchOrders() // fallback if dates not selected
    }
  }

  if (loading) return <p className="p-4">Loading orders...</p>

  if (orders.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Orders</h2>
        <div className="flex items-center gap-3 mb-4">
          <div>
            <label className="block text-sm font-medium">Starting Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Closing Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded px-2 py-1"
            />
          </div>
          <button
            onClick={handleFilter}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Filter
          </button>
        </div>
        <p>No orders found.</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Orders</h2>

      {/* Date filters */}
      <div className="flex items-center gap-3 mb-4">
        <div>
          <label className="block text-sm font-medium">Starting Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Closing Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
        <button
          onClick={handleFilter}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Filter
        </button>
      </div>

      {/* Orders table */}
      <table className="w-full border border-gray-300 rounded-lg overflow-hidden shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2 text-left">Payment Method</th>
            <th className="border px-3 py-2 text-left">Cashier</th>
            <th className="border px-3 py-2 text-left">Date</th>
            <th className="border px-3 py-2 text-left">Items</th>
            <th className="border px-3 py-2 text-right">Total Bill</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.orderId} className="hover:bg-gray-50">
              <td className="border px-3 py-2">{order.paymentMethod}</td>
              <td className="border px-3 py-2">{order.orderCashier}</td>
              <td className="border px-3 py-2">
                {new Date(order.orderDate).toLocaleString()}
              </td>
              <td className="border px-3 py-2">
                <ul className="list-disc pl-5">
                  {order.items.map((item, i) => (
                    <li key={i}>
                      {item.name} — {item.quantity} × Rs.{item.sale_price}
                    </li>
                  ))}
                </ul>
              </td>
              <td className="border px-3 py-2 text-right font-semibold">
                Rs.{order.totalBill}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
