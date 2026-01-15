# Design OS: AI Integration Guide

## Overview
Design OS is a product planning and design tool that creates detailed specifications before implementation. This guide explains how to use Design OS outputs with different AI coding systems (Gemini, Codex, Claude, etc.) to build production-ready applications.

## The Design OS Philosophy

**Problem:** AI coding tools are incredible at building fast, but results often miss the mark when given vague requirements.

**Solution:** Design OS creates a complete specification package that any AI system can use as a source of truth for implementation.

## What Design OS Exports

After completing the Design OS process, you receive a handoff package containing:

1. **Product Vision Document**
   - North star outcomes
   - Target users and use cases
   - Success metrics
   - Feature scope and priorities

2. **Data Model Specifications**
   - Entity schemas with field types
   - Relationships between entities
   - State transitions and lifecycle rules
   - Validation requirements

3. **Design System**
   - Color palette (primary, secondary, accent)
   - Typography scale
   - Spacing and layout rules
   - Component patterns

4. **Application Shell Design**
   - Navigation structure
   - Layout zones (header, sidebar, main content)
   - Responsive behavior
   - State management patterns

5. **Section Designs** (per feature area)
   - User requirements and acceptance criteria
   - Sample data for testing
   - Screen layouts and UI specifications
   - Component hierarchy
   - Interaction patterns

6. **Implementation Notes**
   - Technical dependencies
   - Integration points
   - Performance considerations
   - Security requirements

## Using Design OS with Different AI Systems

### With Gemini (Google AI Studio / Gemini API)

**Best Practices:**
1. **Initial Context Setting**
   ```
   I have a complete product specification from Design OS.
   I'll share the vision, data models, and design system first,
   then we'll implement section by section.
   ```

2. **Share Documents in Order**
   - Start with Product Vision
   - Share Data Model schemas
   - Share Design System specifications
   - Implement sections one at a time

3. **Leverage Gemini's Strengths**
   - Use grounding tools for research-heavy features
   - Use multimodal capabilities for image generation
   - Request JSON schema validation for data models

**Example Prompt:**
```
Context: I'm building SocialPilot AI based on a complete Design OS spec.

Product Vision: [paste vision doc]
Data Model: [paste schema]
Design System: [paste colors/typography]

Task: Implement the "Content Calendar" section with the following requirements:
[paste section requirements]

Please create the React component following these specs exactly.
```

### With OpenAI Codex / ChatGPT

**Best Practices:**
1. **Use Canvas Mode** (ChatGPT)
   - Paste design specs into canvas for persistent reference
   - Build components iteratively with spec visible

2. **Break Down Implementation**
   - Start with data layer (types/interfaces)
   - Then state management
   - Then UI components
   - Finally integration

3. **Leverage Code Interpreter**
   - Validate data structures against schemas
   - Generate sample data from specifications

**Example Prompt:**
```
I have a Design OS specification for [Feature Name].

Requirements:
[paste section requirements]

Data Schema:
[paste relevant entity schemas]

Design Specs:
[paste component layout and styling rules]

Please implement this following the exact specifications.
Start with TypeScript interfaces, then build the component.
```

### With Claude (Sonnet/Opus)

**Best Practices:**
1. **Provide Complete Context**
   - Claude excels with comprehensive specifications
   - Share entire Design OS export in initial context
   - Reference specific sections as you implement

2. **Use Artifacts Mode**
   - Request components as artifacts for easy editing
   - Iterate on design while maintaining spec alignment

3. **Leverage Planning Capabilities**
   - Ask Claude to create implementation plan from specs
   - Break down complex sections into subtasks

**Example Prompt:**
```
I'm implementing [Project Name] based on Design OS specifications.

[Attach or paste complete Design OS export]

Let's implement the [Section Name] feature. Please:
1. Review the section requirements
2. Create an implementation plan
3. Build the component following the exact design specs
4. Ensure data model alignment

Start with planning, then we'll build step by step.
```

### With Claude Code (CLI)

**Best Practices:**
1. **Use / Commands for Workflow**
   - `/commit` - Create commits after implementing spec sections
   - `/review-pr` - Review code against Design OS specs
   - `/help` - Get help with specific commands

2. **Reference Spec Files**
   - Keep Design OS exports in `/docs/design-os/`
   - Reference files in prompts for context
   - Use file paths in commit messages

**Example / Command Usage:**
```
Implement the Content Calendar section per docs/design-os/sections/content-calendar.md

[After implementation]
/commit
```

