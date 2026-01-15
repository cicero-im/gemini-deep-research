# Gemini Deep Research

Ένα ολοκληρωμένο εργαλείο έρευνας που τροφοδοτείται από το Google Gemini Deep Research API (`deep-research-pro-preview-12-2025`). Περιλαμβάνει Python CLI για γρήγορη έρευνα μέσω τερματικού και μια εντυπωσιακή διεπαφή Next.js για καθηλωτικές ερευνητικές εμπειρίες.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.10+-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)

[English Version](README_EN.md)

## Χαρακτηριστικά

### Βασικές Δυνατότητες
- **Βαθιά Διαδικτυακή Έρευνα**: Ολοκληρωμένη έρευνα με grounding search και ανάλυση της Google
- **Ενσωμάτωση Αναζήτησης Αρχείων**: Συνδυασμός διαδικτυακής έρευνας με τα δικά σας έγγραφα
- **Real-time Streaming**: Παρακολούθηση της έρευνας σε πραγματικό χρόνο με ενημερώσεις προόδου
- **Follow-up Συζητήσεις**: Συνέχιση συζητήσεων με context από ολοκληρωμένες έρευνες
- **Επανάληψη Session**: Συνέχεια από εκεί που σταματήσατε με interaction IDs

### CLI (`deep_research.py`)
- Διαδραστική διεπαφή τερματικού με χρωματιστή έξοδο
- Τρεις λειτουργίες έρευνας: Web-only, Web+Files, Resume
- Real-time streaming με περιλήψεις σκέψης
- Αυτόματη δημιουργία αναφορών markdown
- Follow-up chat μετά την ολοκλήρωση έρευνας

### Web UI (`gemini-research-ui/`)
- Μοντέρνο dark theme με εντυπωσιακά οπτικά εφέ (Aurora backgrounds, Spotlights, Meteors)
- Real-time streaming με animated δείκτες προόδου
- Διαδραστικό σύστημα παραπομπών με hover tooltips που δείχνουν:
  - Τίτλο και περιγραφή σελίδας
  - Favicon
  - Resolved URLs (όχι Google redirect URLs)
- Ιστορικό ερευνών με αναζήτηση και φιλτράρισμα
- Ανάκτηση περιεχομένου για διακοπείσες συνεδρίες
- Responsive design για desktop και mobile

## Screenshots

*Web UI που δείχνει έρευνα σε εξέλιξη με citation tooltips*

## Γρήγορη Εκκίνηση

### Προαπαιτούμενα
- Python 3.10+ (για CLI)
- Node.js 18+ ή Bun (για Web UI)
- Google AI API Key με πρόσβαση στο Gemini

### Εγκατάσταση CLI

```bash
# Κλωνοποίηση του repository
git clone https://github.com/silver-gr/gemini-deep-research.git
cd gemini-deep-research

# Δημιουργία virtual environment (προτείνεται)
python -m venv ~/.venv
source ~/.venv/bin/activate  # ή `~/.venv/Scripts/activate` στα Windows

# Εγκατάσταση dependencies
pip install -r requirements.txt

# Ορισμός API key
export GEMINI_API_KEY="your-api-key-here"

# Εκτέλεση CLI
./deep_research.py
# ή: python deep_research.py
```

### Εγκατάσταση Web UI

```bash
cd gemini-research-ui

# Εγκατάσταση dependencies (με bun - προτείνεται)
bun install
# ή: npm install

# Εκκίνηση development server
bun run dev
# ή: npm run dev

# Άνοιγμα http://localhost:3000
```

## Χρήση

### Λειτουργίες CLI

```
╭─────────────────────────────────────────────────╮
│         Gemini Deep Research Agent              │
╰─────────────────────────────────────────────────╯

Επιλέξτε λειτουργία έρευνας:
  [A] Web Only - Μόνο αναζήτηση στο διαδίκτυο
  [B] Web + Files - Διαδίκτυο + ανεβασμένα έγγραφα
  [C] Resume - Συνέχεια προηγούμενης συνεδρίας
```

**Παράδειγμα Συνεδρίας:**
```bash
$ ./deep_research.py

Επιλογή λειτουργίας: A

Εισάγετε το θέμα έρευνας:
> Σύγκριση Essentialism του Greg McKeown με Digital Minimalism του Cal Newport

[Έναρξη έρευνας...]
📊 Ανάλυση πηγών...
💭 Σκέψη: Αναγνώριση βασικών θεμάτων και φιλοσοφικών θεμελίων...
💭 Σκέψη: Σύγκριση βασικών αρχών επιλεκτικής εστίασης...
📝 Δημιουργία τελικής αναφοράς...

[Έρευνα ολοκληρώθηκε! Αποθηκεύτηκε: essentialism_vs_digital_minimalism_20260115_033000.md]

Συνέχεια με ερωτήσεις follow-up; (y/n): y
> Ποια είναι τα πρακτικά βήματα δράσης και από τα δύο βιβλία;
```

