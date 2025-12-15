import type { NextApiRequest, NextApiResponse } from "next";

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || "https://pmd-backend-84da.onrender.com";

// Use custom body parser to preserve raw body for proxying
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Get path segments from query
    const { path } = req.query;

    // Validate path segments
    if (!path || !Array.isArray(path) || path.length === 0) {
      return res.status(400).json({ error: "Invalid proxy path" });
    }

    // Build target URL: https://pmd-backend-84da.onrender.com/api/auth/login
    const backendUrl = `${BACKEND_BASE_URL}/api/${path.join("/")}`;

    // Prepare headers - exclude host and connection, preserve others
    const headers: Record<string, string> = {};
    Object.keys(req.headers).forEach((key) => {
      const lowerKey = key.toLowerCase();
      // Exclude headers that shouldn't be forwarded
      if (
        lowerKey !== "host" &&
        lowerKey !== "connection" &&
        lowerKey !== "content-length"
      ) {
        const value = req.headers[key];
        if (typeof value === "string") {
          headers[key] = value;
        } else if (Array.isArray(value) && value.length > 0) {
          headers[key] = value[0];
        }
      }
    });

    // Get request body if present (skip for GET, HEAD, OPTIONS)
    let body: string | undefined;
    if (req.method !== "GET" && req.method !== "HEAD" && req.method !== "OPTIONS") {
      if (req.body) {
        // If body is already a string, use it; otherwise stringify
        body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
      }
    }

    // Make request to backend
    const response = await fetch(backendUrl, {
      method: req.method,
      headers,
      body: body || undefined,
    });

    // Get response body
    const responseBody = await response.text();

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
        res.setHeader(key, value);
      }
    });

    // Set status and send response
    res.status(response.status);
    res.send(responseBody);
  } catch (error) {
    console.error("[Proxy Error]", error);
    res.status(500).json({
      error: "Proxy error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
