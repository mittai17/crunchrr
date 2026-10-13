---
name: crunchrr
description: A neutral life workspace with a black icon rail and lime/yellow analytics.
colors:
  primary: '#b8ed30'
  background: '#f4f4f4'
  surface: '#fff'
  elevated: '#f5f5f5'
  text: '#151515'
  muted: '#72727e'
  border: '#e9e9e9'
  soft-purple: '#effbc9'
  soft-blue: '#f4f9e5'
  ink-action: '#111'
  lime: '#cdff4b'
  yellow: '#ffcb06'
  cream: '#fff7da'
  lime-contour: '#d0ff4e'
  lime-contour-mid: '#e2ff8d'
  lime-contour-light: '#efffbd'
  yellow-contour: '#ffbf00'
  yellow-contour-mid: '#ffdc68'
  yellow-contour-light: '#fff2c6'
  promotion-yellow: '#ffca06'
  completed-text: '#397c20'
  progress-text: '#8c6400'
  danger-bg: '#fff0f1'
  danger-text: '#d9314d'
  dark-primary: '#c5f353'
  dark-background: '#181a17'
  dark-surface: '#252821'
  dark-elevated: '#2d3029'
  dark-text: '#f4f5ed'
  dark-muted: '#b0b5a4'
  dark-border: '#3d4137'
  dark-soft-purple: '#374325'
  dark-soft-blue: '#303a25'
  rail-active: '#edffc0'
  rail-focus: '#d3ff54'
  calendar-sidebar: '#090909'
  calendar-inset: '#1c1c1c'
  calendar-lime: '#e3fa81'
  calendar-green: '#daf3cf'
  calendar-blue: '#d6e8ef'
  calendar-lavender: '#d2c8ef'
  event-work: '#c9b8f0'
  event-work-text: '#413254'
  event-personal: '#d9e9ec'
  event-personal-text: '#2f5358'
  event-education: '#e9e8e8'
  event-education-text: '#4e4a52'
  calendar-focus: '#759425'
  preview-action: '#edf7d4'
  preview-action-text: '#34451b'
typography:
  display:
    fontFamily: Inter, ui-sans-serif, system-ui, sans-serif
    fontSize: clamp(23px, 2.1vw, 29px)
    lineHeight: 1.15
    fontWeight: 650
    letterSpacing: -.035em
  headline:
    fontFamily: Inter, ui-sans-serif, system-ui, sans-serif
    fontSize: 26px
    lineHeight: 1.2
    fontWeight: 650
    letterSpacing: -.04em
  title:
    fontFamily: Inter, ui-sans-serif, system-ui, sans-serif
    fontSize: 17px
    fontWeight: 600
    letterSpacing: -.025em
    lineHeight: 1.15
  body:
    fontFamily: Inter, ui-sans-serif, system-ui, sans-serif
    fontSize: 13px
    fontFeature: '''cv11'', ''ss01'''
  label:
    fontFamily: Inter, ui-sans-serif, system-ui, sans-serif
    fontSize: 11px
    fontWeight: 550
  calendar-title:
    fontFamily: Inter, ui-sans-serif, system-ui, sans-serif
    fontSize: 18px
    fontWeight: 600
    letterSpacing: -.025em
  event-title:
    fontFamily: Inter, ui-sans-serif, system-ui, sans-serif
    fontSize: 11px
    fontWeight: 500
    lineHeight: 1.25
rounded:
  field: 7px
  control: 8px
  widget-option: 14px
  month-row: 18px
  dialog: 22px
  header-pill: 24px
  card: 25px
  phone-card: 26px
  analytics-card: 30px
  phone-stat: 35px
  placeholder: 40px
  stat: 42px
  canvas: 35px
  rail: 36px
  rail-item: 14px
  planner: 24px
  calendar-inset: 16px
  weekday: 12px
  event: 11px
  preview: 18px
spacing:
  compact: 7px
  row-gap: 9px
  control: 13px
  grid-row: 15px
  grid-column: 17px
  analytics-card: 18px
  large-grid: 20px
  dialog: 23px
  planner-gap: 9px
  planner-pad: 9px
  event-padding: 11px 9px
  preview-padding: 22px 19px 16px
