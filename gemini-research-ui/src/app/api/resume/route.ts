/**
 * Resume Research API Route
 *
 * POST: Resume or check status of a previous research interaction.
 *
 * Request body:
 * - interactionId: string - The ID of the interaction to resume
 *
 * Response: Server-Sent Events stream with research progress and results.
 * Handles both in-progress and completed interactions.
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createGeminiClient,
  createSSEStream,
  type ErrorEvent,
} from "@/lib/gemini";

// =============================================================================
// TYPES
// =============================================================================

interface ResumeRequestBody {
  interactionId: string;
}

// =============================================================================
// VALIDATION
// =============================================================================

function validateRequestBody(body: unknown): body is ResumeRequestBody {
  if (!body || typeof body !== "object") {
    return false;
  }

  const { interactionId } = body as Record<string, unknown>;

  if (typeof interactionId !== "string" || interactionId.trim().length === 0) {
    return false;
  }

  return true;
}

function getValidationError(body: unknown): string {
  if (!body || typeof body !== "object") {
    return "Request body must be a JSON object";
  }

  const { interactionId } = body as Record<string, unknown>;

  if (typeof interactionId !== "string" || interactionId.trim().length === 0) {
    return "interactionId is required and must be a non-empty string";
  }

  return "Invalid request body";
}

// =============================================================================
// ROUTE HANDLERS
// =============================================================================

/**
 * POST /api/resume
 *
 * Resumes a previous research interaction and streams results via SSE.
 * Works for both in-progress and completed interactions.
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

    const { interactionId } = body;

    // Create Gemini client and resume interaction
    const client = createGeminiClient(apiKey);

    const eventGenerator = client.resumeResearchStream(interactionId.trim());

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
    console.error("Resume API error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";

    return NextResponse.json(
      { error: "Server error", message: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/resume
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
 * GET /api/resume
 *
 * Returns API documentation.
 */
export async function GET() {
  return NextResponse.json({
    endpoint: "/api/resume",
    method: "POST",
    description: "Resume or check status of a previous research interaction",
    request: {
      headers: {
        "Content-Type": "application/json",
        "X-Gemini-API-Key": "Your Gemini API key (optional if GEMINI_API_KEY env var is set)",
      },
      body: {
        interactionId: {
          type: "string",
          required: true,
          description: "The ID of the interaction to resume (e.g., v1_ChdjX3...)",
        },
      },
    },
    response: {
      type: "text/event-stream",
      description: "Same SSE stream format as /api/research",
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
    behavior: {
      completed: "For completed interactions, immediately streams the final content and emits complete event",
      in_progress: "For in-progress interactions, attempts to reconnect to the stream and continue receiving events",
      failed: "For failed interactions, emits an error event with the failure reason",
    },
    example: {
      request: {
        interactionId: "v1_ChdjX3RPYWJPMUJMQ1h2ZElQMWVyUDhRRRIX...",
      },
      curl: `curl -X POST http://localhost:3000/api/resume \\
  -H "Content-Type: application/json" \\
  -H "X-Gemini-API-Key: your-api-key" \\
  -d '{"interactionId": "v1_ChdjX3RPYWJPMUJMQ1h2ZElQMWVyUDhRRRIX..."}'`,
    },
  });
}
