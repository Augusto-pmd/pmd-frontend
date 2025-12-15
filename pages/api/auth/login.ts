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
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const targetUrl = `${BACKEND_BASE_URL}/api/auth/login`;

    // Prepare headers - exclude host and connection
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    Object.keys(req.headers).forEach((key) => {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey !== "host" &&
        lowerKey !== "connection" &&
        lowerKey !== "content-length" &&
        lowerKey !== "content-type"
      ) {
        const value = req.headers[key];
        if (typeof value === "string") {
          headers[key] = value;
        } else if (Array.isArray(value) && value.length > 0) {
          headers[key] = value[0];
        }
      }
    });

    // Prepare body - JSON.stringify for POST
    const body = req.body ? JSON.stringify(req.body) : undefined;

    // Forward request to backend
    const response = await fetch(targetUrl, {
      method: "POST",
      headers,
      body,
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
    console.error("[Login API Error]", error);
    res.status(500).json({
      error: "Login error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