components:
  button-primary:
    backgroundColor: '{colors.ink-action}'
    textColor: '#fff'
    rounded: '{rounded.control}'
    padding: 8px 13px
    typography: '{typography.label}'
  button-secondary:
    backgroundColor: '{colors.elevated}'
    textColor: '{colors.text}'
    rounded: '{rounded.control}'
    padding: 8px 13px
  button-ghost:
    backgroundColor: transparent
    textColor: '{colors.text}'
    rounded: '{rounded.control}'
    padding: 8px 13px
  button-danger:
    backgroundColor: '{colors.danger-bg}'
    textColor: '{colors.danger-text}'
    rounded: '{rounded.control}'
    padding: 8px 13px
  input:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    rounded: '{rounded.field}'
    padding: 10px 11px
  navigation:
    backgroundColor: transparent
    textColor: '#ddd'
    rounded: '{rounded.rail-item}'
    height: clamp(22px, calc((100dvh - 155px) / 22), 35px)
    width: 36px
  badge:
    backgroundColor: '{colors.elevated}'
    rounded: 5px
    padding: 5px 7px
  card:
    backgroundColor: '{colors.surface}'
    rounded: '{rounded.card}'
    padding: 14px
  life-graph-row:
    backgroundColor: '{colors.elevated}'
    rounded: '{rounded.control}'
    padding: 8px
  button-primary-hover:
    backgroundColor: '#333'
  analytics-card:
    backgroundColor: '{colors.surface}'
    rounded: '{rounded.analytics-card}'
    padding: '{spacing.analytics-card}'
  metric-card:
    backgroundColor: '{colors.surface}'
    rounded: '{rounded.stat}'
  header-pill:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    rounded: '{rounded.header-pill}'
    padding: 7px 13px
    height: 35px
  calendar-event-work:
    backgroundColor: '{colors.event-work}'
    textColor: '{colors.event-work-text}'
    rounded: '{rounded.event}'
    padding: '{spacing.event-padding}'
    typography: '{typography.event-title}'
  calendar-event-personal:
    backgroundColor: '{colors.event-personal}'
    textColor: '{colors.event-personal-text}'
    rounded: '{rounded.event}'
    padding: '{spacing.event-padding}'
  calendar-event-education:
    backgroundColor: '{colors.event-education}'
    textColor: '{colors.event-education-text}'
    rounded: '{rounded.event}'
    padding: '{spacing.event-padding}'
  calendar-preview:
    backgroundColor: '{colors.surface}'
    textColor: '#1b1d1a'
    rounded: '{rounded.preview}'
    padding: '{spacing.preview-padding}'
    width: 285px
---

# Design System: crunchrr

## Overview

**Creative North Star: "Neutral Chrome, Fresh Analytics"**

The latest user-supplied actual UI supersedes the earlier scenic purple dashboard. Its visual world is a pale gray rounded canvas with a continuous compact black rail containing all 22 modules, a white geometric mark, neutral functional controls, and fresh lime/yellow analytics. Inter remains the requested typeface.

Large, soft corners and layered contour geometry make the dense charts and notes table approachable. Black chrome anchors the page; lime and yellow belong primarily to data, progress, and feature accents. The tilted yellow promotion is a deliberate reference-native shape, not a template for all cards.

**Key Characteristics:**

- Continuous full-module black rail and white geometric mark
- Gray canvas with white rounded surfaces
- Lime/yellow layered contours, chart segments, and progress
- Dense notes table and navigable relationship details
- Responsive controls with explicit phone space

Evidence: `calendar.css` loaded after `reference.css` and `globals.css`; `calendar-workspace.tsx`, `calendar-layout.ts`, and the approved `.impeccable/calendar-direction.md` extend the incumbent system; `analytics-dashboard.tsx`, `logo.tsx`, `workspace.tsx`, shared button/dialog/form styles, PRODUCT.md, the revised direction, and `.impeccable/review/reference.png`, `desktop.png`, and `mobile.png`. The dashboard reference capture shows the supplied 924×678 topology. The calendar extension is evidenced by `sidebar-reference.png` and `calendar-{desktop,reference,preview,mobile,day-mobile,compact}.png` in the same review directory; refreshed compact and Week/Day phone captures confirm calendar-owned scrolling and the fluid Day adaptation; source records the preview focus behavior. Captures verify the light web design; dark colors below are source-evidenced. Native Expo is independently implemented and not visually verified here.

