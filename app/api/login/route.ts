import { NextResponse } from "next/server";
import { supabase } from "@/libs/supabaseClient";
import { signJwt } from "@/libs/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ message: "Missing username or password" }, { status: 400 });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("username, name, password")
      .eq("username", username)
      .eq("password", password)
      .single();

    if (error || !user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      return NextResponse.json({ message: "Server misconfigured" }, { status: 500 });
    }

    const token = await signJwt({
      username: user.username,
      name: user.name,
    });

    // ✅ Use NextResponse to set cookie
    const res = NextResponse.json({
      message: "Login successful",
      user: { username: user.username, name: user.name },
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res;
  } catch (err: unknown) {
      if (err instanceof Error) {
    return NextResponse.json({ message: "Server error", error: err.message }, { status: 500 });
  } else {
    return NextResponse.json({ message: "Unknowb error" }, { status: 500 });
  }
    ;
  }
}
