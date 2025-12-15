import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Read body with error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid request body", message: "Request body must be valid JSON" },
        { status: 400 }
      );
    }

    // Build target URL using environment variable
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://pmd-backend-84da.onrender.com";
    const targetUrl = `${backendUrl}/auth/login`;

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

    // Read response as text first
    const responseText = await response.text();

    // Try to parse JSON safely
    let responseBody;
    try {
      responseBody = responseText ? JSON.parse(responseText) : {};
    } catch (jsonError) {
      // If JSON parsing fails, return the text as error message
      return NextResponse.json(
        {
          error: "Invalid response from backend",
          message: responseText || "Empty response",
        },
        { status: response.status || 500 }
      );
    }

    // Propagate backend status code (200, 401, etc.)
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
