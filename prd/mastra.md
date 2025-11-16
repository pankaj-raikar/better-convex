# 12-Week Mastra Implementation Roadmap for LearnFlow AI

**Simplified timeline using Mastra as the single AI framework**

---

## Week 1: Foundation Setup (Nov 14-20)

### Goals

- ✅ Setup Mastra project
- ✅ Configure database and auth
- ✅ Deploy to production

### Tasks

**Day 1-2: Project Initialization**

```bash
# Create Mastra project
npm create mastra@latest learnflow-ai \\
  --components agents,workflows,rag,tools \\
  --llm openai \\
  --example

cd learnflow-ai

# Install additional dependencies
npm install \\
  @supabase/supabase-js \\
  @copilotkit/react-core \\
  @copilotkit/react-ui \\
  next-intl \\
  zustand \\
  @google-cloud/translate \\
  jspdf html2canvas

```

**Day 3: Supabase Setup**

```sql
-- Create Supabase project at supabase.com
-- Run migrations from PRD schema
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create tables: users, documents, sections, runs, etc.

```

**Day 4: Environment Configuration**

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_url
SUPABASE_SERVICE_KEY=your_key
OPENAI_API_KEY=your_key
ANTHROPIC_API_KEY=your_key
GOOGLE_TRANSLATE_API_KEY=your_key

```

**Day 5: Mastra Configuration**

```tsx
// src/mastra/index.ts
import { Mastra } from "@mastra/core";
import { PostgresStore } from "@mastra/store";
import { QdrantVector } from "@mastra/rag";

export const mastra = new Mastra({
  storage: new PostgresStore({
    connectionString: process.env.SUPABASE_DATABASE_URL!,
  }),

  vector: new QdrantVector({
    url: process.env.QDRANT_URL!,
  }),

  telemetry: {
    enabled: true,
    exporter: "console",
  },
});
```

**Day 6-7: Initial Deployment**

```bash
# Deploy to Vercel
vercel deploy

# Verify deployment
# Test auth flow
# Check Mastra playground works

```

### Deliverables

- ✅ Project deployed to production
- ✅ Auth working (Google OAuth)
- ✅ Mastra playground accessible
- ✅ Database initialized

---

## Week 2-3: Core UI + Chat (Nov 21 - Dec 1)

### Goals

- ✅ Build landing page and dashboard
- ✅ Integrate CopilotKit chat interface
- ✅ Setup real-time streaming

### Week 2 Tasks (UI Foundation)

**Pages to Build:**

1. Landing page (`/`)
2. Dashboard (`/dashboard`)
3. Document detail (`/dashboard/document/[id]`)

**Components:**

```tsx
// components/Sidebar.tsx
// components/ChatInterface.tsx (CopilotKit)
// components/LivePreview.tsx
// components/DocumentGrid.tsx
```

**Styling:**

```bash
# Install shadcn/ui components
npx shadcn@latest init
npx shadcn@latest add button card dialog input

```

### Week 3 Tasks (Chat + Streaming)

**CopilotKit Integration:**

```tsx
// app/api/copilotkit/route.ts
import { NextRequest } from "next/server";
import { mastra } from "@/mastra";

export async function POST(req: NextRequest) {
  const { messages, documentId } = await req.json();

  // Stream from Mastra agent
  const stream = await mastra.agents.notes.stream({
    messages,
    context: { documentId },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
}

// app/page.tsx
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";

export default function ChatPage() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <CopilotSidebar
        defaultOpen
        labels={{
          title: "LearnFlow AI",
          initial: "Upload a document to start!",
        }}
      >
        <MainContent />
      </CopilotSidebar>
    </CopilotKit>
  );
}
```

**Real-time Updates:**

```tsx
// Use Supabase real-time
const notes = useQuery(api.notes.getByDocId, { docId });

// Auto-updates when Mastra agents write to Supabase
```

### Deliverables

- ✅ Landing page completed
- ✅ Dashboard with document grid
- ✅ Chat interface streaming working
- ✅ Live preview updates <1s

---

## Week 4-6: Agents + Workflows (Dec 2-15)

### Week 4: Foundation Agents (Architect + Orchestrator)

**Architect Agent:**

```tsx
// src/mastra/agents/architect.agent.ts
import { Agent } from "@mastra/core/agent";
import { z } from "zod";

