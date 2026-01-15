# Gemini Deep Research

A comprehensive research toolkit powered by Google's Gemini Deep Research API (`deep-research-pro-preview-12-2025`). Includes both a Python CLI for quick terminal-based research and a stunning Next.js web interface for immersive research experiences.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.10+-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)

## Features

### Core Capabilities
- **Deep Web Research**: Comprehensive research using Google's grounding search and analysis
- **File Search Integration**: Combine web research with your own document stores
- **Real-time Streaming**: Watch research unfold with live progress updates and thinking summaries
- **Follow-up Conversations**: Continue discussions with context from completed research
- **Session Resume**: Pick up where you left off using interaction IDs

### CLI (`deep_research.py`)
- Interactive terminal interface with colored output
- Three research modes: Web-only, Web+Files, Resume
- Real-time progress streaming with thought summaries
- Automatic markdown report generation
- Follow-up chat after research completion

### Web UI (`gemini-research-ui/`)
- Modern dark theme with stunning visual effects (Aurora backgrounds, Spotlights, Meteors)
- Real-time streaming with animated progress indicators
- Interactive citation system with hover tooltips showing:
  - Page title and description
  - Favicon
  - Resolved URLs (not Google redirect URLs)
- Research history with search and filtering
- Content recovery for interrupted sessions
- Responsive design for desktop and mobile

## Screenshots

*Web UI showing research in progress with citation tooltips*

## Quick Start

### Prerequisites
- Python 3.10+ (for CLI)
- Node.js 18+ or Bun (for Web UI)
- Google AI API Key with Gemini access

### CLI Installation

```bash
# Clone the repository
git clone https://github.com/silver-gr/gemini-deep-research.git
cd gemini-deep-research

# Create virtual environment (recommended)
python -m venv ~/.venv
source ~/.venv/bin/activate  # or `~/.venv/Scripts/activate` on Windows

# Install dependencies
pip install -r requirements.txt

# Set your API key
export GEMINI_API_KEY="your-api-key-here"

# Run the CLI
./deep_research.py
# or: python deep_research.py
```

### Web UI Installation

```bash
cd gemini-research-ui

# Install dependencies (using bun - recommended)
bun install
# or: npm install

# Start development server
bun run dev
# or: npm run dev

# Open http://localhost:3000
```

## Usage

### CLI Modes

```
╭─────────────────────────────────────────────────╮
│         Gemini Deep Research Agent              │
╰─────────────────────────────────────────────────╯

Select research mode:
  [A] Web Only - Internet search only
  [B] Web + Files - Internet + uploaded documents
  [C] Resume - Continue previous research session
```

**Example Session:**
```bash
$ ./deep_research.py

Select mode: A

Enter your research topic:
> Compare Essentialism by Greg McKeown with Digital Minimalism by Cal Newport

[Starting research...]
📊 Analyzing sources...
💭 Thinking: Identifying key themes and philosophical foundations...
💭 Thinking: Comparing core principles of selective focus...
📝 Generating final report...

[Research complete! Saved to: essentialism_vs_digital_minimalism_20260115_033000.md]

Continue with follow-up questions? (y/n): y
> What are the practical action steps from both books?
```

### Web UI Features

1. **Start Research**: Enter your topic and select mode (Web or Web+Files)
2. **Watch Progress**: See real-time thinking summaries and source counts
3. **Interactive Citations**: Hover over citation badges (e.g., `[1]`) to see source details
4. **Follow-up Chat**: Ask questions about the completed research
5. **History**: Browse, search, and revisit past research sessions

## Architecture

### CLI Structure
```
deep_research.py          # Single-file CLI application (545 lines)
├── File Search Store Management (CRUD operations)
├── Deep Research Interaction (Streaming execution)
├── Resume/Continue (Session recovery)
└── Follow-up Chat (Contextual conversations)
```

### Web UI Structure
```
gemini-research-ui/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes with SSE streaming
│   │   │   ├── research/      # Start new research
│   │   │   ├── resume/        # Resume sessions
│   │   │   ├── resolve-citation/  # URL resolution
│   │   │   └── stores/        # File store management
│   │   ├── history/           # Research history page
│   │   ├── settings/          # Settings page
│   │   └── research/[id]/     # Dynamic research view
│   ├── components/
│   │   ├── ui/                # Aceternity/Magic UI components
│   │   │   ├── aurora-background.tsx
│   │   │   ├── spotlight.tsx
│   │   │   ├── animated-gradient-text.tsx
│   │   │   └── ...
│   │   └── research/          # Research-specific components
│   │       ├── Citation.tsx       # Interactive citations with tooltips
│   │       ├── LivePreview.tsx    # Streaming markdown viewer
│   │       ├── ResearchInput.tsx  # Topic input with mode selection
│   │       └── ...
│   ├── lib/
│   │   ├── gemini.ts          # Gemini API client wrapper
│   │   ├── citations.ts       # Citation parsing utilities
│   │   ├── db.ts              # IndexedDB with Dexie
│   │   └── store.ts           # Zustand state management
│   ├── hooks/                 # Custom React hooks
│   └── types/                 # TypeScript definitions
├── 60 TypeScript files
└── 14,239 lines of code
```

### Tech Stack

| Layer | CLI | Web UI |
|-------|-----|--------|
| Runtime | Python 3.10+ | Node.js 18+ / Bun |
| Framework | - | Next.js 16 (App Router) |
| UI | Rich (terminal) | React 19 + Tailwind CSS 4 |
| State | - | Zustand v5 |
| Storage | Filesystem | IndexedDB (Dexie v4) |
| API | google-genai SDK | @google/genai + SSE |
| Effects | - | Framer Motion + Aceternity UI |