## Colors

The reusable palette is gray, white and near-black with lime/yellow energy. Frontmatter is normative; the lime/yellow contour steps are actual SVG fills, not an invented gradient scale.

### Primary

- **Ink Action** (`ink-action`): filled primary buttons use black with white text; hover becomes #333.
- **Fresh Lime** (`primary`, `lime`): progression, widget addition, selected statistics and accents. The source's reusable variable and the reference accent are nearby distinct greens, preserved as implemented.
- **Lime Contours** (`lime-contour`, `lime-contour-mid`, `lime-contour-light`): the three nested right-side metric shapes.

### Secondary

- **Warm Yellow** (`yellow`, `promotion-yellow`): tracked-time segments, task metric contours and tilted promotional panel. `yellow-contour` through `yellow-contour-light` are the actual nested SVG fills.
- **Cream** (`cream`): character of the teamwork plane; the actual panel is a white-to-#fff4cf radial gradient.
- Completed and in-progress statuses use the corrected dark green and ochre text tokens, paired with written labels and distinct icons.

### Neutral

- **Gray Ground** (`background`), **White Surface** (`surface`), **Quiet Inset** (`elevated`): page, card and secondary planes.
- **Black Text** (`text`), **Gray Context** (`muted`), **Soft Divider** (`border`): content hierarchy and table structure.
- Legacy variable names `soft-purple` and `soft-blue` now resolve to pale green tones; preserve these source names when binding variables.
- `dark-*` values map to olive-charcoal canvas/surfaces, pale text and muted gray-green context. Dark primary buttons and active rail tiles use lime with black text. No dark screenshot approval is implied.

### Named Rules

**The Neutral Chrome Rule.** Keep the shell, rail and ordinary controls neutral; concentrate lime and yellow in analytics, progress and contextual accents.

## Typography

**Display Font:** Inter, ui-sans-serif, system-ui, sans-serif.
**Body Font:** The same stack; local font imports cover 400, 500, 600, 700 and 800. CSS requests intermediate weights as shipped.

**Character:** Clean, compact and numeric. Tabular numerals stabilize tracked hours, dates, percentages and duration columns; global cv11 and ss01 feature settings remain enabled.

### Hierarchy

- **Display:** metric values use clamp(23px, 2.1vw, 29px), 650 weight, 1.15 line-height and -.035em tracking. Phone values are 24px.
- **Headline:** greeting uses 26px, 650, 1.2 and -.04em; 24px at compact desktop/tablet, 28px phone, 29px at large desktop.
- **Title:** analytics headings use 17px/600/1.15; large desktop 20px, phone completion/teamwork 21px and notes 19px.
- **Body:** root remains 13px, with 14px at inherited phone/large-desktop rules. Greeting context is 14px; main metric context 14px, 12px phone.
- **Label:** header pills 11–12px, table titles 11px/550, weekday labels 12px, row data 10–11px. At large desktop row data becomes 12px and note titles 13px. Phone note titles are 12px, statuses/durations 10px.

The 7–9px tooltip/demo/supporting metadata in the reference recreation is observed density, not a future legibility floor.

## Layout

The desktop application fills the viewport inside a 35px rounded canvas with a 2px gray outer border and inner white edge. The workspace scrolls independently. Its left margin is 80px with 9px left padding. The continuous 60px black rail is inset 7px from the top and left and fills calc(100dvh - 14px), with 36px corners. Its white mark occupies a 55px top brand region within the same rail; all 22 modules remain accessible below it. The greeting occupies the left header area; Home, Add tasks, Search, notifications and clock/date occupy the rest. The header is 57px tall with a responsive left reserve.

The dashboard uses four columns (1fr 1fr .8fr 1.35fr), with 15px row and 17px column gaps. The top row holds two metrics, a dashed widget placeholder and the tilted promotion. Work chart and notes table span the first three columns; completion and teamwork occupy the fourth. Base rows use clamp(140px,15.2vw,180px), clamp(228px,24.7vw,300px), and minmax(200px,230px).

