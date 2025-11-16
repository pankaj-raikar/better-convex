# Complete Inngest Setup Guide for LearnFlow AI

## 🎯 Why You NEED Inngest

### Your Problem (Without Inngest)

```
Document Upload (2s) →
OCR Processing (8s) →
Architect Planning (4s) →
15 Agents Running (30-40s) →  ❌ TIMEOUT at 10s (Vercel Hobby)
RAG Embedding (6s) →           ❌ TIMEOUT at 60s (Vercel Pro)
Store Results (3s)

Total: 53+ seconds

```

**Result:** Your app crashes on Vercel Hobby. Even on Vercel Pro, complex documents will timeout.

### Your Solution (With Inngest)

```
Document Upload (2s) → ✅
  ↓ (Inngest manages next steps)
OCR Processing (8s) → ✅
  ↓
Architect Planning (4s) → ✅
  ↓
15 Agents Running (40s) → ✅ (each agent = separate step)
  ↓
RAG Embedding (6s) → ✅
  ↓
Store Results (3s) → ✅

Total: 63 seconds, NO TIMEOUT! Each step runs independently.

```

**Result:** Works perfectly on any hosting platform!

---

## 📊 Comparison Table

| Feature             | Without Inngest                    | With Inngest                          |
| ------------------- | ---------------------------------- | ------------------------------------- |
| **Max Duration**    | 10-60s (depending on plan)         | Unlimited (hours/days)                |
| **Retries**         | Manual error handling              | Automatic per step                    |
| **Observability**   | Console logs                       | Full dashboard with replay            |
| **Cost**            | High (Vercel charges full compute) | Low (only active compute time)        |
| **Reliability**     | Fails on network issues            | Auto-retries with exponential backoff |
| **Background Jobs** | Need separate queue system         | Built-in                              |
| **Concurrency**     | Manual rate limiting               | Built-in throttling                   |
| **Human-in-Loop**   | Not possible                       | Can pause for hours/days              |

---

## 🏗️ Architecture: Mastra + Inngest

```
┌─────────────────────────────────────────────────────────────┐
│                        USER REQUEST                          │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────┐
│              NEXT.JS API (Vercel/Cloudflare)                │
│                                                              │
│  POST /api/upload                                           │
│  - Upload file to R2                                        │
│  - Trigger Inngest event                                    │
│  - Return immediately (non-blocking!)                       │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                    INNGEST (Orchestration)                   │
│                                                              │
│  Event: 'document.uploaded'                                 │
│                                                              │
│  Step 1: OCR Processing         → Calls Vercel Function     │
│  Step 2: Architect Planning     → Calls Mastra Agent        │
│  Step 3: Run Notes Agent        → Calls Mastra Agent        │
│  Step 4: Run Quiz Agent         → Calls Mastra Agent        │
│  Step 5: Run Diagram Agent      → Calls Mastra Agent        │
│  Step 6: RAG Embedding          → Calls Mastra RAG          │
│  Step 7: Store to Supabase      → Calls Vercel Function     │
│  Step 8: Notify User            → Calls Vercel Function     │
│                                                              │
│  ✅ Each step: Independent, retriable, observable          │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                      MASTRA (AI Logic)                       │
│                                                              │
│  - 15 Agent Definitions                                     │
│  - Tool Calling                                             │
│  - RAG Processing                                           │
│  - Memory Management                                        │
│  - Streaming Responses                                      │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE (Storage)                        │
│                                                              │
│  - PostgreSQL (documents, sections, runs)                   │
│  - pgvector (embeddings)                                    │
│  - Real-time subscriptions                                  │
└─────────────────────────────────────────────────────────────┘

```

**Key Points:**

- **Inngest** orchestrates (WHAT to run, WHEN, HOW MANY retries)
- **Mastra** provides intelligence (AGENT LOGIC, RAG, MEMORY)
- **Your code** stays on Vercel/Cloudflare (no separate hosting!)
- **Supabase** stores everything

---

## 🚀 Setup Instructions

### Step 1: Install Inngest

```bash
npm install inngest

```

### Step 2: Create Inngest Client

```tsx
// src/inngest/client.ts
import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "learnflow-ai",
  eventKey: process.env.INNGEST_EVENT_KEY!, // Get from inngest.com
});
```

### Step 3: Create Inngest Function