### Χαρακτηριστικά Web UI

1. **Έναρξη Έρευνας**: Εισάγετε το θέμα και επιλέξτε λειτουργία (Web ή Web+Files)
2. **Παρακολούθηση Προόδου**: Δείτε real-time περιλήψεις σκέψης και αριθμό πηγών
3. **Διαδραστικές Παραπομπές**: Hover πάνω σε badges παραπομπών (π.χ. `[1]`) για λεπτομέρειες
4. **Follow-up Chat**: Κάντε ερωτήσεις για την ολοκληρωμένη έρευνα
5. **Ιστορικό**: Περιήγηση, αναζήτηση και επανεξέταση παλαιότερων συνεδριών

## Αρχιτεκτονική

### Δομή CLI
```
deep_research.py          # Single-file CLI εφαρμογή (545 γραμμές)
├── File Search Store Management (CRUD λειτουργίες)
├── Deep Research Interaction (Streaming εκτέλεση)
├── Resume/Continue (Ανάκτηση συνεδρίας)
└── Follow-up Chat (Συζητήσεις με context)
```

### Δομή Web UI
```
gemini-research-ui/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes με SSE streaming
│   │   │   ├── research/      # Έναρξη νέας έρευνας
│   │   │   ├── resume/        # Επανάληψη συνεδριών
│   │   │   ├── resolve-citation/  # Επίλυση URLs
│   │   │   └── stores/        # Διαχείριση file stores
│   │   ├── history/           # Σελίδα ιστορικού
│   │   ├── settings/          # Σελίδα ρυθμίσεων
│   │   └── research/[id]/     # Δυναμική προβολή έρευνας
│   ├── components/
│   │   ├── ui/                # Aceternity/Magic UI components
│   │   └── research/          # Components ειδικά για έρευνα
│   ├── lib/                   # Utilities και helpers
│   ├── hooks/                 # Custom React hooks
│   └── types/                 # TypeScript definitions
├── 60 TypeScript αρχεία
└── 14,239 γραμμές κώδικα
```

### Tech Stack

| Επίπεδο | CLI | Web UI |
|---------|-----|--------|
| Runtime | Python 3.10+ | Node.js 18+ / Bun |
| Framework | - | Next.js 16 (App Router) |
| UI | Rich (terminal) | React 19 + Tailwind CSS 4 |
| State | - | Zustand v5 |
| Αποθήκευση | Filesystem | IndexedDB (Dexie v4) |
| API | google-genai SDK | @google/genai + SSE |
| Εφέ | - | Framer Motion + Aceternity UI |

## Σύστημα Παραπομπών

Το Web UI περιλαμβάνει εξελιγμένο σύστημα παραπομπών που:

1. **Αναλύει Παραπομπές**: Ανιχνεύει `[cite: x]` ή `[CITE:x,y]` patterns στην έξοδο του Gemini
2. **Εξάγει URLs**: Αναλύει Markdown link format από grounding sources
3. **Επιλύει Redirects**: Ακολουθεί τα redirects του Google grounding API
4. **Ανακτά Metadata**: Λαμβάνει τίτλο, περιγραφή και favicon
5. **Εμφανίζει Tooltips**: Δείχνει διαδραστικά tooltips με λεπτομέρειες πηγής

```typescript
// Παράδειγμα ανάλυσης παραπομπών
"[cite: 1, 2]" → ["1", "2"] → urlMap["1"], urlMap["2"]
"38. [reddit.com](https://vertexaisearch...)" → resolved σε actual reddit.com URL
```

## Μεταβλητές Περιβάλλοντος

```bash
# Απαιτούμενο
GEMINI_API_KEY=your_api_key_here

# Προαιρετικό (Web UI)
# Το API key μπορεί επίσης να οριστεί στη σελίδα Settings (αποθηκεύεται στο IndexedDB)
```

## Αρχεία Εξόδου

Οι αναφορές έρευνας αποθηκεύονται ως markdown:
- CLI: `{topic}_{timestamp}.md` στον φάκελο του project
- Web UI: Αποθηκεύονται στο IndexedDB, εξαγώγιμες ως markdown

## Σημειώσεις Ανάπτυξης

### Στατιστικά Build

| Μέτρηση | Τιμή |
|---------|------|
| **CLI** | 545 γραμμές, single Python αρχείο |
| **Web UI** | 60 TypeScript αρχεία, 14,239 γραμμές |
| **Διάρκεια Session** | ~3 ώρες (02:31 - 05:30 GMT+2) |

### AI-Assisted Development