**Example Workflow:**
```
Read docs/design-os/vision.md and docs/design-os/data-model.md

Now implement the User entity with these specs:
- Fields: id, email, name, avatar, status
- Status enum: 'active' | 'pending' | 'suspended'
- Validation: email must be unique, name required

Create TypeScript interfaces first, then the database schema.
```

**Example PR Review:**
```
/review-pr 123

Context: This PR implements the Analytics Dashboard section.
Spec: docs/design-os/sections/analytics-dashboard.md

Please verify:
1. All data models match the spec
2. Design system colors are used correctly
3. Component structure follows the specified layout
```

### With GitHub Copilot

**Best Practices:**
1. **Create Spec Files in Repo**
   - Save Design OS exports as markdown in `/docs` folder
   - Copilot will use these as context for suggestions

2. **Use # Commands in Chat**
   - `#file` - Reference specific spec or code files
   - `#selection` - Reference selected code
   - `#terminalSelection` - Reference terminal output
   - `#codebase` - Search entire codebase

3. **Use Inline Comments**
   ```typescript
   // Design OS Spec: User entity with fields: id, email, name, avatar
   // Status: 'active' | 'pending' | 'suspended'
   interface User {
   ```

4. **Name Files Descriptively**
   - Match Design OS section names
   - Copilot learns patterns from file structure

**Example # Command Usage in Copilot Chat:**
```
#file docs/design-os/data-model.md
Generate TypeScript interfaces for all entities in this spec
```

```
#file docs/design-os/design-system.md #file src/components/Button.tsx
Update this button component to use the exact colors from our design system
```

```
#selection
Does this component implementation match the Design OS spec at
#file docs/design-os/sections/content-calendar.md ?
```

```
#codebase ContentItem
Show me all uses of ContentItem and verify they match the Design OS schema
```

**Workflow:**
1. Save all Design OS docs to `/docs/design-os/`
2. Create component files matching section names
3. Add spec comments at file top
4. Use `#file` commands to reference specs in Copilot Chat
5. Let Copilot suggest implementations with spec context

### With Cursor AI

**Best Practices:**
1. **Use .cursorrules File**
   - Add Design OS standards to project rules
   - Reference design system consistently

2. **@ Commands for Context**
   - `@docs` - Reference specific Design OS documents
   - `@folder` - Reference entire design-os docs folder
   - `@file` - Reference specific spec files
   - `@code` - Reference existing implementations

3. **Cmd+K with Context**
   - Select relevant spec text
   - Use Cmd+K to generate matching code

**Example @ Command Usage:**
```
@docs design_system.md @file ContentCalendar.tsx
Update this component to match the exact color specifications from our design system
```

```
@folder docs/design-os/sections
Review all section specs and create a feature implementation checklist
```

```
@code UserProfile.tsx @docs data-model.md
Does this component correctly implement the User entity schema?
```

**Example .cursorrules:**
```
# Design System Standards
- Primary color: #6366f1 (Indigo 500)
- Spacing scale: 4px base unit
- Typography: Inter for UI, Mono for code
- Component naming: PascalCase, descriptive

# Data Model Patterns
- All entities have: id, createdAt, updatedAt
- Status fields use string enums
- Relationships use explicit foreign keys

# Refer to /docs/design-os/ for complete specifications
```

## Universal Best Practices (All AI Systems)

### 1. Always Share Specs First
Never ask AI to "figure out" design decisions. Provide complete specifications upfront.

**Bad:**
```
Build me a social media dashboard with posts and analytics
```

**Good:**
```
Build a social media dashboard following these Design OS specs:
[paste complete specifications]
```

### 2. Implement in Phases

Follow Design OS's natural structure:
1. **Phase 1:** Data layer (types, interfaces, schemas)
2. **Phase 2:** State management and business logic
3. **Phase 3:** UI components (from Design System)
4. **Phase 4:** Integration and testing

### 3. Validate Against Specs

After each implementation:
- Compare output to Design OS specs
- Check data model alignment
- Verify design system consistency
- Test with sample data from specs

### 4. Use Spec-Driven Prompts

Structure every prompt with:
```
Context: [What you're building]
Spec: [Relevant Design OS section]
Task: [Specific implementation request]
Constraints: [Design system rules, data model requirements]
```

### 5. Maintain Source of Truth

- Keep Design OS exports updated
- Document deviations with rationale
- Reference spec locations in code comments

