# Kanso: The Philosophy of Mindful Finance

This document serves as the "Soul & Blueprint" of the Kanso personal finance tracker. It captures the design philosophy, technical architecture, and the specific "thinking style" required to maintain and evolve the application.

---

## 1. Core Mission & Philosophy
Kanso (簡素) is the Zen principle of **simplicity** and the elimination of clutter. Unlike traditional finance apps that induce anxiety through "red" alerts and strict budgeting, Kanso is designed to be a **mindful journal of energy flow**.

### The "No-Budget" Rule
*   **Philosophy**: Budgets are restrictive and often lead to guilt. 
*   **Kanso Way**: Instead of budgets, we use **Vessels**. Money is "energy" that rests in different containers (Foundation, Joy, Growth, etc.). We don't "spend against a limit"; we "release energy from a vessel."

### Mindfulness over Statistics
*   **The Narrative Input**: Transactions are entered as sentences ("I am recording an expense of..."). This forces the user to pause and acknowledge the action.
*   **Mist Deletion**: Deletion isn't instant; it's a "mist" that fades away, allowing a moment to undo (regret/rethink).
*   **Patience Queue**: Desires are not "Wishlists." They are placed in a queue to "cool down." Time kills impulsive spending.

---

## 2. Design System & Aesthetics
Kanso must feel like a quiet room, not a spreadsheet.

### Color Palette (The Earth Tones)
*   **Paper (`#FAFAF8`)**: The canvas. Never pure white.
*   **Ink (`#2C2C2A`)**: The primary text. Sharp but soft.
*   **Sage (`#8BA888`)**: Growth, income, and "Flowing" states.
*   **Sand (`#E8E5DF`)**: Borders and subtle dividers.
*   **Stone (`#D1D0C9`)**: De-emphasized text and placeholders.

### Typography
*   **Serif**: `Cormorant Garamond`. Used for headers, quotes, and primary numbers ($). It evokes the feel of an old ledger or a poetry book.
*   **Sans**: `Inter`. Used for functional UI, labels, and secondary data for clarity.

### Animations (The "Breath")
*   Use `animate-fade-in` and `animate-slide-up-slow`.
*   Interactions should feel slow and intentional, never "snappy" or aggressive.

---

## 3. Technical Architecture (v1.1.0)

### State Management: The "Single Source of Truth"
*   **KansoContext**: All application state (Transactions, Vessels, Rhythms, Patience Queue) is centralized here.
*   **Zero Prop Drilling**: Components must consume state and handlers via the `useKanso()` hook.
*   **Persistence**: Data is persisted to `localStorage` via a custom `useLocalStorage` hook.

### Component Logic
*   **App.jsx**: A pure routing shell. It should contain almost zero business logic.
*   **SankeyChart**: Extracted as a pure visualization component. It converts flat transaction data into a Recharts-compatible Sankey link-node structure.
*   **Insights**: Focuses on "Tea Time" reflections (poetic summaries) and the "Smart Flow Score" (a holistic mindfulness metric).

---

## 4. Feature-Specific Logic

### Smart Flow Score
A 0–100 score that measures "Mindfulness," not wealth.
*   **+20**: Savings Rate ≥ 20%.
*   **+10**: Using the Patience Queue (restraint).
*   **+10**: Allocating to Vessels (intentionality).
*   **-10**: Spending more than the current balance (instability).

### Kanso Rhythms
Recurring expenses are "Rhythms." They are predictable currents. In the UI, they should be presented as steady pulses, not "bills."

### Midnight Zen (Dark Mode)
A total inversion of the palette.
*   **Paper** becomes a deep charcoal (`#1A1A19`).
*   **Ink** becomes the soft sand color.
*   **Class-based**: Controlled by the `.dark` class on the `body` element.

---

## 5. Thinking Style for Future AI
When working on Kanso, adopt this mindset:
1.  **Non-Judgmental**: If the user spends too much, don't use red. Use "Cloudy" or "Unstable" language.
2.  **Poetic Context**: Every page should have a small "Zen Koan" or mindful description (e.g., "Money is energy in transit").
3.  **Sentential UI**: Prefer text-based inputs over complex forms with many dropdowns.
4.  **Detail on Detail**: Every margin, every border-color, and every animation delay matters. The "Kanso feel" is fragile; too much clutter breaks it.

---

## 6. Migration Checklist
If moving to a new AI/Environment:
*   [ ] Copy `KansoContext.jsx` first; it's the heart.
*   [ ] Ensure `index.css` has the `@theme` and `@keyframes` definitions.
*   [ ] Keep the `Lucide` icons consistent (strokeWidth={1.5} for that thin, elegant look).
*   [ ] Do not add "Features" that add complexity. Every new feature must be evaluated for "Simplicity."