Το Web UI αυτού του project χτίστηκε εξ ολοκλήρου με το [Claude Code](https://claude.ai/code) (AI coding assistant της Anthropic) σε μία συνεδρία.

**Χρήση Tokens (από Claude Code session logs):**

| Μέτρηση | Τιμή |
|---------|------|
| Input Tokens | 49,132 |
| Output Tokens | 124,221 |
| Cache Read Tokens | 74,551,484 |
| Cache Create Tokens | 4,561,037 |
| **Σύνολο Tokens** | **~79.3M** |

**Ανάλυση Κόστους (Claude Opus 4.5 API Pricing):**

| Τύπος Token | Τιμή | Ποσότητα | Κόστος |
|-------------|------|----------|--------|
| Input | $15/MTok | 49,132 | $0.74 |
| Output | $75/MTok | 124,221 | $9.32 |
| Cache Read | $1.50/MTok | 74,551,484 | $111.83 |
| Cache Create | $18.75/MTok | 4,561,037 | $85.52 |
| **Σύνολο** | | | **~$207** |

*Σημείωση: Τα cache tokens κυριαρχούν στο κόστος λόγω της διαχείρισης μακρού context του Claude Code.*

### Βασικές Προκλήσεις Υλοποίησης

1. **Επίλυση Citation URLs**: Το Gemini επιστρέφει grounding URLs ως `vertexaisearch.cloud.google.com` redirects που χρειάζονται επίλυση.

2. **Ανάλυση Markdown Links**: Οι grounding sources είναι μορφοποιημένες ως Markdown links `[domain](url)`, όχι raw URLs.

3. **Portal-based Tooltips**: Τα citation tooltips απαίτησαν React Portals για να ξεφύγουν από overflow constraints.

4. **SSE Streaming**: Next.js route handlers με Server-Sent Events για real-time πρόοδο.

## Roadmap

### Προγραμματισμένα Χαρακτηριστικά

| Προτεραιότητα | Χαρακτηριστικό | Περιγραφή | Κατάσταση |
|---------------|----------------|-----------|-----------|
| Υψηλή | Export σε PDF | Εξαγωγή αναφορών ως μορφοποιημένα PDFs | Προγραμματισμένο |
| Υψηλή | Πολυγλωσσική Υποστήριξη | Μεταφράσεις UI (Ελληνικά, Ισπανικά, κλπ.) | Προγραμματισμένο |
| Υψηλή | Templates Έρευνας | Προκαθορισμένα prompts για συνήθεις τύπους έρευνας | Προγραμματισμένο |
| Μεσαία | Συνεργατική Έρευνα | Διαμοιρασμός και συνεργασία σε συνεδρίες | Προγραμματισμένο |
| Μεσαία | Custom Themes | Light mode και custom χρώματα | Προγραμματισμένο |
| Μεσαία | Συντομεύσεις Πληκτρολογίου | Πλοήγηση και ενέργειες για power users | Προγραμματισμένο |
| Μεσαία | Σύγκριση Ερευνών | Σύγκριση πολλαπλών συνεδριών δίπλα-δίπλα | Προγραμματισμένο |
| Χαμηλή | Browser Extension | Γρήγορη έρευνα από οποιαδήποτε ιστοσελίδα | Προγραμματισμένο |
| Χαμηλή | Mobile App | React Native app για iOS/Android | Προγραμματισμένο |
| Χαμηλή | API Endpoints | REST API για προγραμματική πρόσβαση | Προγραμματισμένο |

### Ιστορικό Εκδόσεων

| Έκδοση | Ημερομηνία | Αλλαγές |
|--------|------------|---------|
| 1.0.0 | Ιαν 2026 | Αρχική έκδοση με CLI και Web UI |

### Μελλοντικές Βελτιώσεις

**Βελτιώσεις Web UI:**
- [ ] Offline υποστήριξη με service workers
- [ ] Tags και κατηγορίες έρευνας
- [ ] Προηγμένη αναζήτηση με φίλτρα
- [ ] Εξαγωγή παραπομπών (BibTeX, APA, MLA)
- [ ] Φωνητική εισαγωγή θεμάτων έρευνας

**Βελτιώσεις CLI:**
- [ ] Υποστήριξη αρχείου ρυθμίσεων (~/.gemini-research.yaml)
- [ ] Batch λειτουργία έρευνας
- [ ] Επιλογές μορφής εξόδου (JSON, HTML)
- [ ] Ενσωμάτωση με Obsidian/Notion

**Υποδομή:**
- [ ] Docker containerization
- [ ] Οδηγός self-hosted deployment
- [ ] Rate limiting και caching
- [ ] Analytics dashboard

## Συνεισφορά

Οι συνεισφορές είναι ευπρόσδεκτες! Μη διστάσετε να υποβάλετε Pull Request.

## Άδεια

MIT License - Δείτε [LICENSE](LICENSE) για λεπτομέρειες.

## Ευχαριστίες

- [Google Gemini](https://deepmind.google/technologies/gemini/) για το Deep Research API
- [Aceternity UI](https://ui.aceternity.com/) για τα εντυπωσιακά UI components
- [Claude Code](https://claude.ai/code) για την AI-assisted ανάπτυξη
- Την open-source κοινότητα για την έμπνευση

---

Χτίστηκε με AI assistance σε μία συνεδρία coding.