### 6. Iterative Refinement

Design OS specs are living documents:
- Start implementation
- Discover edge cases
- Update Design OS specs
- Re-export and share with AI
- Continue implementation

## Common Pitfalls to Avoid

### ❌ Vague Handoff
"Here's my Design OS export, build everything"
- Too broad, leads to interpretation errors

### ✅ Specific Handoff
"Implement the Content Calendar section following the attached spec. Focus on the calendar grid component first."

### ❌ Skipping Data Model
Starting with UI before defining data structures
- Leads to refactoring and mismatches

### ✅ Data First
Share schemas first, implement types/interfaces, then build UI

### ❌ Design System Drift
Letting AI "improve" or "modernize" the design
- Creates inconsistency

### ✅ Strict Adherence
"Use exactly these colors: Primary #6366f1, Secondary #8b5cf6"

### ❌ Missing Context
Sharing one section without product vision
- AI misses the "why" behind decisions

### ✅ Complete Context
Share vision + data model + design system + specific section

## Example: Full Integration Workflow

### Step 1: Complete Design OS Process
Run Design OS, work through all phases, export complete package

### Step 2: Organize Exports
```
/docs/
  /design-os/
    vision.md
    data-model.md
    design-system.md
    shell-design.md
    /sections/
      content-calendar.md
      persona-research.md
      analytics-dashboard.md
```

### Step 3: Initialize with AI System
```
I'm building [Project Name] using Design OS specifications.

Product Vision:
[paste or attach vision.md]

Data Model:
[paste or attach data-model.md]

Design System:
[paste or attach design-system.md]

I'll be implementing sections incrementally.
Please acknowledge you understand the overall architecture.
```

### Step 4: Implement Section by Section
```
Let's implement the Content Calendar section.

Requirements:
[paste content-calendar.md]

Tasks:
1. Create TypeScript interfaces for ContentItem entity
2. Build CalendarGrid component per design specs
3. Implement state management for calendar data
4. Add interaction handlers (select day, view post)

Start with task 1, then we'll proceed sequentially.
```

### Step 5: Validate and Iterate
- Test against sample data from Design OS
- Verify design system compliance
- Check data model alignment
- Refine specs if needed

### Step 6: Continue to Next Section
Repeat process for each Design OS section

## Advanced Tips

### Multi-AI Strategy
Use different AI systems for different strengths:
- **Gemini:** Research, grounding, image generation
- **Claude:** Complex planning, architecture decisions
- **Codex/Copilot:** Rapid component implementation
- **Cursor:** Real-time coding with spec context

### Spec Versioning
```
/docs/design-os/
  /v1/
  /v2/
  current -> v2/
```
Track Design OS iterations as product evolves

### Automated Validation
Create scripts that validate code against Design OS specs:
```typescript
// validate-data-model.ts
// Checks if implemented types match Design OS schemas
```

### Design OS as Tests
Convert specs into test cases:
```typescript
describe('ContentItem', () => {
  it('should match Design OS schema', () => {
    // Test based on exported schema
  });
});
```

### With Aider

**Best Practices:**
1. **Add Specs to Context**
   - Use `/add` to add Design OS docs to context
   - Keep specs visible throughout session

2. **/ Commands for Workflow**
   - `/add` - Add spec files to context
   - `/drop` - Remove files from context
   - `/diff` - Review changes against specs
   - `/commit` - Commit with spec references

**Example / Command Usage:**
```
/add docs/design-os/data-model.md docs/design-os/design-system.md

Now implement the ContentItem component following these specs exactly.
```

```
/diff
Review these changes against the Design OS specification
```

```
/commit
Implement ContentItem entity per Design OS spec
- Add TypeScript interface matching schema
- Include all required fields: day, type, topic, hook, caption
- Add status enum: Scheduled | Processing | Posted
```

**Workflow:**
```
# Start session with Design OS context
Please read docs/design-os/vision.md and docs/design-os/data-model.md

# Implement section
Build the Content Calendar component per docs/design-os/sections/content-calendar.md

# After implementation
/commit -m "feat: implement Content Calendar per Design OS spec"
```

## Command Reference Table

Quick reference for all @ and / commands across AI systems:

### Cursor AI - @ Commands
| Command | Purpose | Example |
|---------|---------|---------|
| `@docs` | Reference specific documentation | `@docs design-system.md What colors should I use?` |
| `@folder` | Reference entire folder | `@folder docs/design-os Review all specs` |
| `@file` | Reference specific file | `@file Button.tsx Update this component` |
| `@code` | Reference code symbol | `@code ContentItem Show all usages` |
| `@web` | Search the web | `@web Best practices for React hooks` |

