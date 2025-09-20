// app/api/orders/route.ts
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabase } from "@/libs/supabaseClient"
import { verifyJwt } from "@/libs/jwt"
import { addSalesToSheet } from "@/libs/sheets";

type IncomingItem = { id: string; quantity: number }

//
// ----------------- POST (Create Order) -----------------
//
export async function POST(req: Request) {
  try {
    const { items, orderName, paymentMethod } = (await req.json()) as {
      items: IncomingItem[]
      orderName?: string
      paymentMethod?: "Cash" | "Online"
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: "No items in order" }, { status: 400 })
    }

    if (!paymentMethod || !["Cash", "Online"].includes(paymentMethod)) {
      return NextResponse.json({ message: "Invalid payment method" }, { status: 400 })
    }


const cookieStore = await cookies(); 
const token = cookieStore.get("token")?.value; 

    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

    const payload = await verifyJwt(token)
    const username: string | undefined = (payload as any)?.username
    if (!username) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    const { data: userRow, error: userErr } = await supabase
      .from("users")
      .select("name")
      .eq("username", username)
      .single()

    if (userErr || !userRow) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }
    const userId = userRow.name

    // 🧮 Consolidate duplicates
    const qtyMap = new Map<string, number>()
    for (const it of items) {
      if (!it?.id || !Number.isInteger(it.quantity) || it.quantity <= 0) {
        return NextResponse.json({ message: "Invalid item payload" }, { status: 400 })
      }
      qtyMap.set(it.id, (qtyMap.get(it.id) ?? 0) + it.quantity)
    }
    const ids = [...qtyMap.keys()]

    // 📦 Fetch inventory rows for validation & prices
    const { data: invRows, error: invErr } = await supabase
      .from("inventory")
      .select("id, name, cost_price, sale_price, no_of_units")
      .in("id", ids)

    if (invErr) {
      return NextResponse.json(
        { message: "Inventory fetch failed", error: invErr.message },
        { status: 500 }
      )
    }
    if (!invRows || invRows.length !== ids.length) {
      return NextResponse.json({ message: "Some items not found or missing" }, { status: 400 })
    }

    // 🧾 Stock checks
    for (const row of invRows) {
      const need = qtyMap.get(row.id)!
      if (row.no_of_units < need) {
        return NextResponse.json(
          { message: `Insufficient stock for ${row.name}: have ${row.no_of_units}, need ${need}` },
          { status: 400 }
        )
      }
    }

    // 📝 Create order with paymentMethod
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert([{ name: orderName ?? "Order", added_by: userId, paymentMethod }])
      .select()
      .single()

    if (orderErr || !order) {
      return NextResponse.json(
        { message: "Failed to create order", error: orderErr?.message },
        { status: 500 }
      )
    }

    // 🧾 Build order_items
    const orderItemsPayload = invRows.map((row) => ({
      order_id: order.id,
      name: row.name,
      cost_price: row.cost_price,
      sale_price: row.sale_price,
      quantity: qtyMap.get(row.id)!,
    }))

    const { error: oiErr } = await supabase.from("order_items").insert(orderItemsPayload)
    if (oiErr) {
      return NextResponse.json({ message: "Failed to insert order items", error: oiErr.message }, { status: 500 })
    }

    // 📉 Decrement inventory
    for (const row of invRows) {
      const newUnits = row.no_of_units - qtyMap.get(row.id)!
      const { error: updErr } = await supabase.from("inventory").update({ no_of_units: newUnits }).eq("id", row.id)
      if (updErr) {
        return NextResponse.json(
          { message: `Failed to update stock for ${row.name}`, error: updErr.message },
          { status: 500 }
        )
      }
    }

    // add to google sheets 
    await addSalesToSheet(invRows.map(row => ({
      iten_name: row.name,
      quantity: qtyMap.get(row.id)!,
      price: row.sale_price,
      payment_method: paymentMethod || "Cash",
      userId: userId,
    })))

    return NextResponse.json({ message: "Order placed", orderId: order.id, paymentMethod: order.paymentMethod }, { status: 201 })
  } catch (e: any) {
    console.error("❌ orders POST error:", e)
    return NextResponse.json({ message: "Server error", error: e?.message || String(e) }, { status: 500 })
  }
}


//
// ----------------- GET (List Orders) -----------------
// app/api/orders/route.ts

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let query = supabase
      .from("orders")
      .select(
        `id,
        paymentMethod,
        added_by,
        added_at,
        order_items (
          name,
          sale_price,
          quantity
        )`
      )
      .order("added_at", { ascending: false })

    // ⏳ Apply date filtering if provided
    if (startDate && endDate) {
      query = query.gte("added_at", startDate).lte("added_at", endDate)
    }

    const { data: orders, error: orderErr } = await query

    if (orderErr) {
      return NextResponse.json(
        { message: "Failed to fetch orders", error: orderErr.message },
        { status: 500 }
      )
    }

    if (!orders) {
      return NextResponse.json({ orders: [] }, { status: 200 })
    }

    // 🧮 Add total bill per order
    const formatted = orders.map((o: any) => ({
      orderId: o.id,
      paymentMethod: o.paymentMethod,
      orderCashier: o.added_by,
      orderDate: o.added_at,
      items: o.order_items || [],
      totalBill: (o.order_items || []).reduce(
        (sum: number, it: any) =>
          sum + Number(it.sale_price || 0) * Number(it.quantity || 0),
        0
      ),
    }))

    return NextResponse.json({ orders: formatted }, { status: 200 })
  } catch (e: any) {
    console.error("❌ orders GET error:", e)
    return NextResponse.json(
      { message: "Server error", error: e?.message || String(e) },
      { status: 500 }
    )
  }
}