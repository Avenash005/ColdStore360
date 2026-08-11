---
name: ColdStore360 Logistics
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45464d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#0b1c30'
  on-tertiary-container: '#75859d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  mono-sm:
    fontFamily: jetbrainsMono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  container-padding: 24px
  element-gap: 12px
  row-height-sm: 32px
  row-height-md: 44px
  sidebar-width: 240px
---

## Brand & Style
The design system is engineered for industrial precision and high-utility warehouse management. The personality is authoritative, systematic, and purely operational. Drawing inspiration from high-performance developer tools, the style focuses on "Functional Minimalism"—where every pixel serves a purpose in data density and workflow efficiency.

The visual direction avoids decorative flourishes. Instead, it leverages strict alignment, hairline borders, and a monochromatic foundation to ensure that critical inventory data remains the primary focus. The emotional response should be one of control, reliability, and technical competence.

## Colors
The palette is rooted in a "Utility-First" philosophy. The primary Navy/Charcoal is reserved for high-level navigation and primary actions to anchor the layout. The background uses a subdued cool gray to reduce eye strain during prolonged operational use.

Semantic colors are used with restraint; they should only appear to signal status changes, discrepancies, or system health. Neutral grays are tiered to create subtle separation between table headers, row zebra-striping, and sidebar backgrounds without introducing heavy visual weight.

## Typography
Inter is the workhorse of this design system, chosen for its exceptional legibility in data-heavy environments. To maintain high information density, font sizes are slightly smaller than average consumer apps, favoring a compact vertical rhythm.

- **Scale:** Use `body-sm` (13px) for primary table data and sidebars.
- **Emphasis:** Use semi-bold (600) for headers to create hierarchy without needing large size increases.
- **Monospace:** Use `jetbrainsMono` for SKU codes, lot numbers, and billing IDs to ensure character distinction (e.g., distinguishing "0" from "O").

## Layout & Spacing
The layout employs a structured, fixed-sidebar fluid-content model. Information density is prioritized, using a 4px baseline grid. 

- **Data Tables:** These are the core of the experience. Use a 12-column grid within the main content area. Table rows should have a fixed height (44px for standard, 32px for compact views) to ensure predictability during scrolling.
- **Margins:** Maintain a consistent 24px padding around the main viewport. 
- **Breakpoints:** 
  - Mobile (<768px): Sidebar collapses into a drawer. Padding reduces to 16px.
  - Tablet (768px - 1280px): Sidebar icons only (narrow state).
  - Desktop (>1280px): Full sidebar with labels.

## Elevation & Depth
This system eschews traditional shadows in favor of **Tonal Layering** and **Hairline Outlines**. 

- **Level 0 (Background):** Subdued Cool Gray (#F8FAFC) - The base canvas.
- **Level 1 (Surface):** Pure White (#FFFFFF) - Used for cards, table rows, and main content blocks. Defined by a 1px border (#E2E8F0).
- **Level 2 (Overlays):** Used for dropdowns and modals. These use a very subtle, sharp shadow (0px 4px 6px -1px rgba(0,0,0,0.1)) combined with a 1px border to ensure separation from the content below.
- **Separators:** Use 1px borders rather than gaps to define sections within a single surface.

## Shapes
The shape language is "Soft-Square." This creates a professional, structural feel that maximizes internal space for text within buttons and inputs.

- **Standard Elements:** (Inputs, Buttons, Cards) 0.25rem (4px).
- **Small Elements:** (Status Tags, Small Badges) 0.125rem (2px).
- **Special Elements:** Search bars and secondary pills may use `rounded-lg` (8px), but should never be fully circular/pill-shaped to maintain the serious industrial tone.

## Components

### Data Tables
Tables must feature fixed headers and a "hover" state for rows (#F1F5F9). Columns containing SKU numbers or financial figures should use the Monospace font variant. Use subtle horizontal dividers; vertical dividers are omitted to allow for better horizontal scanning.

### Status Badges
Status badges are compact and use a "Tinted-Fill" style: a light background color with high-contrast text of the same hue (e.g., Success: Light Green background with Deep Green text). No borders on badges.

### Input Fields
Inputs use a white background, 1px border (#E2E8F0), and 14px text. The active/focus state is a 1px solid blue (#3B82F6) with a subtle 2px blue outer glow (0% blur) to mimic "focus rings" from technical documentation.

### Buttons
- **Primary:** Deep Navy (#0F172A) with white text. No gradient.
- **Secondary:** White background with 1px border (#E2E8F0) and Charcoal text.
- **Tertiary:** Ghost style; no border or background until hover.

### Metric Blocks
Used for dashboard summaries (e.g., "Total Pallets," "Cooling Efficiency"). These are simple cards with a top-aligned label (label-md, 500 weight) and a large display value. Avoid icons unless they provide unique semantic meaning.