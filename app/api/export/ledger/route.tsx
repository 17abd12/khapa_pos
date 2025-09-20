import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { supabase } from "@/libs/supabaseClient";
import { verifyJwt } from "@/libs/jwt";

export async function GET(req: Request) {
  try {
    // ✅ Auth check
    const cookieHeader = req.headers.get("cookie");
    const token = cookieHeader
      ?.split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const payload = await verifyJwt(token);
    if (!payload) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    // ✅ Fetch investments
    const { data: investments } = await supabase
      .from("investments")
      .select("amount, description, added_at");

    // ✅ Fetch expenses
    const { data: expenses } = await supabase
      .from("expenses")
      .select("amount, description, added_at");

    // ✅ Fetch sales
    const { data: orders } = await supabase
      .from("orders")
      .select("added_at, id, order_items(sale_price, quantity)");

    // ✅ Fetch inventory additions
    const { data: inventory } = await supabase
      .from("inventory")
      .select("added_at, name, cost_price, no_of_units");

    // =======================
    // Build Ledger in ExcelJS
    // =======================
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Ledger");

    // Header row
    ws.addRow(["Date", "Description", "Value"]);

    let totalCapital = 0;
    let totalSales = 0;
    let totalExpenses = 0;
    let totalInventory = 0;

    // Collect all entries in an array first
    const rows: { date: string; desc: string; value: number }[] = [];

    // Helper → format date (YYYY-MM-DD only)
    const fmtDate = (d: string) =>
      new Date(d).toISOString().split("T")[0];

    // Initial Investment
    investments?.forEach((inv) => {
      rows.push({
        date: fmtDate(inv.added_at),
        desc: `Investment: ${inv.description}`,
        value: Number(inv.amount),
      });
      totalCapital += Number(inv.amount);
    });

    // Inventory
    inventory?.forEach((inv) => {
      const value = Number(inv.cost_price) * Number(inv.no_of_units);
      rows.push({
        date: fmtDate(inv.added_at),
        desc: `Inventory Addition: ${inv.name}`,
        value: -value,
      });
      totalInventory += value;
    });

    // Sales → group by date
    const salesByDate: Record<string, number> = {};
    orders?.forEach((o) => {
      const date = fmtDate(o.added_at);
      const orderTotal = o.order_items.reduce(
        (sum: number, it: any) =>
          sum + Number(it.sale_price) * Number(it.quantity),
        0
      );
      salesByDate[date] = (salesByDate[date] || 0) + orderTotal;
      totalSales += orderTotal;
    });

    // Push grouped sales
    Object.entries(salesByDate).forEach(([date, amount]) => {
      rows.push({
        date,
        desc: `Sales Total`,
        value: amount,
      });
    });

    // Expenses
    expenses?.forEach((exp) => {
      rows.push({
        date: fmtDate(exp.added_at),
        desc: `Expense: ${exp.description}`,
        value: -Number(exp.amount),
      });
      totalExpenses += Number(exp.amount);
    });

    // ✅ Sort rows by date (earliest → latest)
    rows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Write rows to worksheet
    rows.forEach((r) => ws.addRow([r.date, r.desc, r.value]));

    // Totals
    ws.addRow([]);
    const net = totalCapital + totalSales - totalInventory - totalExpenses;
    ws.addRow(["", "Net Profit / Loss", net]);

    // Style header
    ws.getRow(1).font = { bold: true };

    // ✅ Return Excel as download
    const buffer = await wb.xlsx.writeBuffer();
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Disposition": 'attachment; filename="ledger.xlsx"',
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch (err: any) {
    console.error("❌ Export Ledger Error:", err.message);
    return NextResponse.json(
      { message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}