- **1450px and above:** 20px gaps, rows 180px/310px/240px, larger 23px card padding and type.
- **1120px and below:** compact header and grid spacing; between 901px and 1120px, rows are 140px/228px/200px to reproduce the supplied reference viewport. Footer is hidden in this band.
- **900px and below:** 77px workspace margin and the same 60px full rail, three-column grid. The chart spans all columns; completion spans two beside teamwork; promotion moves into a centered later row and notes follow. Clock/date context reduces to the time pill.
- **639px and below:** rail disappears; outer canvas has square edges, natural page scrolling and no outer border. Header retains Add tasks, Search, notifications and time. Greeting moves into normal flow. Two metrics share a row; placeholder and promotion share the next. Chart, completion, notes and teamwork span both columns in successive rows. Gaps are 17px/13px. Final row heights begin 150px/135px/350px, followed by auto rows. The chart reserves 105px above its plot for the 44px unit/menu controls; its control panel is positioned -90px relative to the plot, within that reserved upper space. Notes hide the date column and retain type/status/duration/actions. Optional extra widgets become one column.

Phone bottom navigation stays fixed and includes Home, Calendar, Tasks, Search and More. Quick Add is a 54px round action in normal flow after the card content, with right alignment and a 90px bottom margin; it no longer overlaps chart/table controls. Phone dialogs become bottom sheets with 24px top corners and a 93dvh limit. Shared entity inputs use 44px minimum height and 16px text. Calendar-specific scrolling and responsive rules are described below; the old generic calendar layout no longer defines this surface.


### Calendar Layout Extension

Calendar uses a separate 195px black filter column and a flexible main planner, with 9px gap and height calc(100dvh - 103px). The top header is 49px tall; calendar workspace top/right padding is 16px/17px. The secondary column has 24px corners and its own scroll. A lime→green→blue→lavender gradient frames the main planner, also at 24px corners, with 9px inset padding. Week starts Monday. The main white grid owns vertical and horizontal scrolling, contains sticky weekday headers and a sticky 48px time gutter, and measures 76px per hour over 24 hours. It initially scrolls to the morning. Week has an 840px minimum width to retain legible overlapping names; Day removes the minimum and remains width-fluid.

- **1200px and above:** view controls sit beside date navigation with 14px left separation.
- **1120px and below:** filter column reduces to 170px, date heading to 16px and controls wrap with an 87px top reserve.
- **640–900px:** filter column is 152px, workspace margin 77px, planner top reserve 100px; the seven-day grid scrolls inside the calendar.
- **639px and below:** calendar workspace has no rail margin and uses 14px 12px 0 padding. A 44px Filters action opens the black filter panel as a local overlay spanning calc(100vw - 24px). The planner stacks with height calc(100dvh - 173px), minimum 480px, 21px main corners and 7px padding. Date/view/add controls have 44px heights; mini-month days, filter rows and people buttons also expand to 44px. Week preserves its owned 840px horizontal scroll, while Day provides a fluid single-column alternative. Event blocks have a 44px minimum height. The preview becomes a bottom panel inset 12px and positioned 79px above the viewport bottom; Quick Add outside the calendar is hidden here.

Month and Agenda remain alternate views inside a white scrolling panel. Month preserves local overflow for its calendar board, rather than expanding the page. These calendar adaptations extend the existing dashboard layout without replacing its card grid.

## Elevation & Depth

The design uses near-flat diffuse shadows, white-on-gray tonal layering, nested colored SVG shapes, inset gloss on bar segments, and soft radial card gradients. Rotation is confined to the featured yellow promotion. Dashed boundaries identify the configurable placeholder and one metric contour, rather than forming a universal card border.

### Shadow Vocabulary

- **Shared card:** `0 5px 20px rgba(0,0,0,.025)`.
- **Analytics panel:** `0 5px 20px rgba(0,0,0,.015)`. Tonal separation carries these panels in the artifact.
- **Small chart controls:** `0 3px 15px #00000008`.
- **Chart value label:** `0 3px 4px #0000001c`.
- **Dialog:** inherited `0 20px 70px #13163225`, with 3px overlay blur.
- **Calendar preview:** `0 8px 35px rgba(34,31,40,.13)`; a floating detail plane distinct from the hour grid.
- **Event hover/active:** `0 4px 10px rgba(32,31,45,.12)` with brightness(.98).
- **Phone Quick Add:** `0 5px 18px #2636001c`.

