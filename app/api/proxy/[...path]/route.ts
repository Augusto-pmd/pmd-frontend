import { NextRequest, NextResponse } from "next/server";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || "https://pmd-backend-84da.onrender.com";

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, "PUT");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, "PATCH");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, "DELETE");
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    // Reconstruct the path: /api/proxy/api/auth/login -> /api/auth/login
    const path = `/${pathSegments.join("/")}`;
    const backendUrl = `${BACKEND_BASE_URL}${path}`;

    // Get request body if present
    let body: string | undefined;
    if (method !== "GET" && method !== "HEAD") {
      try {
        body = await request.text();
      } catch {
        // No body or already consumed
      }
    }

    // Prepare headers - exclude host and connection, preserve others
    const headers: HeadersInit = {};
    request.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      // Exclude headers that shouldn't be forwarded
      if (
        lowerKey !== "host" &&
        lowerKey !== "connection" &&
        lowerKey !== "content-length"
      ) {
        headers[key] = value;
      }
    });

    // Make request to backend
    const response = await fetch(backendUrl, {
      method,
      headers,
      body: body || undefined,
    });

    // Get response body
    const responseBody = await response.text();

    // Create response with same status and headers
    const proxiedResponse = new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
    });

    // Copy relevant response headers (exclude CORS headers since we're same-origin now)
    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      // Exclude CORS and connection headers
      if (
        lowerKey !== "access-control-allow-origin" &&
        lowerKey !== "access-control-allow-methods" &&
        lowerKey !== "access-control-allow-headers" &&
        lowerKey !== "access-control-allow-credentials" &&
        lowerKey !== "connection"
      ) {
        proxiedResponse.headers.set(key, value);
      }
    });

    // Ensure Content-Type is set if not already present
    if (!proxiedResponse.headers.has("content-type")) {
      const contentType = response.headers.get("content-type");
      if (contentType) {
        proxiedResponse.headers.set("content-type", contentType);
      } else {
        // Default to JSON if content looks like JSON
        try {
          JSON.parse(responseBody);
          proxiedResponse.headers.set("content-type", "application/json");
        } catch {
          // Not JSON, leave without Content-Type
        }
      }
    }

    return proxiedResponse;
  } catch (error) {
    console.error("[Proxy Error]", error);
    return NextResponse.json(
      { error: "Proxy error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