export const architectAgent = new Agent({
  name: "architect",
  instructions: `
    Analyze user request and document.
    Create execution plan for other agents.
    Output JSON with:
    - Required agents
    - Execution order (parallel/sequential)
    - Agent weights per purpose
    - Estimated time/cost
  `,

  model: {
    provider: "openai",
    name: "gpt-4-turbo",
  },

  tools: [
    {
      name: "analyzeDocument",
      description: "Analyze document type and complexity",
      parameters: z.object({
        documentId: z.string(),
        purpose: z.enum(["interview", "accessibility", "language", "auto"]),
      }),
      execute: async ({ documentId, purpose }) => {
        // Analyze document from Supabase
        const doc = await getDocument(documentId);
        return {
          type: doc.type,
          complexity: calculateComplexity(doc),
          recommendedAgents: selectAgents(purpose),
        };
      },
    },
  ],

  memory: {
    enabled: true,
    type: "semantic",
  },
});
```

**Document Processing Workflow:**

```tsx
// src/mastra/workflows/document.workflow.ts
import { Workflow } from "@mastra/core/workflows";

export const documentWorkflow = new Workflow({
  name: "document-processing",

  schema: z.object({
    documentId: z.string(),
    purpose: z.enum(["interview", "accessibility", "language", "auto"]),
  }),

  execute: async ({ documentId, purpose }, { mastra }) => {
    // STEP 1: Architect creates plan
    const planResult = await mastra.agents.architect.generate({
      messages: [
        `Analyze document ${documentId} for purpose: ${purpose}. Create execution plan.`,
      ],
    });

    const plan = JSON.parse(planResult.text);

    // STEP 2: Execute agents based on plan
    const results = {};

    for (const phase of plan.phases) {
      if (phase.parallel) {
        // Execute in parallel
        const promises = phase.agents.map((agent) =>
          mastra.agents[agent.name].generate({
            messages: [agent.input],
          })
        );

        const outputs = await Promise.all(promises);

        outputs.forEach((output, i) => {
          results[phase.agents[i].name] = output.text;
        });
      } else {
        // Execute sequentially
        for (const agent of phase.agents) {
          results[agent.name] = await mastra.agents[agent.name].generate({
            messages: [agent.input],
          });
        }
      }
    }

    // STEP 3: Store results in Supabase
    await storeResults(documentId, results);

    return results;
  },
});
```

### Week 5: Core Content Agents

**Agents to implement:**

1. Notes Agent
2. Diagram Agent
3. Summarization Agent
4. Quiz Agent

**Example - Notes Agent:**

```tsx
// src/mastra/agents/notes.agent.ts
export const notesAgent = new Agent({
  name: "notes",
  instructions: `
    Extract and organize content from documents into structured markdown.

    Format:
    - H1/H2/H3 hierarchy
    - Key concepts highlighted with **bold**
    - Code blocks with language tags
    - Lists for key points
    - Section summaries

    Output clean, scannable markdown.
  `,

  model: {
    provider: "openai",
    name: "gpt-4o", // Faster model
  },

  tools: [
    {
      name: "extractHierarchy",
      description: "Extract document structure and headings",
      parameters: z.object({
        content: z.string(),
      }),
      execute: async ({ content }) => {
        // Parse headings with regex
        const headings = extractHeadings(content);
        return buildHierarchy(headings);
      },
    },

    {
      name: "generateSummary",
      description: "Generate section summary",
      parameters: z.object({
        section: z.string(),
      }),
      execute: async ({ section }) => {
        // Use LLM to summarize
        const summary = await summarize(section);
        return summary;
      },
    },
  ],
});
```

**Example - Quiz Agent:**

```tsx
// src/mastra/agents/quiz.agent.ts
export const quizAgent = new Agent({
  name: "quiz",
  instructions: `
    Generate assessment questions following Bloom's Taxonomy.

    For each document, create:
    - 10 MCQ (varied difficulty: easy/medium/hard)
    - 5 Short Answer questions
    - Tag with Bloom's level (Remember, Understand, Apply, Analyze)
    - Include rationale for correct answers

    Output JSON format for easy parsing.
  `,

  model: {
    provider: "openai",
    name: "gpt-4o",
  },

  tools: [
    {
      name: "generateMCQ",
      description: "Generate multiple choice questions",
      parameters: z.object({
        content: z.string(),
        count: z.number(),
        difficulty: z.enum(["easy", "medium", "hard"]),
      }),
      execute: async ({ content, count, difficulty }) => {
        // Generate MCQs with LLM
        const mcqs = await generateMCQs(content, count, difficulty);
        return mcqs;
      },
    },
  ],
});
```

### Week 6: Specialized Agents

**Agents to implement:**

1. Code Agent (with Big-O analysis)
2. Mathematician Agent
3. Research Agent
4. Technical Diagram Agent

**Example - Code Agent:**

```tsx
// src/mastra/agents/code.agent.ts
export const codeAgent = new Agent({
  name: "code",
  instructions: `
    Generate code examples with:
    - Multiple programming languages
    - Big-O complexity analysis
    - ≥2 edge cases per snippet
    - Syntax validation
    - Detailed comments

    Languages: Python, JavaScript, Java, C++, Go
  `,

  model: {
    provider: "anthropic",
    name: "claude-sonnet-4", // Better at code
  },

  tools: [
    {
      name: "analyzeBigO",
      description: "Analyze time and space complexity",
      parameters: z.object({
        code: z.string(),
      }),
      execute: async ({ code }) => {
        // Analyze complexity
        return {
          time: "O(n log n)",
          space: "O(n)",
          explanation: "...",
        };
      },
    },

    {
      name: "validateSyntax",
      description: "Validate code syntax",
      parameters: z.object({
        code: z.string(),
        language: z.string(),
      }),
      execute: async ({ code, language }) => {
        // Use linter/parser
        const isValid = await validateCode(code, language);
        return { valid: isValid };
      },
    },
  ],
});
```

### Deliverables (Week 4-6)

- ✅ Architect + Orchestrator agents working
- ✅ 8 core agents implemented
- ✅ Document processing workflow functional
- ✅ Real-time streaming of agent outputs
- ✅ Agent execution traces visible in playground

---

## Week 7-8: Accessibility + Translation (Dec 16-29)

### Week 7: Accessibility Agent

**Agent Implementation:**

```tsx
// src/mastra/agents/accessibility.agent.ts
export const accessibilityAgent = new Agent({
  name: "accessibility",
  instructions: `
    Transform content for accessibility:

    1. Dyslexia support:
       - OpenDyslexic font
       - 1.8x line spacing
       - Left-aligned text
       - Cream background

    2. ADHD support:
       - Short paragraphs (3-4 sentences)
       - Visual breaks
       - Summary callouts

    3. Reading level:
       - Target: Grade 10 ± 1
       - Simplify jargon
       - Short sentences
       - Active voice

    4. Color enhancement:
       - Color-code by importance
       - High-contrast themes

    Maintain accuracy while simplifying.
  `,

  model: {
    provider: "anthropic",
    name: "claude-sonnet-4", // Better at maintaining nuance
  },

  tools: [
    {
      name: "simplifyText",
      description: "Simplify to target reading level",
      parameters: z.object({
        text: z.string(),
        targetGrade: z.number().min(6).max(16),
      }),
      execute: async ({ text, targetGrade }) => {
        // Calculate Flesch-Kincaid
        const currentGrade = calculateFleschKincaid(text);

        // Simplify with LLM
        if (currentGrade > targetGrade + 1) {
          const simplified = await simplify(text, targetGrade);
          return simplified;
        }

        return text;
      },
    },

    {
      name: "generateAudio",
      description: "Generate TTS audio",
      parameters: z.object({
        text: z.string(),
        language: z.enum(["en", "hi"]),
        speed: z.number().min(0.75).max(1.5),
      }),
      execute: async ({ text, language, speed }) => {
        // Call Google Cloud TTS
        const audioBuffer = await textToSpeech(text, language, speed);

        // Upload to Cloudflare R2
        const url = await uploadAudio(audioBuffer);

        return { url };
      },
    },
  ],
});
```

**Dyslexia CSS Module:**

```css
/* styles/dyslexia.css */
.dyslexia-mode {
  font-family: "OpenDyslexic", sans-serif;
  line-height: 1.8;
  letter-spacing: 0.15em;
  text-align: left;
  background-color: #fefef1; /* Cream */
  color: #333;
}

