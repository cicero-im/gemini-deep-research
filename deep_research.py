#!/Users/silver/.venv/bin/python3
"""
Gemini Deep Research Agent
Interactive CLI for conducting deep research with Google's Gemini API.
Supports web-only research or web + proprietary file search.
Streams progress in real-time, saves reports as markdown, and enables follow-up conversations.
"""

import os
import re
import sys
from datetime import datetime
from pathlib import Path

from google import genai

# Configuration
API_KEY = "AIzaSyD9XMBhyC3HJCnc5PATTmZC22-3KkYTMM8"
AGENT_MODEL = "deep-research-pro-preview-12-2025"
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))


def sanitize_filename(text: str, max_length: int = 50) -> str:
    """Convert text to a safe filename."""
    cleaned = re.sub(r'[^\w\s-]', '', text)
    cleaned = re.sub(r'\s+', '_', cleaned)
    return cleaned[:max_length].strip('_')


# =============================================================================
# FILE SEARCH STORE MANAGEMENT
# =============================================================================

def list_file_search_stores(client: genai.Client) -> list:
    """List all existing file search stores."""
    try:
        stores = list(client.file_search_stores.list())
        return stores
    except Exception as e:
        print(f"Error listing stores: {e}")
        return []


def create_file_search_store(client: genai.Client, name: str) -> str:
    """Create a new file search store and return its name."""
    try:
        store = client.file_search_stores.create(
            config={'display_name': name}
        )
        print(f"Created store: {store.name}")
        return store.name
    except Exception as e:
        print(f"Error creating store: {e}")
        return None


def upload_file_to_store(client: genai.Client, store_name: str, file_path: str) -> bool:
    """Upload a file to a file search store."""
    try:
        path = Path(file_path).expanduser().resolve()
        if not path.exists():
            print(f"File not found: {path}")
            return False

        print(f"Uploading {path.name}...")
        operation = client.file_search_stores.upload_to_file_search_store(
            file=str(path),
            file_search_store_name=store_name,
            config={'display_name': path.name}
        )
        print(f"Uploaded: {path.name}")
        return True
    except Exception as e:
        print(f"Error uploading file: {e}")
        return False


def manage_file_search_store(client: genai.Client) -> str:
    """Interactive file search store management. Returns selected store name."""
    print("\n" + "-"*60)
    print("FILE SEARCH STORE MANAGEMENT")
    print("-"*60)

    while True:
        print("\nOptions:")
        print("  [1] List existing stores")
        print("  [2] Create new store")
        print("  [3] Select store and upload files")
        print("  [4] Select existing store (no upload)")
        print("  [0] Cancel and go back")

        choice = input("\nChoice: ").strip()

        if choice == "0":
            return None

        elif choice == "1":
            stores = list_file_search_stores(client)
            if stores:
                print("\nExisting stores:")
                for i, store in enumerate(stores, 1):
                    display = getattr(store, 'display_name', 'unnamed')
                    print(f"  {i}. {store.name} ({display})")
            else:
                print("\nNo stores found.")

        elif choice == "2":
            name = input("Store display name: ").strip()
            if name:
                store_name = create_file_search_store(client, name)
                if store_name:
                    print(f"\nStore created: {store_name}")

        elif choice == "3":
            stores = list_file_search_stores(client)
            if not stores:
                print("\nNo stores found. Create one first.")
                continue

            print("\nSelect a store:")
            for i, store in enumerate(stores, 1):
                display = getattr(store, 'display_name', 'unnamed')
                print(f"  {i}. {store.name} ({display})")

            try:
                idx = int(input("\nStore number: ").strip()) - 1
                if 0 <= idx < len(stores):
                    selected_store = stores[idx].name
                    print(f"\nSelected: {selected_store}")

                    # Upload files
                    print("\nEnter file paths to upload (one per line, empty line to finish):")
                    while True:
                        file_path = input("File: ").strip()
                        if not file_path:
                            break
                        upload_file_to_store(client, selected_store, file_path)

                    return selected_store
                else:
                    print("Invalid selection.")
            except ValueError:
                print("Invalid input.")

        elif choice == "4":
            stores = list_file_search_stores(client)
            if not stores:
                print("\nNo stores found. Create one first.")
                continue

            print("\nSelect a store:")
            for i, store in enumerate(stores, 1):
                display = getattr(store, 'display_name', 'unnamed')
                print(f"  {i}. {store.name} ({display})")

            try:
                idx = int(input("\nStore number: ").strip()) - 1
                if 0 <= idx < len(stores):
                    return stores[idx].name
                else:
                    print("Invalid selection.")
            except ValueError:
                print("Invalid input.")

    return None