## Citation System

The Web UI includes a sophisticated citation system that:

1. **Parses Citations**: Detects `[cite: x]` or `[CITE:x,y]` patterns in Gemini output
2. **Extracts URLs**: Parses Markdown link format from grounding sources
3. **Resolves Redirects**: Follows Google's grounding API redirects to actual URLs
4. **Fetches Metadata**: Retrieves page title, description, and favicon
5. **Renders Tooltips**: Shows interactive tooltips on hover with source details

```typescript
// Example citation parsing
"[cite: 1, 2]" → ["1", "2"] → urlMap["1"], urlMap["2"]
"38. [reddit.com](https://vertexaisearch...)" → resolved to actual reddit.com URL
```

## Environment Variables

```bash
# Required
GEMINI_API_KEY=your_api_key_here

# Optional (Web UI)
# API key can also be set in Settings page (stored in IndexedDB)
```

## Output Files

Research reports are saved as markdown files:
- CLI: `{topic}_{timestamp}.md` in project directory
- Web UI: Stored in IndexedDB, exportable as markdown

## Development Notes

### Build Statistics

| Metric | Value |
|--------|-------|
| **CLI** | 545 lines, single Python file |
| **Web UI** | 60 TypeScript files, 14,239 lines |
| **Session Duration** | ~3 hours (02:31 - 05:30 GMT+2) |

### AI-Assisted Development

This project's Web UI was built entirely with [Claude Code](https://claude.ai/code) (Anthropic's AI coding assistant) in a single session.

**Token Usage (from Claude Code session logs):**

| Metric | Value |
|--------|-------|
| Input Tokens | 49,132 |
| Output Tokens | 124,221 |
| Cache Read Tokens | 74,551,484 |
| Cache Create Tokens | 4,561,037 |
| **Total Tokens** | **~79.3M** |

**Cost Breakdown (Claude Opus 4.5 API Pricing):**

| Token Type | Rate | Amount | Cost |
|------------|------|--------|------|
| Input | $15/MTok | 49,132 | $0.74 |
| Output | $75/MTok | 124,221 | $9.32 |
| Cache Read | $1.50/MTok | 74,551,484 | $111.83 |
| Cache Create | $18.75/MTok | 4,561,037 | $85.52 |
| **Total** | | | **~$207** |

*Note: Cache tokens dominate costs due to Claude Code's long-context management. Actual Claude Code subscription pricing may differ from API token pricing.*

### Key Implementation Challenges

1. **Citation URL Resolution**: Gemini returns grounding URLs as `vertexaisearch.cloud.google.com` redirects that need to be resolved to actual source URLs.

2. **Markdown Link Parsing**: The grounding sources are formatted as Markdown links `[domain](url)`, not raw URLs, requiring custom regex patterns.

3. **Portal-based Tooltips**: Citation tooltips required React Portals to escape overflow constraints and z-index stacking contexts.

4. **SSE Streaming**: Next.js route handlers with proper Server-Sent Events for real-time research progress.

## API Reference

### Gemini Deep Research Model

```typescript
const DEEP_RESEARCH_MODEL = "deep-research-pro-preview-12-2025";

// Research configuration
interface ResearchConfig {
  topic: string;
  mode: "web" | "web+files";
  fileStoreId?: string;
  previousInteractionId?: string;
}
```

### Stream Events

| Event Type | Description |
|------------|-------------|
| `start` | Research initiated, includes interactionId |
| `thinking` | Thinking summary during research |
| `status` | Status changes (in_progress, completed, etc.) |
| `progress` | Source count and token usage updates |
| `content` | Incremental text content |
| `complete` | Research finished, includes final text |
| `error` | Error occurred |

## Roadmap

### Planned Features

| Priority | Feature | Description | Status |
|----------|---------|-------------|--------|
| High | Export to PDF | Export research reports as formatted PDFs | Planned |
| High | Multi-language Support | UI translations (Greek, Spanish, etc.) | Planned |
| High | Research Templates | Pre-defined prompts for common research types | Planned |
| Medium | Collaborative Research | Share and collaborate on research sessions | Planned |
| Medium | Custom Themes | Light mode and custom color schemes | Planned |
| Medium | Keyboard Shortcuts | Power user navigation and actions | Planned |
| Medium | Research Comparison | Side-by-side comparison of multiple sessions | Planned |
| Low | Browser Extension | Quick research from any webpage | Planned |
| Low | Mobile App | React Native app for iOS/Android | Planned |
| Low | API Endpoints | REST API for programmatic access | Planned |

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Jan 2026 | Initial release with CLI and Web UI |

### Future Improvements

**Web UI Enhancements:**
- [ ] Offline support with service workers
- [ ] Research tags and categories
- [ ] Advanced search with filters
- [ ] Citation export (BibTeX, APA, MLA)
- [ ] Voice input for research topics

**CLI Enhancements:**
- [ ] Config file support (~/.gemini-research.yaml)
- [ ] Batch research mode
- [ ] Output format options (JSON, HTML)
- [ ] Integration with Obsidian/Notion

**Infrastructure:**
- [ ] Docker containerization
- [ ] Self-hosted deployment guide
- [ ] Rate limiting and caching
- [ ] Analytics dashboard

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - See [LICENSE](LICENSE) for details.

## Acknowledgments

- [Google Gemini](https://deepmind.google/technologies/gemini/) for the Deep Research API
- [Aceternity UI](https://ui.aceternity.com/) for stunning UI components
- [Claude Code](https://claude.ai/code) for AI-assisted development
- The open-source community for inspiration

---

Built with AI assistance in a single coding session.