.dyslexia-mode h1,
.dyslexia-mode h2 {
  font-weight: 700;
  margin-top: 2em;
}

.dyslexia-mode p {
  max-width: 70ch;
  margin-bottom: 1.5em;
}
```

### Week 8: Translation Agent

**Agent Implementation:**

```tsx
// src/mastra/agents/translation.agent.ts
export const translationAgent = new Agent({
  name: "translation",
  instructions: `
    Provide bilingual support (English ↔ Hindi).

    Requirements:
    - Technical accuracy (≥90% fidelity)
    - Cultural context
    - Bilingual glossary (≥20 terms)
    - Natural language flow

    Preserve:
    - Technical terms
    - Code snippets
    - Formulas
    - Citations
  `,

  model: {
    provider: "openai",
    name: "gpt-4o",
  },

  tools: [
    {
      name: "translateToHindi",
      description: "Translate English to Hindi",
      parameters: z.object({
        text: z.string(),
        preserveTerms: z.array(z.string()).optional(),
      }),
      execute: async ({ text, preserveTerms }) => {
        // Use Google Translate API
        const translated = await googleTranslate(text, "hi");

        // Verify technical terms preserved
        if (preserveTerms) {
          translated = ensureTermsPreserved(translated, preserveTerms);
        }

        return translated;
      },
    },

    {
      name: "generateGlossary",
      description: "Generate bilingual glossary",
      parameters: z.object({
        content: z.string(),
      }),
      execute: async ({ content }) => {
        // Extract technical terms
        const terms = extractTechnicalTerms(content);

        // Generate EN-HI pairs
        const glossary = await Promise.all(
          terms.map(async (term) => ({
            en: term,
            hi: await googleTranslate(term, "hi"),
            definition: await defineterm(term),
          }))
        );

        return glossary;
      },
    },
  ],
});
```

**Bilingual Toggle UI:**

```tsx
// components/BilingualToggle.tsx
export function BilingualToggle({ documentId }) {
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [content, setContent] = useState("");

  async function toggle() {
    const newLang = language === "en" ? "hi" : "en";

    // Fetch from cache or translate
    const translatedContent = await getOrTranslate(documentId, newLang);

    setContent(translatedContent);
    setLanguage(newLang);
  }

  return (
    <div>
      <button onClick={toggle} className="bilingual-toggle">
        {language === "en" ? "हिंदी" : "English"}
      </button>

      <div className="content">{content}</div>
    </div>
  );
}
```

### Deliverables (Week 7-8)

- ✅ Accessibility agent working
- ✅ Dyslexia formatting functional
- ✅ Audio narration (4 speeds)
- ✅ Translation agent working
- ✅ Bilingual toggle ≤500ms
- ✅ Glossary generation (≥20 terms)
- ✅ WCAG AA compliance verified

---

## Week 9: Export + Versioning (Dec 30 - Jan 5)

### Export Formats

**PDF Export:**

```tsx
// lib/export/pdf.ts
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function exportToPDF(documentId: string, themeId: string) {
  // Get document content
  const content = await getDocument(documentId);

  // Render to HTML with theme
  const html = renderWithTheme(content, themeId);

  // Convert to canvas
  const canvas = await html2canvas(html);

  // Generate PDF
  const pdf = new jsPDF();
  pdf.addImage(canvas, "PNG", 10, 10, 190, 0);

  // Upload to R2
  const url = await uploadToR2(pdf.output("blob"));

  return url;
}
```

**Anki Export:**

```tsx
// lib/export/anki.ts
import genanki from "genanki";