### GitHub Copilot - # Commands
| Command | Purpose | Example |
|---------|---------|---------|
| `#file` | Reference file | `#file docs/design-os/data-model.md Generate interfaces` |
| `#selection` | Reference selected code | `#selection Does this match the spec?` |
| `#terminalSelection` | Reference terminal output | `#terminalSelection Explain this error` |
| `#codebase` | Search codebase | `#codebase ContentItem Verify schema usage` |

### Claude Code - / Commands
| Command | Purpose | Example |
|---------|---------|---------|
| `/commit` | Create git commit | `/commit` (after implementing a spec section) |
| `/review-pr` | Review pull request | `/review-pr 123` Check against Design OS specs |
| `/help` | Get help | `/help` Show available commands |

### Aider - / Commands
| Command | Purpose | Example |
|---------|---------|---------|
| `/add` | Add files to context | `/add docs/design-os/vision.md` |
| `/drop` | Remove files from context | `/drop old-spec.md` |
| `/diff` | Show changes | `/diff` Review against specs |
| `/commit` | Commit with message | `/commit` Implement feature per Design OS |
| `/undo` | Undo last change | `/undo` Revert to previous state |

### Universal Patterns

**Combining Commands:**
```
# Cursor
@docs design-system.md @file Button.tsx @code theme
Update Button to use theme colors from design system

# Copilot
#file design-system.md #file Button.tsx
Apply design system colors to this button component

# Claude Code
Read docs/design-os/design-system.md
Update src/components/Button.tsx to use the specified colors
/commit
```

**Multi-File Context:**
```
# Cursor
@folder docs/design-os/sections @folder src/components
Verify all components match their Design OS specs

# Copilot
#codebase component #file docs/design-os/sections/
List any components missing from the Design OS sections

# Aider
/add docs/design-os/sections/*.md src/components/*.tsx
Review all components against their specifications
```

**Validation Workflows:**
```
# Cursor
@code ContentItem @docs data-model.md
Does this implementation match the schema exactly?

# Copilot
#selection #file docs/design-os/data-model.md
Verify this code matches the ContentItem schema

# Claude Code
Compare the ContentItem interface in src/types.ts
against the spec in docs/design-os/data-model.md
List any discrepancies.
```

## Conclusion

Design OS transforms AI coding from "exploratory building" into "specification execution." By creating detailed specs first, you ensure:
- Consistent implementation across AI systems
- Reduced back-and-forth and refactoring
- Alignment between vision and code
- Professional, production-ready results

The key: **Design first, code second.** Let Design OS be your source of truth, and let AI systems be your implementation engine.

---

## Quick Reference Prompts

### Initial Context (Any AI)
```
I'm implementing [Project] based on Design OS specs.
Attached: vision, data model, design system, and section specs.
I'll request implementations section by section.
Please confirm you understand the architecture.
```

### Section Implementation (Any AI)
```
Implement [Section Name] per Design OS specs:
- Requirements: [paste]
- Data Model: [paste relevant entities]
- Design: [paste component specs]
Follow specs exactly. Start with data layer.
```

### With @ Commands (Cursor)
```
@docs vision.md @docs data-model.md @docs design-system.md
Review the complete Design OS specification for this project.

@folder docs/design-os/sections @file src/components/ContentCalendar.tsx
Implement the Content Calendar section following the exact specifications.
```

### With # Commands (Copilot)
```
#file docs/design-os/sections/analytics.md
Create the Analytics Dashboard component matching this spec exactly.

#selection #file docs/design-os/data-model.md
Does this implementation match the Design OS schema?
```

### With / Commands (Claude Code, Aider)
```
Read docs/design-os/vision.md and docs/design-os/data-model.md
Implement the User authentication flow per specs
/commit

# Aider-specific
/add docs/design-os/*.md
Review all specs and create an implementation checklist
```

### Validation Check (Any AI)
```
Review this implementation against Design OS specs:
[paste code]
Design OS Spec: [paste relevant spec section]
Does it match exactly? What deviations exist?
```

### Refinement Request (Any AI)
```
This component doesn't match Design OS specs:
Issue: [describe mismatch]
Spec: [paste correct spec]
Please update to match specification exactly.
```
