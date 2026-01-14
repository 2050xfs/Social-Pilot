# SocialPilot AI: Roadmap

## Phase 0: Foundations (Now)
- Consolidate core flows: research → plan → dashboard → modal.
- Solidify schema contracts for personas and content items.
- Improve error messaging and input validation.

## Phase 1: Intelligence & Strategy
- **Competitor Delta**: detect gaps in competitor content and surface differentiators.
- **Hashtag Stacking**: rotate tag sets per platform to avoid repetition penalties.
- **Strategy explainability**: attach rationale to each content item (funnel stage + hook type).

## Phase 2: Asset Factory
- **Batching engine**: sequential queue with rate‑limit awareness.
- **Style continuity**: global style modifiers applied across prompts.
- **Fallback prompts**: refine on image generation failure.
- **Editor v1**: in‑modal text edits and asset swaps.

## Phase 3: Execution Simulation
- **Queue manager**: prioritize generation for upcoming posts.
- **Auto‑pilot rules**: state transitions with guardrails (e.g., skip missing assets).
- **Engagement simulation**: comments + brand replies tied to persona voice.

## Phase 4: Analytics & Reporting
- **Reach projection** charting tied to viral score.
- **Engagement heatmap** by day/time.
- **Campaign export** (PDF + asset bundle) for stakeholders.

## Phase 5: Publishing Integrations
- Meta Graph API handshake for real posts.
- OAuth, token refresh, and per‑platform format rules.

## Sequencing Notes
- Phase 1 and 2 are prerequisites for analytics because viral scores depend on content quality.
- Phase 3 relies on 2 for accurate asset readiness signals.
- Publishing integrations should follow a stable simulation layer to validate timing and formats.
