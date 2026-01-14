# SocialPilot AI: Mission Control & Architecture

## Vision
SocialPilot AI is a next-generation "Agentic" social media management suite. It moves beyond simple scheduling into the realm of autonomous brand orchestration, using LLMs to observe, strategize, and execute with minimal human intervention.

## The Agentic Architecture

### 1. The Observation Loop (Intelligence Phase)
*   **Engine:** Gemini 3 Pro + Google Search Grounding.
*   **Mechanism:** The system performs iterative searches for high-performing content in the user's specific sub-niche.
*   **Logic:** It extracts metadata from `groundingChunks` to verify real-world URLs and handles, then synthesizes a "Composite Persona" that combines the best traits of top competitors.

### 2. The Strategic Weaver (Strategy Phase)
*   **Engine:** Gemini 3 Pro (High Reasoning Mode).
*   **Psychology Modeling:** The 30-day plan isn't random. It follows a **3-Stage Funnel**:
    *   **Phase Alpha (Days 1-7):** *Disruption.* High-velocity hooks designed for broad discovery and algorithmic "sparking."
    *   **Phase Beta (Days 8-21):** *Nurture.* Value-first content, storytelling, and community "insider" knowledge to build high-trust signals.
    *   **Phase Gamma (Days 22-30):** *Harvest.* High-intent CTAs, scarcity-driven product placement, and direct response marketing.

### 3. The Creative Forge (Asset Production)
*   **Visuals:** Gemini 2.5 Flash-Image interprets the "Visual Aesthetic" DNA discovered in Phase 1 to ensure every AI-generated image maintains a consistent brand language.
*   **Copy:** Multi-step prompt chain ensures hooks are distinct from captions and that hashtags are optimized for specific platform density.

### 4. The Execution Chronos (Simulation)
*   **State Management:** Uses a local-first state engine to track simulation time, allowing the user to preview a "month of growth" in minutes or hours.
*   **Lifecycle:** `Scheduled` -> `Processing` (AI Gen) -> `Staged` -> `Live` (Posted).

---
*Technical Specification v1.1 - Internal Confidential*
