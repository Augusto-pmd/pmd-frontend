import { NextResponse } from "next/server";

const BACKEND_BASE_URL = "https://pmd-backend-84da.onrender.com";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const targetUrl = `${BACKEND_BASE_URL}/api/auth/login`;

    // Prepare headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Forward request to backend
    const response = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    // Get response body
    const responseBody = await response.json();

    // Return response with status code
    return NextResponse.json(responseBody, { status: response.status });
  } catch (error) {
    console.error("[Login API Error]", error);
    return NextResponse.json(
      {
        error: "Login error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

