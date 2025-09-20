import { NextResponse } from "next/server";
import { supabase } from "@/libs/supabaseClient";
import { verifyJwt } from "@/libs/jwt";
import { addInventoryLogsToSheet, addInventoryToSheet, findInventoryRowIndex, updateExistingInventoryInSheet } from "@/libs/sheets";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("inventory")
      .select("id, name, no_of_units, sale_price, cost_price, added_by, added_at")
      .order("name", { ascending: true }); // ✅ Order by name ASC

    if (error) {
      console.error("❌ Supabase fetch error:", error);
      return NextResponse.json(
        { message: "Failed to fetch inventory", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ items: data }, { status: 200 });
  } catch (err: any) {
    console.error("❌ API Error:", err.message);
    return NextResponse.json(
      { message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ message: "No items provided" }, { status: 400 });
    }

    // ✅ Get JWT from cookie
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

    const results: any[] = [];

    for (const item of items) {
      const { name, costPrice, sale_price, units } = item;

      // 🔎 Check if item exists
      const { data: existing, error: fetchErr } = await supabase
        .from("inventory")
        .select("id, name, cost_price, sale_price, no_of_units")
        .eq("name", name)
        .maybeSingle();

      if (fetchErr) {
        console.error("❌ Supabase fetch error:", fetchErr);
        return NextResponse.json(
          { message: "Failed to fetch inventory", error: fetchErr.message },
          { status: 500 }
        );
      }

      if (!existing) {
        // 🆕 Insert new item
        const { data: inserted, error: insertErr } = await supabase
          .from("inventory")
          .insert([
            {
              name,
              cost_price: costPrice ?? 0, // fallback to 0 if not provided
              sale_price: sale_price ?? 0,
              no_of_units: units ?? 0,
              added_by: payload.name,
            },
          ])
          .select()
          .single();
        // add new inventory to google sheets
        await addInventoryToSheet([{
          iten_name: name,
          units: units ?? 0,
          sale_price: sale_price ?? 0,
          cost_price: costPrice ?? 0,
          userId: String(payload.name),
        }])

        if (insertErr) {
          console.error("❌ Insert error:", insertErr);
          return NextResponse.json(
            { message: "Failed to insert", error: insertErr.message },
            { status: 500 }
          );
        }

        results.push(inserted);
      } else {
        // 📝 Update existing item: replace values if provided, else keep existing
        const newCostPrice =
          costPrice !== undefined && costPrice !== null
            ? Number(costPrice)
            : Number(existing.cost_price);

        const newSalePrice =
          sale_price !== undefined && sale_price !== null
            ? Number(sale_price)
            : Number(existing.sale_price);

        const newUnits =
          units !== undefined && units !== null
            ? Number(existing.no_of_units) + Number(units)
            : Number(existing.no_of_units);

        const { data: updated, error: updateErr } = await supabase
          .from("inventory")
          .update({
            cost_price: newCostPrice,
            sale_price: newSalePrice,
            no_of_units: newUnits,
          })
          .eq("id", existing.id)
          .select()
          .single();

        const rowIndex = await findInventoryRowIndex(name)
        if (rowIndex) {
          await updateExistingInventoryInSheet({
            iten_name: name,
            units: newUnits,
            sale_price: newSalePrice,
            cost_price: newCostPrice,
            userId: String(payload.name),
          }, rowIndex)
        }

        if (updateErr) {
          console.error("❌ Update error:", updateErr);
          return NextResponse.json(
            { message: "Failed to update", error: updateErr.message },
            { status: 500 }
          );
        }    
          
        results.push(updated);
      }
    }

    await addInventoryLogsToSheet(items.map((item: any) => ({
      iten_name: item.name,
      units: item.units ?? 0,
      sale_price: item.sale_price ?? 0,
      cost_price: item.costPrice ?? 0,
      userId: String(payload.name),
    })))

    return NextResponse.json(
      { message: "Inventory processed successfully!", data: results },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ API Error:", err.message);
    return NextResponse.json(
      { message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}
