import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const { searchParams } = new URL(request.url);
    const cashboxId = searchParams.get("cashboxId");

    let url = `${BACKEND_URL}/cash-movements`;
    if (cashboxId) {
      url += `?cashboxId=${encodeURIComponent(cashboxId)}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: authHeader ?? "",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API CASH-MOVEMENTS GET ERROR]", errorText);
      return NextResponse.json(
        { error: "Error al obtener los movimientos", message: errorText },
        { status: response.status }
      );
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : [];

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API CASH-MOVEMENTS GET ERROR]", error);
    return NextResponse.json(
      { error: "Cash movements fetch failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const body = await request.text();

    const response = await fetch(`${BACKEND_URL}/cash-movements`, {
      method: "POST",
      headers: {
        Authorization: authHeader ?? "",
        "Content-Type": "application/json",
      },
      body,
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API CASH-MOVEMENTS POST ERROR]", error);
    return NextResponse.json(
      { error: "Cash movement create failed" },
      { status: 500 }
    );
  }
}

