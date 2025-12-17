import { NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    const response = await fetch(`${BACKEND_URL}/users`, {
      method: "GET",
      headers: {
        Authorization: authHeader ?? "",
      },
    });

    // Aseguramos que la respuesta no esté vacía y que sea JSON
    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API USERS ERROR]", errorText);
      return NextResponse.json(
        { error: "Error al obtener los usuarios", message: errorText },
        { status: response.status }
      );
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : [];

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API USERS GET ERROR]", error);
    return NextResponse.json(
      { error: "Users fetch failed" },
      { status: 500 }
    );
  }
}

