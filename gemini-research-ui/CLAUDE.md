# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gemini Deep Research UI - A modern web interface for conducting deep research using Google's Gemini API. Features stunning visual effects inspired by Aceternity UI and Magic UI.

## Development Commands

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Start production server
bun run start

# Lint code
bun run lint
```

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Styling:** Tailwind CSS 4 + Custom Aceternity/Magic UI components
- **State:** Zustand v5
- **Database:** IndexedDB via Dexie v4
- **API:** Next.js Route Handlers with Server-Sent Events
- **SDK:** @google/genai for Gemini Deep Research API

## Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (SSE streaming)
│   │   ├── research/      # Start research with streaming
│   │   ├── resume/        # Resume research session
│   │   └── stores/        # File store management
│   ├── history/           # Research history page
│   ├── settings/          # Settings page
│   └── research/[id]/     # Dynamic research view
├── components/
│   ├── ui/                # Aceternity/Magic UI style components
│   │   ├── aurora-background.tsx
│   │   ├── spotlight.tsx
│   │   ├── animated-gradient-text.tsx
│   │   ├── shiny-button.tsx
│   │   ├── text-generate-effect.tsx
│   │   ├── number-ticker.tsx
│   │   └── meteors.tsx
│   ├── research/          # Research-specific components
│   │   ├── ResearchInput.tsx
│   │   ├── StreamingProgress.tsx
│   │   ├── LivePreview.tsx
│   │   ├── ResearchReport.tsx
│   │   ├── FollowUpChat.tsx
│   │   └── CompletedResearchView.tsx
│   ├── history/           # History page components
│   └── settings/          # Settings page components
├── lib/
│   ├── gemini.ts          # Gemini API client wrapper
│   ├── db.ts              # Dexie IndexedDB schema
│   ├── store.ts           # Zustand global store
│   └── utils.ts           # cn() and helpers
├── hooks/
│   ├── useResearch.ts     # Research operations hook
│   ├── useHistory.ts      # History with live queries
│   ├── useSettings.ts     # Settings persistence
│   └── useSSE.ts          # Server-Sent Events hook
└── types/
    └── index.ts           # Shared TypeScript types
```

## Key Patterns

### Streaming Research with SSE
The research API uses Server-Sent Events for real-time streaming:
```typescript
// API Route sends events
const stream = createSSEStream(async (send) => {
  for await (const event of client.createResearchStream(topic)) {
    send(event);
  }
});

// Client consumes with useSSE hook
const { connect } = useResearchSSE({
  url: '/api/research',
  body: { topic, mode },
  onContent: (text) => appendContent(text),
});
```

### IndexedDB with Live Queries
Uses Dexie's `useLiveQuery` for reactive data:
```typescript
const researches = useLiveQuery(
  () => db.researches.orderBy('createdAt').reverse().toArray()
);
```

### Zustand Store
Global state for streaming and UI:
```typescript
const { isStreaming, streamingContent, appendStreamingContent } = useStore();
```

## Design System

- **Background:** `#0a0a0f` (near black with blue undertone)
- **Cards:** `#12121a` with `backdrop-blur-xl`
- **Accent Gradient:** `#8b5cf6` (violet) → `#06b6d4` (cyan)
- **Animations:** Framer Motion throughout
- **Effects:** Aurora background, spotlights, meteors, particles

## Environment Variables

```bash
# Optional - can also be set in UI settings
GEMINI_API_KEY=your_api_key_here
```

The API key can be:
1. Set in environment variable
2. Sent via `X-Gemini-API-Key` header
3. Configured in Settings page (stored in IndexedDB)
