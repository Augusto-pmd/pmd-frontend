import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    const response = await fetch(`${BACKEND_URL}/cashboxes`, {
      method: "GET",
      headers: {
        Authorization: authHeader ?? "",
      },
    });

    // Aseguramos que la respuesta no esté vacía y que sea JSON
    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API CASHBOXES ERROR]", errorText);
      return NextResponse.json(
        { error: "Error al obtener las cajas", message: errorText },
        { status: response.status }
      );
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : [];

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API CASHBOXES GET ERROR]", error);
    return NextResponse.json(
      { error: "Cashboxes fetch failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const body = await request.text();

    const response = await fetch(`${BACKEND_URL}/cashboxes`, {
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
    console.error("[API CASHBOXES POST ERROR]", error);
    return NextResponse.json(
      { error: "Cashboxes create failed" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const body = await request.text();

    const response = await fetch(`${BACKEND_URL}/cashboxes`, {
      method: "PATCH",
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
    console.error("[API CASHBOXES PATCH ERROR]", error);
    return NextResponse.json(
      { error: "Cashboxes update failed" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const body = await request.text();

    const response = await fetch(`${BACKEND_URL}/cashboxes`, {
      method: "DELETE",
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
    console.error("[API CASHBOXES DELETE ERROR]", error);
    return NextResponse.json(
      { error: "Cashboxes delete failed" },
      { status: 500 }
    );
  }
}