export async function exportToAnki(quizzes: Quiz[]) {
  // Create deck
  const deck = new genanki.Deck(Date.now(), "LearnFlow AI Flashcards");

  // Add cards
  quizzes.forEach((quiz) => {
    const note = new genanki.Note(model, {
      Front: quiz.question,
      Back: quiz.answer,
    });

    deck.addNote(note);
  });

  // Generate .apkg file
  const apkg = await genanki.Package(deck).writeToFile();

  return apkg;
}
```

**Version History:**

```tsx
// lib/versioning.ts
export async function createVersion(documentId: string) {
  // Get current state
  const currentContent = await getDocument(documentId);

  // Save snapshot
  const version = await saveVersion({
    documentId,
    content: currentContent,
    timestamp: Date.now(),
  });

  return version.id;
}

export async function rollback(documentId: string, versionId: string) {
  // Get version
  const version = await getVersion(versionId);

  // Restore content
  await updateDocument(documentId, version.content);

  return version;
}
```

### Deliverables

- ✅ PDF export working
- ✅ Markdown export working
- ✅ Anki export working
- ✅ Version history functional
- ✅ Rollback tested

---

## Week 10-11: Performance + Observability (Jan 6-19)

### Performance Optimization

**Mastra Performance Tuning:**

```tsx
// Optimize agent models
const fastAgents = ["notes", "summarization"]; // Use gpt-4o
const precisionAgents = ["code", "accessibility"]; // Use claude-sonnet-4

// Configure caching
mastra.configure({
  cache: {
    enabled: true,
    ttl: 3600, // 1 hour
    strategy: "semantic", // Cache similar queries
  },
});

