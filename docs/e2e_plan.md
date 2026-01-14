# SocialPilot AI: E2E Plan & System Interworkings

## Scope
This document describes the end‑to‑end workflow, system boundaries, and how the app’s modules depend on each other. It is written to be actionable for engineering, design, and product.

## Core User Journey (E2E)
1. **Input & goal selection**
   - User chooses a campaign goal and inputs a niche.
2. **Research phase**
   - The app invokes the LLM with search tools to fetch competitor references.
   - Outputs a persona list with strategy, hook style, and visual aesthetic.
3. **Strategy phase**
   - The app asks the LLM for a 30‑day plan with funnel stages and per‑day content details.
4. **Dashboard phase**
   - Generated plan is displayed on a calendar grid with item metadata.
5. **Asset generation**
   - Users generate visuals per post or in a batch.
6. **Simulation / execution**
   - Auto‑pilot transitions items to Posted at simulated intervals.
7. **Inspection & iteration**
   - User opens a post modal, reviews hook/caption/hashtags, and optionally edits.

## System Components & Responsibilities

### 1) UI Shell & State
- **Responsibilities**: global navigation, tab switching, layout, and modal rendering.
- **Dependencies**: the campaign plan, persona list, and connection status.
- **Key state**: active tab, selected post, simulation day, auto‑pilot toggle.

### 2) Research Engine
- **Responsibilities**: create personas via LLM + search grounding.
- **Inputs**: niche, campaign goal.
- **Outputs**: `Persona[]` with name, handle, strategy, hook style, visual aesthetic.
- **Dependency**: must complete before strategy and asset generation since persona aesthetic feeds prompts.

### 3) Strategy Engine
- **Responsibilities**: generate the 30‑day plan with hooks, captions, hashtags, and visual prompts.
- **Inputs**: niche, campaign goal, personas.
- **Outputs**: `ContentItem[]` with scheduled status and a viral score.

### 4) Asset Factory
- **Responsibilities**: request image generation per item, apply aspect ratio rules.
- **Inputs**: content plan + persona aesthetic.
- **Outputs**: image data URLs and updated content statuses.
- **Dependency**: uses plan from Strategy Engine; can run sequentially or in batch.

### 5) Execution Simulator
- **Responsibilities**: time‑based posting simulation and queue health metrics.
- **Inputs**: content plan and auto‑pilot status.
- **Outputs**: `Posted` updates and `postedAt` timestamps.

### 6) Analytics (Derived)
- **Responsibilities**: compute posted counts and viral score averages.
- **Inputs**: content plan.
- **Outputs**: dashboard stats.

## Data Model (Contracts)

### Persona
- `name`: display name for the persona.
- `handle`: social handle sourced from grounding.
- `strategy`: narrative of growth philosophy.
- `hookStyle`: preferred psychological hook pattern.
- `visualAesthetic`: cues used in visual prompt generation.

### ContentItem
- `day`: calendar index (1‑30).
- `type`: `Reel | Post | Story | Carousel`.
- `topic`, `hook`, `caption`, `hashtags`, `visualPrompt`.
- `imageUrl` (optional): data URL after generation.
- `status`: `Scheduled | Processing | Posted`.
- `postedAt` (optional): timestamp when simulated.
- `viralScore`: heuristic score (0‑100).

## State Transitions
- **Scheduled → Processing**: when image generation begins.
- **Processing → Scheduled**: generation failed and item is reset.
- **Scheduled → Posted**: auto‑pilot posts the next pending item.

## Dependency Graph (Simplified)
- Research Engine → Strategy Engine → Content Plan →
  - Asset Factory (visuals)
  - Execution Simulator (posting)
  - Analytics (stats)
- Persona aesthetic is required for Asset Factory prompt quality.

## Failure Modes & Recovery
- **Research failures**: return to input step with user guidance.
- **Plan generation failures**: retry with refined niche or smaller scope.
- **Image failures**: reset item to Scheduled and allow retry.

## Security & Data Handling
- API key stored in environment variable.
- No persistent backend data; the system operates local‑first.

## Implementation Plan (E2E)
1. **Tighten schemas** for persona and plan validation.
2. **Add competitor delta** to research output.
3. **Extend plan generator** with explainability metadata.
4. **Build queue manager** that prioritizes items with upcoming days.
5. **Add editing workflows** in modal (caption + hashtags + asset swap).
6. **Implement analytics UI** for reach and engagement simulation.
7. **Introduce publishing integrations** behind feature flags.

## Decision Rationale (Summary)
- Prioritize research + strategy because content quality drives all downstream simulation and analytics.
- Treat asset generation as a separate subsystem to allow batching and retries without blocking planning.
- Use simulation to validate cadence and user confidence before real platform integrations.