```tsx
// src/inngest/functions/process-document.ts
import { inngest } from "../client";
import { mastra } from "@/mastra";

export const processDocument = inngest.createFunction(
  {
    id: "process-document",
    concurrency: [
      {
        limit: 5, // Max 5 concurrent per user
        key: "event.data.userId",
      },
    ],
    retries: 3, // Retry failed steps 3 times
  },
  { event: "document.uploaded" }, // Trigger on this event
  async ({ event, step }) => {
    const { documentId, userId, purpose } = event.data;

    // STEP 1: OCR (if needed)
    const text = await step.run("ocr", async () => {
      return await processOCR(documentId);
    });

    // STEP 2: Architect creates plan
    const plan = await step.run("architect", async () => {
      const result = await mastra.agents.architect.generate({
        messages: [`Analyze document for ${purpose}`],
      });
      return JSON.parse(result.text);
    });

    // STEP 3: Run agents in parallel
    const agentResults = {};

    // Using Promise.all for parallel execution
    const parallelAgents = ["notes", "quiz", "diagram"];
    const results = await Promise.all(
      parallelAgents.map((agentName) =>
        step.run(`agent-${agentName}`, async () => {
          return await mastra.agents[agentName].generate({
            messages: [plan.inputs[agentName]],
          });
        })
      )
    );

    results.forEach((result, i) => {
      agentResults[parallelAgents[i]] = result.text;
    });

    // STEP 4: Store results
    await step.run("store", async () => {
      await storeInSupabase(documentId, agentResults);
    });

    return { success: true, documentId };
  }
);
```

### Step 4: Create Inngest Serve Handler

```tsx
// app/api/inngest/route.ts
import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { processDocument } from "@/inngest/functions/process-document";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processDocument,
    // Add more functions here
  ],
});
```

### Step 5: Trigger Inngest from Your App

```tsx
// app/api/upload/route.ts
import { inngest } from "@/inngest/client";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const purpose = formData.get("purpose") as string;

  // Upload to R2
  const documentId = await uploadToR2(file);

  // Trigger Inngest (non-blocking!)
  await inngest.send({
    name: "document.uploaded",
    data: {
      documentId,
      userId: req.headers.get("user-id"),
      purpose,
      fileName: file.name,
    },
  });

  // Return immediately
  return Response.json({
    documentId,
    status: "processing",
  });
}
```

### Step 6: Environment Variables

```bash
# .env.local
INNGEST_EVENT_KEY=your_event_key
INNGEST_SIGNING_KEY=your_signing_key

# Get these from https://app.inngest.com

```

### Step 7: Deploy to Vercel

```bash
# Push to GitHub
git add .
git commit -m "Add Inngest"
git push

# Vercel auto-deploys
# Go to inngest.com → Connect Vercel project

```

---

## 💰 Pricing Comparison

### Scenario: 1000 Documents/Month (Beta Launch)

**Without Inngest (Vercel Pro):**

- Vercel Pro: $20/month
- Each document: 60 seconds compute
- Total compute: 1000 docs × 60s = 16.67 hours
- Vercel Pro includes: 400 hours
- **Cost: $20/month**

**With Inngest (Vercel Hobby + Inngest Free):**

- Vercel Hobby: $0/month
- Each document: 6-10 steps
- Total steps: 1000 docs × 8 steps = 8,000 steps
- Inngest free tier: 50,000 steps
- **Cost: $0/month** 🎉

**With Inngest (Vercel Pro + Inngest Free) - Recommended:**

- Vercel Pro: $20/month (for extra features)
- Inngest: $0/month (within free tier)
- **Cost: $20/month**
- Benefits: Better performance + more Vercel features

### Scenario: 10,000 Documents/Month (Post-Launch)

**Without Inngest:**

- Not possible on Vercel Hobby (timeout)
- Vercel Pro: $20/month base
- Total compute: 10,000 × 60s = 166.67 hours
- Vercel Pro overage: (166.67 - 400) = $0 (still within limit)
- **Cost: $20/month**
- **Problem: Timeouts for complex documents**

**With Inngest:**

- Vercel Pro: $20/month
- Total steps: 10,000 × 8 = 80,000 steps
- Inngest paid tier: $25/month (includes 100k steps)
- **Cost: $45/month**
- **Benefit: No timeouts, automatic retries, full observability**

---

## 🎯 Best Practices

### 1. Keep Steps Small

```tsx
// ❌ BAD: One giant step
await step.run("process-everything", async () => {
  const ocr = await doOCR();
  const notes = await generateNotes(ocr);
  const quiz = await generateQuiz(notes);
  const diagram = await generateDiagram(notes);
  return { notes, quiz, diagram };
});
// Problem: If diagram fails, have to re-run OCR, notes, quiz!

// ✅ GOOD: Separate steps
const ocr = await step.run("ocr", async () => await doOCR());
const notes = await step.run("notes", async () => await generateNotes(ocr));
const quiz = await step.run("quiz", async () => await generateQuiz(notes));
const diagram = await step.run(
  "diagram",
  async () => await generateDiagram(notes)
);
// Benefit: If diagram fails, only retry diagram step!
```

