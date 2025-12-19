import { NextResponse } from "next/server";

import { getBackendUrl } from "@/lib/env";

const BACKEND_URL = getBackendUrl();

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const response = await fetch(`${BACKEND_URL}/api/users/me`, {
      method: "GET",
      headers: {
        Authorization: authHeader ?? "",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API USERS ME ERROR]", errorText);
      return NextResponse.json(
        { error: "Error al obtener el usuario", message: errorText },
        { status: response.status }
      );
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[API USERS ME GET ERROR]", error);
    return NextResponse.json(
      { error: "User fetch failed" },
      { status: 500 }
    );
  }
}