Inherited button state transitions are .18s, navigation .15s, dialog fade .16s and workspace opacity .2s. The data curve disables Recharts animation. Reduced motion disables CSS animation/transitions and the workspace duration. Loading retains the inherited 1.7s skeleton shimmer outside reduced motion.

## Shapes

The outer 35px canvas contains large, softly rounded geometry: 42px metric cards, 40px dashed placeholder, 30px analytics panels, 25px shared module cards and 24px header pills. Phone metrics use 35px corners and analytics panels 26px. The promotion rotates -10deg desktop/-8deg phone inside a separate white backing, with an overlapping circular arrow. The continuous rail has 36px corners and 14px navigation corners; status discs, arrows and avatars remain circular. Monthly progress rows have 18px corners; chart segments have 7px corners and small vertical gaps. Shared controls remain 8px and fields 7px.

## Components

### Buttons

Shared primary buttons are black/white with no purple action shadow; hover is #333. Secondary uses elevated fill, inset border and pale green hover. Ghost is transparent. Danger retains its inherited pink/red treatment for destructive actions. Shared padding is 8px 13px with 36px minimum height; phone form actions become 44px. Header Add tasks is its own white 24px pill variant. Arrow buttons use lime or cream circles. Disabled controls retain .5 opacity.

### Chips / Status

Work-value labels are black with white hour/minute text and softened asymmetric corners. The hours/minutes segmented control has a gray backing and a yellow selected pill with corrected dark text. Notes statuses combine a green completion icon, numeric progress icon, or amber pending ring with written status. Reusable data badges remain inherited tonal chips, rather than dashboard navigation controls.

### Cards / Metrics

Analytics cards use white surfaces and oversized corners. Metric cards cut a circular recess from the upper-left edge behind a colored clock/task token; three nested SVG contour shapes fill the upper-right area. The complete metric surface navigates to tasks. The dashed widget placeholder opens a chooser; selecting saves a `show:*` workspace preference and adds a connected panel below the core dashboard. Widget removal saves the updated preference.

**The Contour Family Rule.** Preserve the curved layered contours of the metric cards and the segmented weekday bars as the dashboard signature.

### Inputs / Fields

Entity forms retain surface fill, theme borders, 7px corners, 10px 11px padding and 38px minimum height; phone fields are 44px with 16px text. Errors use alert semantics and a tinted recovery panel. Search opens the existing command dialog. Quick Add still previews natural-language interpretation before creation. The revised shell suppresses the visible keyboard shortcut badge while retaining keyboard command behavior.

### Navigation / Identity

The continuous rail uses a near-black gradient, pale 17px SVG icons and 36px-wide navigation rows. All 22 modules are rendered, with vertically compact rows at clamp(22px, calc((100dvh - 155px) / 22), 35px). Navigation can scroll locally on shorter displays. Active rows use a pale-lime rounded tile and black icon; hover becomes charcoal. The dashboard icon is filled while other active icons remain outline. A 2px lime focus ring with 2px offset makes keyboard position visible. The white geometric double-chevron mark shares the continuous rail with the profile control; the former detached logo circle and exit control are superseded. More on phone opens a labeled module dialog. The lowercase wordmark remains available in Logo markup but is hidden within the desktop rail.

### Work Chart

Seven weekday columns combine stacked rounded lime/yellow segments, black value bubbles and a smooth 5px yellow-to-lime natural curve. Segment count is derived from tracked hours and capped at six; the curve is independently plotted from actual daily totals. Clicking bars navigates to tasks. Unit controls switch written values between hours and minutes. Empty data overlays an explicit first-session action. Phone layout reserves enough upper space for the enlarged controls rather than overlaying them on the plotted values.

### Completion / Teamwork

Completion uses a white-to-lime radial plane, black icon with lime corner dot, white monthly rows, a lime highlighted row and labeled rounded progress meters. Teamwork uses a cream radial plane, three white capsule columns with yellow/lime/green fills, percent text, circular portraits and names; each opens its person record. User portrait URLs come from entity data, with initial fallbacks. The three reference demo portraits use bundled files in `apps/web/public/demo`, with provenance in its README.