### 2. Use step.ai.infer() for LLM Calls

```tsx
// ✅ BEST: Offload LLM to Inngest
const response = await step.ai.infer("generate-notes", {
  model: step.ai.models.openai({ model: "gpt-4o" }),
  body: {
    messages: [{ role: "user", content: prompt }],
  },
});
// Saves 70-80% Vercel compute cost!
```

### 3. Add Concurrency Limits

```tsx
inngest.createFunction(
  {
    id: "process-document",
    concurrency: [
      { limit: 10, key: "event.data.userId" }, // 10 per user
      { limit: 50 }, // 50 globally
    ],
  }
  // ...
);
```

### 4. Use Throttling for Rate Limits

```tsx
inngest.createFunction(
  {
    id: "process-document",
    throttle: {
      limit: 100, // Max 100 per minute
      period: "1m",
      key: "event.data.userId",
    },
  }
  // ...
);
```

### 5. Monitor with Dashboard

Visit https://app.inngest.com to see:

- ✅ All function runs
- ✅ Which steps succeeded/failed
- ✅ Replay failed runs
- ✅ Cancel running functions
- ✅ View logs in real-time

---

## 🆚 Hosting Comparison

### Option 1: Vercel + Inngest ⭐ RECOMMENDED

**Pros:**

- ✅ Zero infrastructure management
- ✅ Auto-deploy from GitHub
- ✅ Global CDN
- ✅ Perfect for Next.js
- ✅ Easy setup (5 minutes)

**Cons:**

- ⚠️ Costs $20/month for Pro features
- ⚠️ Vendor lock-in (but easy to migrate)

**Setup:**

```bash
vercel deploy
# Visit inngest.com → Connect Vercel
# Done!

```

---

### Option 2: Cloudflare Pages + Inngest

**Pros:**

- ✅ Cheaper ($5/month vs $20)
- ✅ Fast edge network
- ✅ Good for global users

**Cons:**

- ⚠️ Smaller ecosystem than Vercel
- ⚠️ Less Next.js optimization

**Setup:**

```bash
npm run build
wrangler pages deploy
# Visit inngest.com → Connect Cloudflare

```

---

### Option 3: VPS (DigitalOcean/AWS) + Inngest

**Pros:**

- ✅ Full control
- ✅ Can self-host Inngest (open-source)
- ✅ No timeouts (even without Inngest)

**Cons:**

- ❌ Manual scaling
- ❌ DevOps overhead (Docker, PM2, SSL, load balancing)
- ❌ 10-20 hours/month management

**Setup:**

```bash
# On VPS
git clone your-repo
npm install
docker-compose up -d
# Setup nginx, SSL, monitoring

```

---

## 🎯 Final Recommendation

### For LearnFlow AI Beta (100-500 users):

**Stack:**

```
Frontend: Next.js 15
Hosting: Vercel Pro ($20/month)
AI Framework: Mastra (free)
Orchestration: Inngest (free tier)
Database: Supabase (free)
Total: $20/month

```

**Why:**

1. ✅ Solves timeout problem completely
2. ✅ Automatic retries (better reliability)
3. ✅ Observability dashboard
4. ✅ Scales to 6,000 docs/month on free tier
5. ✅ Zero infrastructure management

### For LearnFlow AI Production (10k+ users):

**Stack:**

```
Same as above
Inngest: Paid tier ($25/month)
Total: $45/month

```

**Why:**

1. ✅ Handles 10,000+ documents/month
2. ✅ Enterprise features (priority support)
3. ✅ Longer event history
4. ✅ Advanced concurrency control

---

## 📚 Resources

- **Inngest Docs:** https://www.inngest.com/docs
- **Mastra Docs:** https://mastra.ai/docs
- **Example Project:** https://github.com/inngest/inngest-js/tree/main/examples/next
- **Inngest + Vercel Guide:** https://www.inngest.com/docs/deploy/vercel

---

## ✅ Summary

**Question:** Should you use Inngest with Mastra?

**Answer:** **YES, ABSOLUTELY!** 🎯

**Why:**

1. Solves Vercel timeout issues (10-60s limit)
2. Your workflow takes 30-90 seconds (exceeds limits)
3. Automatic retries (better reliability)
4. Cost savings (70-80% compute reduction)
5. Production-ready observability
6. Works with Vercel, Cloudflare, VPS
7. Free tier supports 6,000 docs/month

**How They Work Together:**

- **Mastra** = AI intelligence (agent logic, RAG, memory)
- **Inngest** = Durable execution (long-running, retries, orchestration)
- **Together** = Production-ready AI application

**Start building today:**

```bash
npm install inngest
# Follow setup guide above
# Deploy to Vercel
# You're done!

```

🚀 **Happy Building!**
