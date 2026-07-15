# 🖥️ NiranjanOS: Interactive Developer CLI Terminal Portfolio

**NiranjanOS** is a premium, interactive retro-style command-line developer portfolio built with Next.js, React, Tailwind CSS (v4), and TypeScript. It simulates a retro Unix-like operating system environment to showcase technical competencies, professional experience, academic background, achievements, and open-source projects. 

Equipped with a custom shell parser, multi-theme customization, real-time database support via Supabase, and an intelligent, context-aware Gemini AI assistant, this project reimagines how a modern engineering portfolio is presented and explored.

---

## ✨ Core Features

*   **⚡ Interactive CLI Shell:** An extensible terminal parser processing 15+ specialized commands with real-time feedback.
*   **🤖 Gemini AI Integration (`ask` command):** Powered by `gemini-1.5-flash` via an API route (`/api/ask`). The assistant is contextually pre-loaded with Niranjan's professional background to answer visitor queries, with a built-in semantic fallback engine when running offline or without an API key.
*   **🎨 Multi-Theme Desktop Experience:** Instant interface customization with theme styling commands supporting `matrix`, `ubuntu`, `cyberpunk`, `hacker`, and `retro` presets.
*   **💾 Live Supabase Backend Integration:** Sourced data fields (skills, work experience, certifications, and achievements) are fetched dynamically from a Supabase PostgreSQL backend.
*   **📈 Integrated Visitor & Usage Analytics:** Anonymous visitor tracking, command-use frequency, and project click analytics logged automatically to the database.
*   **✉️ Terminal Contact Wizard (`contact` command):** An interactive multi-step CLI wizard that captures user messages and stores them in PostgreSQL with Row-Level Security (RLS) protections.
*   **📂 Dynamic GitHub Projects Fetching:** Auto-populates and updates repositories directly with descriptions, star counts, and tags.
*   **🐚 OS Boot Simulator:** An atmospheric, retro hardware and network check boot screen before launching the terminal environment.

---

## 🛠️ Technology Stack

| Technology Layer | Tool / Library / Platform |
| :--- | :--- |
| **Framework & Engine** | Next.js 15 (App Router), React 19, TypeScript |
| **Styling & Theme** | Tailwind CSS v4, Vanilla CSS variables |
| **Database & Analytics** | Supabase (PostgreSQL) |
| **AI Q&A Engine** | Google Gemini 1.5 Flash API |
| **Icons & Extras** | Lucide React, Canvas Confetti |

---

## 💻 CLI Commands Reference

Use the following commands inside the terminal interface to navigate and extract portfolio details:

| Command | Argument | Description |
| :--- | :--- | :--- |
| **`help`** | *None* | Display the command manual |
| **`about`** | *None* | Show a summary of Niranjan's profile and current focus |
| **`skills`** | *None* | List technical skills grouped by Programming, Frameworks, DB, Concepts, Tools |
| **`projects`** | *None* | List highlighted software engineering repositories |
| **`project`** | `<name>` | Show specifications, stack, and features of a project (e.g. `project code-orbit`) |
| **`experience`** | *None* | View internships, roles, durations, and key responsibilities |
| **`education`** | *None* | View university qualifications, GPA, and graduation period |
| **`certifications`** | *None* | Show professional certifications (OCI AI, Green Mobility, etc.) |
| **`achievements`** | *None* | Show academic scholarships, Hackerrank badges, and leadership roles |
| **`socials`** | *None* | Print GitHub, LinkedIn, Email, and Phone contact links |
| **`resume`** | *None* | Open or download the PDF version of Niranjan's CV |
| **`contact`** | *None* | Launch the interactive multi-step terminal contact submission wizard |
| **`theme`** | `<name>` | Switch interface styles (`matrix` \| `ubuntu` \| `cyberpunk` \| `hacker` \| `retro`) |
| **`ask`** | `"<question>"` | Query the Gemini-powered AI Assistant about Niranjan's career |
| **`whoami`** | *None* | Display the guest user session info |
| **`pwd`** | *None* | Print working directory |
| **`date`** | *None* | View current system time and calendar stamp |
| **`banner`** | *None* | Print the ASCII greeting splash banner |
| **`clear`** | *None* | Clear screen buffer and output history |

---

## 📊 Database Schema (`schema.sql`)

The database is built on a PostgreSQL relational model hosted on Supabase. Row-Level Security (RLS) is activated to isolate analytical insertions, messages submission, and administrative actions:

1.  **`profile_data`:** Key-Value JSONB store hosting basic text blocks (`owner_info`, `about`, `education`, `socials`, `resume`).
2.  **`skills`:** Professional competencies containing name, skill levels, and categories (`Programming`, `Frameworks`, `Database`, `Concepts`, `Tools`).
3.  **`experience`:** Structured work records detailing roles, organizations, timelines, and ordered responsibility list arrays.
4.  **`certifications`:** Validation records capturing credential names, issuers, dates, and verification links.
5.  **`achievements`:** Milestones representing academic/social acknowledgments and scores.
6.  **`messages`:** Inbound contact data entered via the CLI wizard.
7.  **`analytics`:** Internal telemetry capturing visitor loads, executed commands, and clicked projects.

---

## ⚙️ Environment Variables Setup

Create a `.env.local` file in the root directory. Configure the following keys:

```bash
# Supabase Database Credentials (Client Side Available)
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google Gemini API Key (Server-Side Only for AI Q&A)
GEMINI_API_KEY=AIzaSy...
```

*Note: If `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are not configured, the app seamlessly defaults to **Demo Mode**, utilizing mock arrays and local browser persistence for storage.*

---

## 🏁 Getting Started (Local Development)

### 1. Prerequisite Installations
Ensure you have [Node.js](https://nodejs.org/) (v18.x or above) installed on your system.

### 2. Install Project Dependencies
Run the package installation command to acquire necessary node libraries:
```bash
npm install
```

### 3. Setup Database (Optional)
Log in to your Supabase Console, navigate to the **SQL Editor**, and copy-paste the contents of [`schema.sql`](file:///c:/Users/hp5cd/Desktop/Terminal/schema.sql). Execute the script to instantiate the tables, enable Row Level Security, and seed default values.

### 4. Run Development Server
Spin up the local Turbopack Next dev server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser to check the booted CLI.

### 5. Build for Production
To optimize compilation and test target artifacts:
```bash
npm run build
npm run start
```

---

## 📂 Project Structure Walkthrough

```text
├── public/                 # Static assets (favicons, PDFs, SVGs)
├── src/
│   ├── app/
│   │   ├── admin/          # Admin CRUD configurations
│   │   ├── api/
│   │   │   ├── analytics/  # Telemetry post hooks
│   │   │   ├── ask/        # Gemini API orchestrator
│   │   │   └── github/     # Git repository caching layer
│   │   ├── globals.css     # Base system styles and font mapping
│   │   ├── layout.tsx      # System layout viewport wrapper
│   │   └── page.tsx        # Client wrapper rendering boot/shell
│   ├── components/
│   │   ├── BootScreen.tsx  # Simulated retro startup checker
│   │   └── Terminal.tsx    # Primary terminal UI & event hook coordinator
│   └── lib/
│       ├── db.ts           # Supabase operations mapping & client fallbacks
│       ├── supabase.ts     # Supabase client instantiation
│       └── terminalEngine.ts # CLI command-handling engine
├── schema.sql              # Database setup and initial seeding queries
├── package.json            # Node project configuration
└── tsconfig.json           # TypeScript configuration rules
```