### Notes / Life Graph

The notes table has aligned type/date/status/duration/action columns and fine horizontal separators. Type tiles distinguish the three visible notes. Title, status and overflow controls open the record. Detail dialogs preserve editable typed data, markdown, relationship context, linked navigation and unlink/connect controls; link search selects related records. Graph context is rendered as navigable rows, not a node-map diagram.

**The Connected Context Rule.** Present linked records with entity type and relationship context, and keep them navigable from the detail surface.

### Calendar / Event Preview

The calendar combines a synchronized mini month, Events/Daily tasks/Birthdays visibility, Work/Personal/Education category filters, a collapsible Favorites group, New event action and overlapping people portraits. Current Week is the default; Today, previous/next period, mini-month date selection and Month/Week/Day/Agenda controls update the same selected date. Selection is indicated with written/date context and aria-pressed, alongside color.

The rounded weekday tiles sit on the gradient band with large date numbers (25px desktop, 23px phone); the selected day is white with lavender text. White hour cells have fine gray lines. Work events use purple, Personal pale blue and Education gray, with darker matching ink. Event positions and heights derive from start/end time; overlaps receive consistent columns within each temporal cluster, including clipping to day boundaries. Ordinary titles use an intact two-line clamp; overlapping titles use one-line ellipsis instead of syllable wrapping, and secondary location text is hidden first. Visible event names precede time/location metadata. Longer events can show linked attendee portraits.

Selecting an event opens a floating 285px white preview with 18px corners, title, category chip, date/time/location/description, favorite action and View & edit event. Open focuses its close button; explicit close and Escape return focus to the triggering event. Outside pointer interaction dismisses the preview. On phone its close, edit and favorite actions have 44px heights. Saving favorites persists the `favorite` entity tag and feeds the filter-column list; category filters are current view state, not a claim of persisted preferences.

An empty hourly cell opens event creation with its date/time; arrow keys move between day/hour slots. Dragging reschedules the saved event while preserving its duration and due time. Editing remains available through preview/details, so rescheduling does not rely exclusively on drag. The calendar and preview use 2px olive focus outlines with 2px offsets, and event transitions are .15s ease, disabled by reduced motion.

**The Event Name First Rule.** Preserve event-name readability before location, attendees or other secondary detail; use calendar-owned scrolling and a Day alternative where seven columns cannot fit.

### Assets / Sample Context

The current dashboard uses inline SVG mark, contour paths and Lucide icons; it has no scenic raster background. The older `hero.webp` remains in welcome/onboarding source and is a legacy surface asset, not the revised dashboard baseline. Weather and the $93.7 promotion are labeled demo content; production uses timezone context and an unpriced Connect your life panel. Names, dates, notes, portraits and analytics totals remain data, never token primitives. The calendar extension adds no raster assets: bundled synthetic demo portraits are reused with provenance in `apps/web/public/demo/README.md`. The 24 reference calendar events exist only in the explicit development demo workspace; normal workspaces render owner data and current dates.

## Do's and Don'ts

### Do:

- **Do** preserve the black rail, white mark, gray canvas and lime/yellow accent hierarchy.
- **Do** use Inter and tabular numerals for metrics, clock values and table data.
- **Do** keep phone chart controls in their reserved upper space and Quick Add after the cards.
- **Do** preserve textual statuses, visible focus, reduced motion and explicit empty/error states.
- **Do** preserve calendar-owned week scrolling, the fluid Day alternative and event-name priority.
- **Do** save widget choices to the workspace and expose related records through Life Graph details.

### Don't:

- **Don't** restore the superseded scenic purple dashboard as the current baseline.
- **Don't** turn sample names, weather, analytics values or the demo promotion price into production facts.
- **Don't** generalize the tilted promotion into a rule that every card must rotate.
- **Don't** shrink phone actions to fit the desktop chart composition.
- **Don't** treat tiny metadata, residual legacy styling or native screens as newly approved design standards.

Not canonized or repaired: residual purple focus outside the calendar/rail and legacy icon palettes, emoji greeting, tiny supporting metadata. They remain implementation drift or legibility limits, not new rules to inherit. Dark/native screenshot verification remains outside this pass.
