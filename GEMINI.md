# Project Rules & Design System Guidelines

## Core Visual & UI Principles

1. **Strictly Light Mode (No Dark UI)**:
   - Always use a crisp, bright, clean aesthetic.
   - Canvas & Cards: Pure white (`#FFFFFF`) base with soft, high-clarity slate accents (`#F8FAFC`, `#F1F5F9`).
   - Borders: Subtle, crisp borders (`#E2E8F0`) for clean structural definition.
   - Typography: Deep charcoal slate (`#0F172A`) for optimal readability and contrast.
   - Never generate dark mode, dark backgrounds, or gloomy enterprise grey-on-black palettes.

2. **Ultra-Professional, Modern & Active**:
   - Inspired by the best modern SaaS designs (Apple, Stripe, modern Odoo 18, Linear).
   - Dynamic and engaging: modern micro-interactions, clean cards with soft elevation shadows, crisp iconography.
   - Keyboard accessible (`Ctrl+K` command launcher, fast breadcrumb navigation).

3. **Vibrant & Colorful Component System**:
   - **Module Identities**:
     - 🟣 **Sales / CRM**: Royal Violet & Indigo (`#6366F1`, `#8B5CF6`)
     - 🟢 **Invoicing & Accounting**: Vibrant Emerald & Mint (`#10B981`, `#059669`)
     - 🟠 **Inventory & Logistics**: Sunburst Amber & Tangerine (`#F59E0B`, `#EA580C`)
     - 🔵 **Purchases & Supply**: Electric Sky & Cobalt (`#0EA5E9`, `#2563EB`)
     - 🔴 **Manufacturing (MRP)**: Vivid Coral & Rose (`#F43F5E`, `#E11D48`)
     - 🌸 **HR & People**: Bright Fuchsia & Magenta (`#EC4899`, `#D946EF`)
   - **Status Badges & Pills**:
     - Success / Confirmed / Won: Vivid Emerald with soft glow
     - Active / In Progress / Sent: Vibrant Sky Blue / Cobalt
     - Warning / To Approve / Pending: Warm Amber / Marigold
     - Danger / Cancelled / Lost: Vivid Coral / Ruby
     - Draft / New: Crisp Indigo / Neutral Slate
   - **Smart Buttons & Metric Cards**: Light pastel tinted backgrounds with saturated icon accents.
   - **Chatter & Activities**: Colorful user avatars and color-coded activity type pills (Calls, Meetings, Emails, Notes).

4. **ERP Core View Archetypes**:
   - **List View**: Rich data table with column sort, filters, bulk selection, inline editing.
   - **Kanban View**: Visual pipeline columns with stage summary badges and drag handles.
   - **Form View**: Action bar header, status pipeline ribbon, smart stat cards, tabs, and right-hand chatter stream.
   - **Dashboard**: Metric cards with sparklines, charts, and activity summaries.