// Enable parallel execution
workflow.parallel([
  agents.notes.generate(),
  agents.quiz.generate(),
  agents.diagram.generate(),
]);
```

**Cost Monitoring:**

```tsx
// Track costs with Mastra telemetry
mastra.telemetry.on("agent.complete", (event) => {
  const cost = calculateCost(event.usage);

  // Store in Supabase
  await recordCost({
    agentName: event.agentName,
    tokens: event.usage.totalTokens,
    cost,
    timestamp: Date.now(),
  });

  // Alert if exceeds threshold
  if (cost > 0.5) {
    alertHighCost(event.agentName, cost);
  }
});
```

### Observability Dashboard

**Metrics to Track:**

1. Agent success rate
2. Average latency per agent
3. Cost per document
4. User satisfaction (NPS)
5. Error rate

**Mastra Playground:**

```bash
# Access built-in observability
npm run dev
# Navigate to <http://localhost:4111>

# View:
# - Agent traces
# - Token usage
# - Cost breakdown
# - Error logs

```

### Deliverables

- ✅ TTFB <1.5s
- ✅ Streaming ≥5 updates/sec
- ✅ Cost tracking dashboard
- ✅ 99%+ success rate
- ✅ Observable metrics live

---

## Week 12: Beta Launch (Jan 20-26)

### Pre-Launch Checklist

**Quality Assurance:**

- [ ] All 15 agents tested
- [ ] Workflows tested end-to-end
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile responsiveness verified
- [ ] WCAG AA compliance audit passed
- [ ] Performance benchmarks met

**Beta User Onboarding:**

```tsx
// Invite 100-500 beta users
const betaInvites = await sendInvites({
  count: 500,
  segments: [
    { type: "interview_prep", count: 200 },
    { type: "accessibility", count: 150 },
    { type: "language_bridge", count: 150 },
  ],
});

// Setup feedback collection
const feedbackForm = createFeedbackForm({
  questions: [
    "How would you rate your experience? (1-10)",
    "Which agent was most helpful?",
    "What feature would you like to see next?",
  ],
});
```

**Monitoring:**

```tsx
// Real-time monitoring
mastra.telemetry.on("*", (event) => {
  // Send to analytics
  sendToAnalytics(event);

  // Alert on errors
  if (event.type === "error") {
    alertTeam(event);
  }
});
```

### Launch Day

**Go-Live Steps:**

1. ✅ Deploy final version to Vercel
2. ✅ Enable production monitoring
3. ✅ Send beta invites
4. ✅ Monitor first 24 hours closely
5. ✅ Collect and respond to feedback

### Deliverables

- ✅ 100-500 active beta users
- ✅ NPS ≥40
- ✅ <5 critical bugs
- ✅ Feedback system working
- ✅ Ready for public announcement

---

## Post-Launch (Week 13+)

### Continuous Improvement

**Weekly Reviews:**

- Analyze agent performance metrics
- Review user feedback
- Identify improvement areas
- Iterate on prompts

**Monthly Enhancements:**

- Add new agents based on demand
- Optimize slow workflows
- Reduce costs
- Improve accuracy

**Q2 Roadmap:**

- Collaboration Agent
- Peer sharing features
- Group study modes
- Gamification
- Mobile app

---

## 📊 Success Metrics

| Metric                  | Week 4 | Week 8 | Week 12 |
| ----------------------- | ------ | ------ | ------- |
| **Agents Working**      | 4      | 12     | 15      |
| **Workflows**           | 1      | 3      | 5       |
| **Beta Users**          | 0      | 50     | 500     |
| **Documents Processed** | 10     | 200    | 1000    |
| **Agent Success Rate**  | 90%    | 95%    | 99%     |
| **Average TTFB**        | 2s     | 1.5s   | <1s     |
| **Cost per Document**   | $0.50  | $0.30  | $0.20   |

---

## 🎯 Key Advantages of Mastra Approach

1. **Single Framework:** One tool instead of 4-5
2. **TypeScript Native:** No Python context-switching
3. **Built-in Observability:** No separate monitoring tool
4. **Faster Development:** Less glue code, more feature work
5. **Production-Ready:** Built by experienced team (Gatsby founders)
6. **Open Source:** Full control, no vendor lock-in
7. **Active Community:** Discord support, growing ecosystem

---

## 🚀 You're Ready!

Start with **Week 1** and follow this roadmap. Mastra provides everything you need for LearnFlow AI in a single, TypeScript-native framework.

**Next Steps:**

1. Run `npm create mastra@latest learnflow-ai`
2. Follow Week 1 setup
3. Join Mastra Discord for support
4. Build your 15 agents!

**Happy Building! 🎉**