# =============================================================================
# DEEP RESEARCH INTERACTION
# =============================================================================

def stream_interaction(client: genai.Client, prompt: str, previous_id: str = None,
                       file_search_store: str = None) -> tuple[str, str]:
    """
    Run a deep research interaction with streaming.
    Returns (final_text, interaction_id).
    """
    mode_label = "Web + Files" if file_search_store else "Web Only"
    print("\n" + "="*60)
    print(f"Starting Deep Research ({mode_label})...")
    print("="*60 + "\n")

    kwargs = {
        "input": prompt,
        "agent": AGENT_MODEL,
        "background": True,
        "stream": True,
        "agent_config": {"type": "deep-research", "thinking_summaries": "auto"}
    }

    if previous_id:
        kwargs["previous_interaction_id"] = previous_id

    # Add file search tool if store is specified
    if file_search_store:
        kwargs["tools"] = [{
            "type": "file_search",
            "file_search_store_names": [file_search_store]
        }]

    stream = client.interactions.create(**kwargs)

    interaction_id = None
    final_text = ""
    current_section = None
    debug_mode = os.environ.get("DEBUG", "").lower() in ("1", "true", "yes")

    try:
        for chunk in stream:
            event_type = getattr(chunk, 'event_type', None)

            if debug_mode:
                print(f"\n[DEBUG] Event: {event_type}", flush=True)
                print(f"[DEBUG] Chunk attrs: {[a for a in dir(chunk) if not a.startswith('_')]}", flush=True)

            if event_type == "interaction.start":
                interaction_id = chunk.interaction.id
                print(f"[Research ID: {interaction_id}]\n")

            elif event_type == "content.delta":
                if hasattr(chunk, 'delta'):
                    delta = chunk.delta
                    if debug_mode:
                        print(f"[DEBUG] Delta attrs: {[a for a in dir(delta) if not a.startswith('_')]}", flush=True)

                    delta_type = getattr(delta, 'type', None)

                    # Handle text content (final report)
                    if delta_type == "text":
                        # Text might be in delta.text or delta.content.text
                        text = getattr(delta, 'text', None)
                        if text is None and hasattr(delta, 'content'):
                            text = getattr(delta.content, 'text', "")
                        text = text or ""
                        print(text, end="", flush=True)
                        final_text += text

                    # Handle thought summaries (research progress)
                    elif delta_type == "thought_summary":
                        content = getattr(delta, 'content', None)
                        if content:
                            summary = getattr(content, 'text', str(content))
                        else:
                            summary = str(delta)
                        print(f"\n[Thinking: {summary}]\n", flush=True)

                    elif debug_mode:
                        print(f"[DEBUG] Unknown delta type: {delta_type}, delta: {delta}", flush=True)

            elif event_type == "interaction.status":
                if hasattr(chunk, 'interaction'):
                    status = getattr(chunk.interaction, 'status', 'unknown')
                    if status != current_section:
                        current_section = status
                        print(f"\n[Status: {status}]\n", flush=True)

            elif event_type == "interaction.complete":
                interaction = getattr(chunk, 'interaction', None)
                if interaction:
                    outputs = getattr(interaction, 'outputs', [])
                    if outputs and not final_text:
                        final_text = getattr(outputs[-1], 'text', "")
                    # Check for errors
                    error = getattr(interaction, 'error', None)
                    if error:
                        print(f"\n[ERROR: {error}]\n", flush=True)
                print("\n\n" + "="*60)
                print("Research Complete!")
                print("="*60)

            elif event_type == "interaction.failed" or event_type == "error":
                error = getattr(chunk, 'error', getattr(chunk, 'message', 'Unknown error'))
                print(f"\n[RESEARCH FAILED: {error}]\n", flush=True)
                if hasattr(chunk, 'interaction'):
                    err_detail = getattr(chunk.interaction, 'error', None)
                    if err_detail:
                        print(f"[Error detail: {err_detail}]", flush=True)

            elif debug_mode and event_type:
                print(f"[DEBUG] Unhandled event type: {event_type}", flush=True)

    except KeyboardInterrupt:
        print("\n\n[Research interrupted by user]")
        return final_text, interaction_id
    except Exception as e:
        print(f"\n[ERROR during streaming: {e}]", flush=True)
        import traceback
        traceback.print_exc()

    return final_text, interaction_id


