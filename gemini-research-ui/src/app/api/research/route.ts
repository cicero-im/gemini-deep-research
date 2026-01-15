/**
 * Research API Route
 *
 * POST: Start a new deep research interaction with SSE streaming.
 *
 * Request body:
 * - topic: string - The research topic or question
 * - mode: 'web' | 'web+files' - Research mode
 * - fileStoreId?: string - Optional file store ID for web+files mode
 * - previousInteractionId?: string - Optional ID for follow-up questions
 *
 * Response: Server-Sent Events stream with research progress and results.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createGeminiClient,
  createSSEStream,
  formatSSEEvent,
  type ResearchMode,
  type ErrorEvent,
} from "@/lib/gemini";

// =============================================================================
// TYPES
// =============================================================================

interface ResearchRequestBody {
  topic: string;
  mode: ResearchMode;
  fileStoreId?: string;
  previousInteractionId?: string;
}

// =============================================================================
// VALIDATION
// =============================================================================

function validateRequestBody(
  body: unknown
): body is ResearchRequestBody {
  if (!body || typeof body !== "object") {
    return false;
  }

  const { topic, mode } = body as Record<string, unknown>;

  if (typeof topic !== "string" || topic.trim().length === 0) {
    return false;
  }

  if (mode !== "web" && mode !== "web+files") {
    return false;
  }

  return true;
}

function getValidationError(body: unknown): string {
  if (!body || typeof body !== "object") {
    return "Request body must be a JSON object";
  }

  const { topic, mode, fileStoreId } = body as Record<string, unknown>;

  if (typeof topic !== "string" || topic.trim().length === 0) {
    return "Topic is required and must be a non-empty string";
  }

  if (mode !== "web" && mode !== "web+files") {
    return "Mode must be either 'web' or 'web+files'";
  }

  if (mode === "web+files" && fileStoreId !== undefined && typeof fileStoreId !== "string") {
    return "fileStoreId must be a string when provided";
  }

  return "Invalid request body";
}

// =============================================================================
// ROUTE HANDLERS
// =============================================================================

/**
 * POST /api/research
 *
 * Starts a new deep research interaction and streams results via SSE.
 */
export async function POST(request: NextRequest) {
  try {
    // Get API key from header or environment
    const apiKey =
      request.headers.get("X-Gemini-API-Key") ??
      request.headers.get("Authorization")?.replace("Bearer ", "") ??
      process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "API key required",
          message:
            "Provide API key via X-Gemini-API-Key header, Authorization header, or GEMINI_API_KEY environment variable",
        },
        { status: 401 }
      );
    }

    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON", message: "Request body must be valid JSON" },
        { status: 400 }
      );
    }

    // Validate request body
    if (!validateRequestBody(body)) {
      return NextResponse.json(
        { error: "Validation error", message: getValidationError(body) },
        { status: 400 }
      );
    }

    const { topic, mode, fileStoreId, previousInteractionId } = body;

    // Validate web+files mode has file store ID
    if (mode === "web+files" && !fileStoreId) {
      return NextResponse.json(
        {
          error: "Validation error",
          message: "fileStoreId is required when mode is 'web+files'",
        },
        { status: 400 }
      );
    }

    // Create Gemini client and start research
    const client = createGeminiClient(apiKey);

    const eventGenerator = client.createResearchStream({
      topic: topic.trim(),
      mode,
      fileStoreId,
      previousInteractionId,
    });

    // Create SSE stream
    const stream = createSSEStream(eventGenerator);

    // Return SSE response
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no", // Disable nginx buffering
      },
    });
  } catch (error) {
    console.error("Research API error:", error);

    // Check if we can still send an SSE error
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";

    // For errors that occur before streaming starts, return JSON
    return NextResponse.json(
      { error: "Server error", message: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/research
 *
 * Handle CORS preflight requests.
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, X-Gemini-API-Key, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

/**
 * GET /api/research
 *
 * Returns API documentation.
 */
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/research",
    method: "POST",
    description: "Start a new deep research interaction with SSE streaming",
    request: {
      headers: {
        "Content-Type": "application/json",
        "X-Gemini-API-Key": "Your Gemini API key (optional if GEMINI_API_KEY env var is set)",
      },
      body: {
        topic: {
          type: "string",
          required: true,
          description: "The research topic or question",
        },
        mode: {
          type: "string",
          required: true,
          enum: ["web", "web+files"],
          description: "Research mode - web only or web + proprietary files",
        },
        fileStoreId: {
          type: "string",
          required: false,
          description: "File store ID (required when mode is 'web+files')",
        },
        previousInteractionId: {
          type: "string",
          required: false,
          description: "Previous interaction ID for follow-up questions",
        },
      },
    },
    response: {
      type: "text/event-stream",
      events: {
        start: {
          type: "start",
          interactionId: "string",
          timestamp: "number",
        },
        thinking: {
          type: "thinking",
          summary: "string",
          timestamp: "number",
        },
        status: {
          type: "status",
          status: "starting | in_progress | completed | failed | cancelled",
          timestamp: "number",
        },
        progress: {
          type: "progress",
          sources: "number (optional)",
          tokens: "number (optional)",
          timestamp: "number",
        },
        content: {
          type: "content",
          text: "string",
          timestamp: "number",
        },
        complete: {
          type: "complete",
          finalText: "string (optional)",
          timestamp: "number",
        },
        error: {
          type: "error",
          message: "string",
          code: "string (optional)",
          timestamp: "number",
        },
      },
    },
    example: {
      request: {
        topic: "What are the latest developments in quantum computing?",
        mode: "web",
      },
      curl: `curl -X POST http://localhost:3000/api/research \\
  -H "Content-Type: application/json" \\
  -H "X-Gemini-API-Key: your-api-key" \\
  -d '{"topic": "What are the latest developments in quantum computing?", "mode": "web"}'`,
    },
  });
}
