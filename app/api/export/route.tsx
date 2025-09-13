import { NextResponse } from "next/server";
import { supabase } from "@/libs/supabaseClient";

// Utility: convert array of objects → CSV string
function toCSV(data: any[]): string {
  if (!data || data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const rows = data.map(obj =>
    headers.map(h => JSON.stringify(obj[h] ?? "")).join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (!type) {
      return NextResponse.json(
        { message: "Missing ?type=orders|inventory" },
        { status: 400 }
      );
    }

    let data: any[] = [];

    if (type === "orders") {
      const { data: orders, error } = await supabase
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
        .order("added_at", { ascending: false });

      if (error) throw error;

      data = (orders || []).map((o: any) => ({
        orderId: o.id,
        paymentMethod: o.paymentMethod,
        cashier: o.added_by,
        date: o.added_at,
        totalBill: (o.order_items || []).reduce(
          (sum: number, it: any) =>
            sum + Number(it.sale_price || 0) * Number(it.quantity || 0),
          0
        ),
        items: (o.order_items || [])
          .map((it: any) => `${it.name} x${it.quantity} @${it.sale_price}`)
          .join(" | "),
      }));
    }

    if (type === "inventory") {
      const { data: items, error } = await supabase
        .from("inventory")
        .select(
          "id, name, no_of_units, sale_price, cost_price, added_by, added_at"
        );

      if (error) throw error;

      data = items || [];
    }

    if (!data.length) {
      return NextResponse.json({ message: "No data found" }, { status: 404 });
    }

    // Convert to CSV
    const csv = toCSV(data);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${type}.csv"`,
      },
    });
  } catch (err: any) {
    console.error("❌ CSV export error:", err.message);
    return NextResponse.json(
      { message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}