def save_report(content: str, topic: str, mode: str = "web") -> str:
    """Save the research report as a markdown file."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_topic = sanitize_filename(topic)
    filename = f"{safe_topic}_{timestamp}.md"
    filepath = os.path.join(SCRIPT_DIR, filename)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(f"# Deep Research Report\n\n")
        f.write(f"**Topic:** {topic}\n\n")
        f.write(f"**Mode:** {mode}\n\n")
        f.write(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write("---\n\n")
        f.write(content)

    return filepath


def follow_up_chat(client: genai.Client, interaction_id: str, file_search_store: str = None):
    """Enter follow-up conversation mode."""
    print("\n" + "-"*60)
    print("FOLLOW-UP MODE")
    print("Ask follow-up questions about the research.")
    print("Type 'exit' or 'quit' to end the session.")
    print("-"*60 + "\n")

    current_id = interaction_id

    while True:
        try:
            question = input("\nYou: ").strip()

            if not question:
                continue

            if question.lower() in ('exit', 'quit', 'q'):
                print("\nEnding follow-up session. Goodbye!")
                break

            print("\nResearching follow-up...")
            response_text, new_id = stream_interaction(
                client, question, current_id, file_search_store
            )

            if new_id:
                current_id = new_id

        except KeyboardInterrupt:
            print("\n\nEnding follow-up session. Goodbye!")
            break
        except EOFError:
            print("\n\nEnding follow-up session. Goodbye!")
            break


# =============================================================================
# RESUME/CONTINUE SESSION
# =============================================================================

def resume_research(client: genai.Client):
    """Resume or check status of a previous research session."""
    print("\n" + "-"*60)
    print("RESUME RESEARCH SESSION")
    print("-"*60)
    print("\nEnter the Research/Interaction ID:")
    print("(e.g., v1_ChdjX3RPYWJPMUJMQ1h2ZElQMWVyUDhRRRIX...)\n")

    interaction_id = input("ID: ").strip()
    if not interaction_id:
        print("No ID provided.")
        return

    print(f"\nFetching interaction: {interaction_id}...")

    try:
        # Try to get the interaction status
        interaction = client.interactions.get(interaction_id)

        status = getattr(interaction, 'status', 'unknown')
        print(f"[Status: {status}]")

        if status == "completed":
            # Get the outputs
            outputs = getattr(interaction, 'outputs', [])
            if outputs:
                final_text = ""
                for output in outputs:
                    text = getattr(output, 'text', None)
                    if text:
                        final_text += text

                if final_text:
                    print("\n" + "="*60)
                    print("RESEARCH RESULTS")
                    print("="*60 + "\n")
                    print(final_text)

                    # Save the report
                    topic = f"resumed_{interaction_id[:20]}"
                    filepath = save_report(final_text, topic, "Resumed")
                    print(f"\n[Report saved to: {filepath}]")

                    # Enter follow-up mode
                    follow_up_chat(client, interaction_id)
                else:
                    print("\nNo text content found in outputs.")
            else:
                print("\nNo outputs found for this interaction.")

        elif status == "in_progress":
            print("\nResearch is still in progress. Attempting to reconnect to stream...")

            # Try to reconnect to the stream
            try:
                stream = client.interactions.get(
                    id=interaction_id,
                    stream=True
                )

                final_text = ""
                for chunk in stream:
                    event_type = getattr(chunk, 'event_type', None)

                    if event_type == "content.delta":
                        delta = getattr(chunk, 'delta', None)
                        if delta:
                            delta_type = getattr(delta, 'type', None)
                            if delta_type == "text":
                                text = getattr(delta, 'text', None)
                                if text is None and hasattr(delta, 'content'):
                                    text = getattr(delta.content, 'text', "")
                                text = text or ""
                                print(text, end="", flush=True)
                                final_text += text
                            elif delta_type == "thought_summary":
                                content = getattr(delta, 'content', None)
                                if content:
                                    summary = getattr(content, 'text', str(content))
                                else:
                                    summary = str(delta)
                                print(f"\n[Thinking: {summary}]\n", flush=True)

                    elif event_type == "interaction.complete":
                        print("\n\n" + "="*60)
                        print("Research Complete!")
                        print("="*60)

                    elif event_type == "error":
                        error = getattr(chunk, 'error', 'Unknown error')
                        print(f"\n[ERROR: {error}]", flush=True)

                if final_text:
                    topic = f"resumed_{interaction_id[:20]}"
                    filepath = save_report(final_text, topic, "Resumed")
                    print(f"\n[Report saved to: {filepath}]")
                    follow_up_chat(client, interaction_id)

            except Exception as e:
                print(f"\nCouldn't reconnect to stream: {e}")
                print("The research may still be running. Try again later.")

        elif status == "failed":
            error = getattr(interaction, 'error', 'Unknown error')
            print(f"\nResearch failed: {error}")

        else:
            print(f"\nUnexpected status: {status}")
            # Try to show any available info
            print(f"Interaction details: {interaction}")

    except Exception as e:
        print(f"\nError fetching interaction: {e}")
        print("\nThe ID might be invalid or expired.")


# =============================================================================
# MAIN ENTRY POINT
# =============================================================================

def main():
    """Main entry point."""
    print("\n" + "="*60)
    print("  GEMINI DEEP RESEARCH AGENT")
    print("  Powered by deep-research-pro-preview-12-2025")
    print("="*60 + "\n")

    # Initialize client
    client = genai.Client(api_key=API_KEY)

    # Mode selection
    print("Select research mode:")
    print("  [A] Web Only (default) - Search the internet")
    print("  [B] Web + Files - Search internet + your proprietary documents")
    print("  [C] Continue/Resume - Resume a previous research session")
    print()

    mode_choice = input("Mode [A/B/C]: ").strip().upper()

    # Handle resume mode
    if mode_choice == "C":
        resume_research(client)
        return

    file_search_store = None
    mode_label = "Web Only"

    if mode_choice == "B":
        mode_label = "Web + Files"
        file_search_store = manage_file_search_store(client)
        if not file_search_store:
            print("\nNo store selected. Falling back to Web Only mode.")
            mode_label = "Web Only"

    # Get research prompt
    print(f"\n[Mode: {mode_label}]")
    print("\nEnter your research topic/question:")
    print("(Press Ctrl+D to submit, or Ctrl+C to cancel)\n")

    lines = []
    try:
        while True:
            line = input()
            lines.append(line)
    except EOFError:
        # Ctrl+D pressed - submit the input
        pass
    except KeyboardInterrupt:
        print("\nCancelled.")
        sys.exit(0)

    prompt = "\n".join(lines).strip()

    if not prompt:
        print("No prompt provided. Exiting.")
        sys.exit(1)

    # Run deep research with streaming
    report_content, interaction_id = stream_interaction(
        client, prompt, file_search_store=file_search_store
    )

    if report_content:
        filepath = save_report(report_content, prompt, mode_label)
        print(f"\n[Report saved to: {filepath}]")

        if interaction_id:
            follow_up_chat(client, interaction_id, file_search_store)
    else:
        print("\nNo content received from research.")


if __name__ == "__main__":
    main()
