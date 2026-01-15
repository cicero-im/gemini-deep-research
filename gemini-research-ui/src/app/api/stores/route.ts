/**
 * File Search Stores API Route
 *
 * GET: List all file search stores
 * POST: Create a new file search store
 * DELETE: Delete a file search store
 *
 * These endpoints manage the file search stores used for web+files research mode.
 */

import { NextRequest, NextResponse } from "next/server";
import { createGeminiClient, type FileSearchStore } from "@/lib/gemini";

// =============================================================================
// TYPES
// =============================================================================

interface CreateStoreRequestBody {
  name: string;
  displayName?: string;
}

interface DeleteStoreRequestBody {
  storeName: string;
}

interface ListStoresResponse {
  stores: FileSearchStore[];
  count: number;
}

interface CreateStoreResponse {
  store: FileSearchStore;
  message: string;
}

interface DeleteStoreResponse {
  success: boolean;
  message: string;
}

interface ErrorResponse {
  error: string;
  message: string;
}

// =============================================================================
// VALIDATION
// =============================================================================

function validateCreateBody(body: unknown): body is CreateStoreRequestBody {
  if (!body || typeof body !== "object") {
    return false;
  }

  const { name } = body as Record<string, unknown>;

  if (typeof name !== "string" || name.trim().length === 0) {
    return false;
  }

  return true;
}

function validateDeleteBody(body: unknown): body is DeleteStoreRequestBody {
  if (!body || typeof body !== "object") {
    return false;
  }

  const { storeName } = body as Record<string, unknown>;

  if (typeof storeName !== "string" || storeName.trim().length === 0) {
    return false;
  }

  return true;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getApiKey(request: NextRequest): string | null {
  return (
    request.headers.get("X-Gemini-API-Key") ??
    request.headers.get("Authorization")?.replace("Bearer ", "") ??
    process.env.GEMINI_API_KEY ??
    null
  );
}

function unauthorizedResponse(): NextResponse<ErrorResponse> {
  return NextResponse.json(
    {
      error: "API key required",
      message:
        "Provide API key via X-Gemini-API-Key header, Authorization header, or GEMINI_API_KEY environment variable",
    },
    { status: 401 }
  );
}

// =============================================================================
// ROUTE HANDLERS
// =============================================================================

/**
 * GET /api/stores
 *
 * Lists all file search stores.
 */
export async function GET(request: NextRequest): Promise<NextResponse<ListStoresResponse | ErrorResponse>> {
  try {
    const apiKey = getApiKey(request);

    if (!apiKey) {
      return unauthorizedResponse();
    }

    const client = createGeminiClient(apiKey);
    const stores = await client.listFileSearchStores();

    return NextResponse.json({
      stores,
      count: stores.length,
    });
  } catch (error) {
    console.error("List stores error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to list file search stores";

    return NextResponse.json(
      { error: "Server error", message: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * POST /api/stores
 *
 * Creates a new file search store.
 */
export async function POST(request: NextRequest): Promise<NextResponse<CreateStoreResponse | ErrorResponse>> {
  try {
    const apiKey = getApiKey(request);

    if (!apiKey) {
      return unauthorizedResponse();
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
    if (!validateCreateBody(body)) {
      return NextResponse.json(
        {
          error: "Validation error",
          message: "name is required and must be a non-empty string",
        },
        { status: 400 }
      );
    }

    const { name, displayName } = body;
    const storeDisplayName = displayName ?? name;

    const client = createGeminiClient(apiKey);
    const store = await client.createFileSearchStore(storeDisplayName.trim());

    return NextResponse.json(
      {
        store,
        message: `File search store '${storeDisplayName}' created successfully`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create store error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to create file search store";

    return NextResponse.json(
      { error: "Server error", message: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/stores
 *
 * Deletes a file search store.
 */
export async function DELETE(request: NextRequest): Promise<NextResponse<DeleteStoreResponse | ErrorResponse>> {
  try {
    const apiKey = getApiKey(request);

    if (!apiKey) {
      return unauthorizedResponse();
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
    if (!validateDeleteBody(body)) {
      return NextResponse.json(
        {
          error: "Validation error",
          message: "storeName is required and must be a non-empty string",
        },
        { status: 400 }
      );
    }

    const { storeName } = body;

    const client = createGeminiClient(apiKey);
    await client.deleteFileSearchStore(storeName.trim());

    return NextResponse.json({
      success: true,
      message: `File search store '${storeName}' deleted successfully`,
    });
  } catch (error) {
    console.error("Delete store error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to delete file search store";

    return NextResponse.json(
      { error: "Server error", message: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/stores
 *
 * Handle CORS preflight requests.
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, X-Gemini-API-Key, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
