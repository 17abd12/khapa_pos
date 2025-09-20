import { NextResponse } from "next/server";
import { supabase } from "@/libs/supabaseClient";
import ExcelJS from "exceljs";

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
            quantity,
            cost_price
          )`
        )
        .order("added_at", { ascending: false });

      if (error) throw error;

      // ✅ Flatten orders → one row per item
      data = (orders || []).flatMap((o: any) =>
        (o.order_items || []).map((it: any) => ({
          orderId: o.id,
          paymentMethod: o.paymentMethod,
          cashier: o.added_by,
          date: o.added_at,
          item: it.name,
          quantity: it.quantity,
          sale_price: it.sale_price,
          cost_price: it.cost_price,
          totalItemPrice: Number(it.sale_price || 0) * Number(it.quantity || 0),
        }))
      );
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

    // ✅ Convert to XLSX using exceljs
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(type);

    worksheet.columns = Object.keys(data[0]).map((key) => ({
      header: key,
      key,
    }));

    data.forEach((row) => worksheet.addRow(row));

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${type}.xlsx"`,
      },
    });
  } catch (err: any) {
    console.error("❌ XLSX export error:", err.message);
    return NextResponse.json(
      { message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}
