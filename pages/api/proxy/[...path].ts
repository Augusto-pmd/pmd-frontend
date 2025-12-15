import type { NextApiRequest, NextApiResponse } from "next";

const BACKEND_BASE_URL = "https://pmd-backend-84da.onrender.com";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { path } = req.query;

    if (!path || !Array.isArray(path) || path.length === 0) {
      return res.status(400).json({ error: "Invalid proxy path" });
    }

    // Build target URL with /api prefix
    const targetUrl = `${BACKEND_BASE_URL}/api/${path.join("/")}`;

    // Prepare headers - exclude host and connection
    const headers: Record<string, string> = {};
    Object.keys(req.headers).forEach((key) => {
      const lowerKey = key.toLowerCase();
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

    // Set Content-Type for POST/PUT/PATCH if body exists
    if (
      req.method !== "GET" &&
      req.method !== "HEAD" &&
      req.method !== "OPTIONS" &&
      req.body &&
      !headers["content-type"]
    ) {
      headers["content-type"] = "application/json";
    }

    // Prepare body - JSON.stringify for POST/PUT/PATCH
    let body: string | undefined;
    if (req.method !== "GET" && req.method !== "HEAD" && req.method !== "OPTIONS") {
      if (req.body) {
        body = JSON.stringify(req.body);
      }
    }

    // Forward request to backend
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: body || undefined,
    });

    // Get response body
    const responseBody = await response.text();

    // Forward response headers (exclude CORS headers)
    response.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
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

    // Send response with status code
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
