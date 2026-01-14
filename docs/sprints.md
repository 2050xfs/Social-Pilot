# SocialPilot AI: Detailed Engineering Roadmap

## Phase 1: Core Intelligence (Intelligence & Strategy)
*   **Task 1: Market Intelligence Layer [HIGH PRIORITY]**
    *   [x] **Grounding Integration:** Implement Google Search tools to fetch real-time creator data.
    *   [x] **Persona Synthesis:** Develop logic to aggregate strategy, aesthetic, and hooks into a `Persona` object.
    *   [x] **Handle Validation:** Extract and verify competitor handles from search metadata.
    *   [ ] *Sub-task:* Implement "Competitor Delta" detection (What are they missing that we can exploit?).
*   **Task 2: Content Blueprint Engine**
    *   [x] **Funnel Logic:** Map 30 days to Growth -> Trust -> Conversion stages.
    *   [x] **Format Diversification:** Weighted distribution of Reels (40%), Posts (30%), Stories (20%), and Carousels (10%).
    *   [x] **Viral Score Alg:** Implement a heuristic to score hooks based on length, emotional trigger words, and clarity.
    *   [ ] *Sub-task:* Dynamic Hashtag Stacking (Prevent shadowbanning by rotating tag sets).

## Phase 2: The Asset Factory (Creative Production)
*   **Task 3: Bulk Visual Generation [CRITICAL]**
    *   [x] **Single Gen:** Connect Gemini 2.5 Flash-Image for individual post visuals.
    *   [ ] **Batching Engine:** Implement a sequential async worker to process multiple visual prompts without hitting rate limits.
    *   [ ] **Style Continuity:** Inject "Global Style Modifiers" (e.g., "grainy film look" or "minimalist white") into every prompt.
    *   [ ] **Fallback Logic:** Automatic prompt refinement if the first image generation fails.
*   **Task 4: Interactive Content Studio**
    *   [x] **Quick View:** Modal for viewing post details and metadata.
    *   [ ] **Live Editor:** In-modal caption editing with auto-saving to local state.
    *   [ ] **Asset Swap:** Feature to upload custom images to override AI-generated ones.

## Phase 3: The Execution Layer (Simulation & Posting)
*   **Task 5: Auto-Pilot Logic [HIGH PRIORITY]**
    *   [x] **Time Simulation:** 60s/day virtual clock logic.
    *   [x] **State Persistence:** LocalStorage hooks to keep the campaign alive across refreshes.
    *   [ ] **Queue Manager:** Priority-based posting queue (Process 'Processing' items before 'Scheduled').
*   **Task 6: Engagement Simulation**
    *   [ ] **Comment Bot:** Generate 3-5 AI "User Comments" for every posted item to simulate social proof.
    *   [ ] **Brand Reply:** Auto-generate brand responses to these comments based on the persona's voice.

## Phase 4: Data & Polish
*   **Task 7: Growth Analytics UI**
    *   [ ] **Reach Projection:** Visual chart showing "Cumulative Reach" growing as posts go live.
    *   [ ] **Engagement Heatmap:** Show which days/times performed best (simulated).
*   **Task 8: Export & Deployment**
    *   [ ] **Direct Publish:** (Simulated) API Handshake with Meta Graph API.
    *   [ ] **Campaign PDF:** Generate a professional report of the 30-day strategy for stakeholders.
