You are a senior staff-level full-stack engineer, product architect, UI/UX designer, and mobile engineer.

Build a production-quality cross-platform application called:

# CRUNCHRR

CRUNCHRR is a Personal Life OS.

It is designed to become one unified place where a person manages their entire everyday life.

CRUNCHRR combines:

- Dashboard
- Calendar
- Tasks
- Reminders
- Notes
- Finance
- Health
- Medicines
- Goals
- Habits
- Wellbeing
- Life Vault
- Projects
- People
- Meals & Nutrition
- Travel
- Vehicles
- Shopping
- Online Orders
- Bills & Subscriptions
- AI Assistant
- Universal Search
- Quick Add

This is NOT simply a collection of separate productivity apps.

The central concept is a connected:

# LIFE GRAPH

Everything in CRUNCHRR should be capable of being related to other parts of the user's life.

For example:

A dentist appointment can connect:

Calendar
+
Reminder
+
Health
+
Expected Expense
+
Prescription
+
Document

An online order can connect:

Order
+
Expense
+
Receipt
+
Delivery Date
+
Reminder

A medicine can connect:

Medicine
+
Schedule
+
Reminder
+
Inventory
+
Refill
+
Prescription
+
Expense

A project can connect:

Project
+
Tasks
+
Notes
+
People
+
Calendar Events
+
Files
+
Expenses

This interconnected system is the core differentiator of CRUNCHRR.

==================================================
1. PLATFORMS
==================================================

Build CRUNCHRR for:

1. Web
2. Desktop browser
3. iOS
4. Android

The web experience must be optimized for:

- Laptop
- Desktop
- Large monitor
- Tablet browser

The mobile experience must be optimized specifically for:

- iPhone
- Android phones
- Tablets

Do NOT simply shrink the desktop interface for mobile.

Create platform-appropriate experiences while maintaining one visual identity.

==================================================
2. FINAL TECHNOLOGY STACK
==================================================

WEB / DESKTOP:

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- TanStack Query
- Zustand
- React Hook Form
- Zod
- Recharts
- date-fns

MOBILE:

- Expo
- React Native
- TypeScript
- Expo Router
- NativeWind
- React Native Reanimated
- Moti where appropriate
- TanStack Query
- Zustand
- React Hook Form
- Zod
- Victory Native
- date-fns

BACKEND:

- NestJS
- Fastify adapter
- TypeScript
- REST API
- WebSocket support where necessary

DATABASE:

- Neon PostgreSQL

ORM:

- Drizzle ORM

AUTHENTICATION:

- Clerk

FILE STORAGE:

- S3-compatible object storage / Cloudflare R2-compatible architecture

BACKGROUND JOBS:

- BullMQ
- Redis

AI:

- Vercel AI SDK / provider-agnostic AI abstraction
- Support multiple AI providers
- Never tightly couple the application to one AI provider

SEARCH:

- PostgreSQL Full Text Search initially
- pgvector for semantic search

MONOREPO:

- Turborepo
- pnpm

TESTING:

- Vitest
- React Testing Library
- React Native Testing Library
- Playwright

MONITORING:

- Sentry

ANALYTICS:

- PostHog

==================================================
3. ARCHITECTURE
==================================================

Use a monorepo.

Recommended structure:

crunchrr/

apps/

  web/
    Next.js web application

  mobile/
    Expo application

  api/
    NestJS backend

  worker/
    background job worker

packages/

  database/
    Drizzle schema
    migrations
    database client

  types/
    shared TypeScript types

  validation/
    Zod schemas

  api-client/
    shared API client

  state/
    shared state utilities

  utils/
    shared utilities

  config/
    shared configuration

  ui/
    reusable platform-independent design primitives where appropriate

Do NOT force every UI component to be shared between web and React Native.

Share:

- Types
- Validation
- API contracts
- Business rules
- Utility functions
- Design tokens
- Data models

Web and mobile can have platform-specific UI components.

==================================================
4. WEB APPLICATION
==================================================

Use Next.js.

The web application should be a desktop-class experience.

Primary layout:

LEFT SIDEBAR
+
MAIN CONTENT
+
OPTIONAL RIGHT CONTEXT PANEL

Desktop layout:

------------------------------------------------
| Sidebar | Main Workspace       | Context     |
|         |                     | Panel       |
|         |                     |             |
------------------------------------------------

Sidebar can collapse.

Collapsed state:

Icons only.

Expanded state:

Icons + labels.

Use responsive breakpoints.

Large screens should use available space intelligently.

Do not create unnecessarily huge empty margins.

==================================================
5. MOBILE APPLICATION
==================================================

Use Expo + React Native.

Use Expo Router.

Mobile navigation:

Bottom navigation:

Home
Calendar
Tasks
Search
More

Place a floating Quick Add button prominently.

More screen contains:

Notes
Finance
Health
Medicines
Goals
Habits
Wellbeing
Projects
People
Meals
Travel
Vehicles
Shopping
Orders
Bills
Life Vault
AI Assistant
Settings

Use native-feeling interactions.

Support:

- Swipe gestures
- Bottom sheets
- Native keyboard behavior
- Haptics where appropriate
- Pull to refresh
- Long press actions
- Touch-friendly controls

Minimum touch target:

44x44.

==================================================
6. BRAND
==================================================

Product name:

CRUNCHRR

Brand should always appear as:

crunchrr

Use lowercase in the UI where appropriate.

Create a distinctive CRUNCHRR identity.

The logo is based on the purple star/X-shaped symbol from the provided reference design.

Use the logo as the foundation for the CRUNCHRR mascot.

The mascot should be:

- Friendly
- Intelligent
- Futuristic
- Minimal
- Premium
- Slightly playful

Do NOT make it childish.

Mascot states:

- Idle
- Thinking
- Working
- Happy
- Success
- Warning
- Sleep
- Celebration

Use the mascot in:

- AI Assistant
- Empty states
- Loading states
- Onboarding
- Success screens
- Help
- Error states

Do not place the mascot everywhere.

Use it intentionally.

==================================================
7. VISUAL DESIGN
==================================================

The provided CRUNCHRR UI reference is the primary visual inspiration.

Create a premium:

- Bento grid
- Soft modern interface
- Rounded cards
- Subtle depth
- Clean typography
- Soft shadows
- Light borders
- Modern charts
- Friendly icons
- Strong information hierarchy

The UI should feel like:

Apple-level simplicity
+
Linear-level polish
+
Notion-level flexibility
+
Modern AI product

But CRUNCHRR must have its own identity.

Avoid generic SaaS templates.

==================================================
8. COLOR SYSTEM
==================================================

Do NOT use green as the primary brand color.

Primary brand:

Purple / Indigo / Blue

Primary:

#6D3DF5

Primary dark:

#5B21B6

Secondary:

#4F46E5

Blue:

#2563EB

Soft purple:

#EDE9FE

Soft blue:

#DBEAFE

Background:

#F6F7FB

Surface:

#FFFFFF

Text:

#111827

Secondary text:

#64748B

Border:

#E5E7EB

Success:

#10B981

Warning:

#F59E0B

Danger:

#EF4444

Info:

#3B82F6

Dark mode:

Background:
#080B14

Surface:
#111827

Elevated surface:
#172033

Primary:
#8B5CF6

Secondary:
#6366F1

Blue:
#3B82F6

Do not overuse gradients.

Use gradients only for hero sections, selected highlights, or important visual accents.

==================================================
9. TYPOGRAPHY
==================================================

Use a modern sans-serif.

Recommended:

Inter

or another equivalent highly readable modern font.

Typography hierarchy:

Large page heading
Section heading
Card heading
Body
Secondary metadata
Labels

Avoid excessive font weights.

Use whitespace effectively.

==================================================
10. ICON SYSTEM
==================================================

Use Lucide icons or equivalent consistent outline icons.

Icons must match the CRUNCHRR visual identity.

Do not mix random icon libraries.

Icons should be:

- Simple
- Rounded
- Modern
- Consistent

==================================================
11. GLOBAL HEADER
==================================================

Desktop header:

Global Search
Quick Add
Notifications
Theme switch
Profile

Search placeholder:

"Search anything..."

Keyboard shortcut:

⌘ K / Ctrl K

Mobile header:

CRUNCHRR logo
Search
Notifications
Profile

==================================================
12. GLOBAL SEARCH
==================================================

Universal search is a major feature.

Search across:

Tasks
Events
Reminders
Notes
Expenses
Income
Accounts
Health records
Medicines
Prescriptions
Goals
Habits
Projects
People
Meals
Trips
Vehicles
Shopping
Orders
Bills
Subscriptions
Documents

Search results should show:

Direct result
+
Related context

Example:

User searches:

"Dentist"

Results:

Dentist appointment
Health record
Prescription
Expense
Reminder
Related document

Use:

PostgreSQL full-text search initially.

Design architecture so pgvector semantic search can be enabled later.

==================================================
13. COMMAND PALETTE
==================================================

Desktop:

Cmd/Ctrl + K

Command palette actions:

Create Task
Create Event
Create Note
Add Expense
Add Medicine
Add Health Record
Create Goal
Create Habit
Add Bill
Add Subscription
Add Document
Add Shopping Item
Add Order
Create Project
Search
Open AI Assistant

Search commands and data from the same interface.

==================================================
14. DASHBOARD
==================================================

The dashboard is the heart of CRUNCHRR.

Create a highly polished responsive Bento Grid.

Desktop dashboard should contain:

1. Hero
2. KPI cards
3. Today's schedule
4. Tasks
5. Quick Add
6. Finance
7. Health
8. Medicines
9. Goals
10. Habits
11. Bills
12. Orders
13. Life Vault
14. Travel
15. Meals
16. Vehicles

Do not display every card at maximum size.

Use intelligent bento sizing.

Cards should support:

small
medium
large
wide
tall
full

==================================================
15. HERO
==================================================

Hero section:

"Good morning, [Name]"

Subtitle:

"Everything important, in one place."

Display:

Date
Weather
Location
Today's progress

Quick actions:

Plan My Day
Focus
Review Finances
Health Check

Use an elegant scenic background.

Keep hero compact enough that useful information appears above the fold.

==================================================
16. KPI CARDS
==================================================

Cards:

Tasks
Events
Expenses
Health
Medicines
Goals

Examples:

Tasks:
4 / 7 completed

Events:
4 today

Expenses:
₹420 today

Health:
7,842 steps

Medicines:
2 / 3 taken

Goals:
82% progress

Use real database values.

Never hardcode fake statistics in production.

==================================================
17. TODAY'S SCHEDULE
==================================================

Create a timeline.

Example:

09:00
College

11:30
Gym

14:00
Project meeting

16:00
Study

19:00
Family

Each event displays:

Time
Title
Duration
Location
Category
Status

Allow:

Open
Edit
Reschedule
Complete
Delete

==================================================
18. TASKS
==================================================

Task system:

Task
Subtasks
Priority
Status
Due date
Start date
Estimated duration
Tags
Project
Assignee/People
Attachments
Notes
Dependencies

Statuses:

Inbox
Todo
In Progress
Completed
Cancelled

Priority:

Low
Medium
High
Urgent

Views:

Today
Upcoming
Overdue
Completed
All

Support recurring tasks.

==================================================
19. REMINDERS
==================================================

Reminder types:

One-time
Recurring
Event-based
Medicine
Bill
Subscription
Document expiry
Habit
Goal
Task
Custom

Allow:

Snooze
Dismiss
Reschedule
Complete

==================================================
20. QUICK ADD
==================================================

Quick Add is one of the most important interactions.

Actions:

Task
Event
Note
Expense
Medicine
Health
Goal
Habit
Bill
Document
Project
Order
Shopping

Support natural-language input.

Example:

"Doctor appointment tomorrow at 5 PM"

Detect:

Event
Date
Time
Health context
Reminder

Example:

"Bought groceries for ₹840"

Detect:

Expense
Amount
Category
Date

Always allow user confirmation before saving ambiguous information.

==================================================
21. CALENDAR
==================================================

Views:

Day
Week
Month
Agenda

Event fields:

Title
Description
Start
End
Location
Participants
Reminder
Recurrence
Attachments
Notes
Related entities

Desktop:

Drag and drop.

Mobile:

Touch-based interactions.

Support recurring events.

==================================================
22. NOTES
==================================================

Rich notes.

Support:

Plain text
Rich text
Markdown
Checklist
Images
Files
Tables
Links
Code blocks

Notes can link to:

Tasks
Projects
People
Events
Expenses
Medicines
Trips
Documents

==================================================
23. FINANCE
==================================================

Finance dashboard:

Income
Expenses
Balance
Accounts
Cash
Budgets
Savings
Bills
Subscriptions
Debt

Transactions:

Income
Expense
Transfer

Categories:

Food
Transport
Shopping
Health
Education
Entertainment
Bills
Travel
Other

Charts:

Monthly expenses
Category breakdown
Income vs expenses
Budget progress
Spending trends

Support INR initially.

Design architecture for multiple currencies later.

==================================================
24. HEALTH
==================================================

Health dashboard.

Track:

Weight
Height
BMI
Blood pressure
Heart rate
Blood glucose
Steps
Sleep
Water
Exercise
Calories
Symptoms
Health appointments

Allow manual entry.

Health data is sensitive.

Do not provide medical diagnosis.

Do not present AI output as medical advice.

==================================================
25. MEDICINES
==================================================

Medicine profile:

Name
Dosage
Form
Frequency
Schedule
Start date
End date
Instructions
Doctor
Purpose

Medicine status:

Scheduled
Taken
Skipped
Missed
Snoozed
Rescheduled

Inventory:

Current quantity
Units
Daily consumption
Estimated depletion
Refill date

Prescription:

Upload image
Upload PDF
Attach document

AI can extract information from a prescription.

The extracted information must always be user-reviewable.

Never automatically change prescriptions.

Never instruct the user to stop, start, or change medication.

==================================================
26. GOALS
==================================================

Goal categories:

Fitness
Finance
Education
Career
Personal
Health

Goal fields:

Title
Description
Target
Current value
Deadline
Progress
Tasks
Habits
Events
Metrics

Show visual progress.

==================================================
27. HABITS
==================================================

Habit:

Name
Frequency
Schedule
Reminder
Goal relationship

Frequency:

Daily
Weekly
Custom

Show:

Streak
Completion rate
Calendar
Heatmap
Progress

==================================================
28. WELLBEING
==================================================

Track:

Mood
Energy
Stress
Sleep quality

Simple daily check-in.

Do not present this as diagnosis or treatment.

==================================================
29. LIFE VAULT
==================================================

Secure document management.

Categories:

Identity
Education
Health
Insurance
Vehicle
Tax
Finance
Contracts
Warranty
Receipts
Certificates
Other

Document fields:

Title
Category
Issue date
Expiry date
File
Notes
Related entity

Automatic expiry reminders.

==================================================
30. PROJECTS
==================================================

Project fields:

Name
Description
Status
Priority
Start
Deadline
Tasks
Notes
People
Files
Expenses
Events

Project dashboard should show:

Progress
Tasks
Timeline
Budget
Files
Activity

==================================================
31. PEOPLE
==================================================

People:

Name
Relationship
Phone
Email
Birthday
Important dates
Notes

People can connect to:

Events
Tasks
Projects
Trips
Notes

==================================================
32. MEALS & NUTRITION
==================================================

Meal categories:

Breakfast
Lunch
Snack
Dinner

Features:

Meal planning
Meal logging
Favorites
Schedule

Architecture should allow future nutrition data.

==================================================
33. TRAVEL
==================================================

Trip:

Destination
Start date
End date
People
Itinerary
Bookings
Documents
Expenses
Tasks
Reminders

Show trip timeline.

==================================================
34. VEHICLES
==================================================

Vehicle:

Name
Make
Model
Registration
Insurance
Service history
Fuel
Documents

Track:

Insurance expiry
Registration expiry
Service due
Maintenance

==================================================
35. SHOPPING
==================================================

Shopping lists.

Item:

Name
Quantity
Category
Priority
Completed

Support recurring shopping items.

==================================================
36. ONLINE ORDERS
==================================================

Order:

Store
Order ID
Items
Amount
Order date
Expected delivery
Tracking
Status
Receipt

Statuses:

Ordered
Packed
Shipped
Out for delivery
Delivered
Cancelled
Returned

Link order to finance.

==================================================
37. BILLS & SUBSCRIPTIONS
==================================================

Track:

Internet
Mobile
Insurance
Rent
Utilities
Streaming
Software
Subscriptions
EMIs

Fields:

Name
Amount
Currency
Due date
Renewal date
Frequency
Payment account
Category

Support:

Monthly
Yearly
Weekly
Custom

Show upcoming payment timeline.

==================================================
38. NOTIFICATION CENTER
==================================================

Notifications:

Tasks
Calendar
Medicines
Bills
Subscriptions
Documents
Orders
Goals
Habits
Health

Notification states:

Unread
Read
Dismissed

Allow notification preferences.

==================================================
39. AI ASSISTANT
==================================================

AI Assistant is not a separate chatbot disconnected from the product.

It is an intelligence layer over the Life Graph.

User examples:

"What do I have tomorrow?"

"How much did I spend on food this month?"

"When should I refill my medicine?"

"What bills are due this week?"

"Plan my day."

"Show my upcoming travel."

"Create a task to finish my project tomorrow."

"Add dentist appointment tomorrow at 5."

"How much did I spend on healthcare this year?"

"Which documents expire this month?"

AI should be able to:

Read permitted information
Search
Summarize
Create
Update
Link entities
Suggest actions

==================================================
40. AI TOOL ARCHITECTURE
==================================================

Do NOT give AI direct database access.

Use controlled tools.

Example tools:

get_tasks
create_task
update_task
get_events
create_event
search_notes
get_expenses
create_expense
get_health_records
get_medicines
get_upcoming_bills
get_documents
search_life_graph

AI flow:

User
 ↓
AI Gateway
 ↓
Intent detection
 ↓
Permission check
 ↓
Tool selection
 ↓
Tool execution
 ↓
Service layer
 ↓
Database
 ↓
Result
 ↓
AI response

Sensitive write actions require confirmation.

Sensitive domains:

Finance
Health
Medicines
Documents
Account settings

==================================================
41. AI MEMORY
==================================================

Do not treat the AI conversation history as the user's entire memory.

Use structured application data as the source of truth.

AI can reference:

Tasks
Calendar
Notes
Finance
Health
Medicines
Goals
Projects
People
Documents

AI memory should be permission-controlled.

==================================================
42. LIFE GRAPH
==================================================

Create a generic relationship model.

Example:

entity_links

id
source_type
source_id
target_type
target_id
relationship_type
created_at

Examples:

event → person
event → expense
event → health_record
medicine → prescription
medicine → reminder
medicine → expense
order → expense
order → reminder
project → task
project → person
document → vehicle
document → reminder
goal → habit
goal → task

Use the Life Graph to generate contextual UI.

==================================================
43. DATABASE
==================================================

Use Neon PostgreSQL.

Use Drizzle ORM.

Use UUID identifiers.

Core tables:

users
profiles

tasks
task_subtasks
task_dependencies
task_tags

events
event_participants
event_reminders

reminders

notes
note_links

projects
project_members

expenses
income
accounts
transactions
budgets
savings_goals

health_records
health_metrics
health_appointments

medicines
medicine_schedules
medicine_logs
medicine_inventory
prescriptions

goals
goal_progress

habits
habit_logs

wellbeing_logs

documents
document_metadata

people
person_relationships

meals
meal_logs

trips
trip_items
trip_bookings

vehicles
vehicle_services
vehicle_documents

shopping_lists
shopping_items

orders
order_items

bills
subscriptions

notifications

entity_links

ai_conversations
ai_messages

audit_logs

==================================================
44. USER OWNERSHIP
==================================================

Every personal resource must belong to a user.

Use Clerk's user ID.

Example:

users:

id
clerk_user_id
name
email
timezone
currency
created_at

Every resource references the internal user ID.

Never trust a user_id supplied by the client.

Resolve the authenticated Clerk identity server-side.

==================================================
45. AUTHENTICATION
==================================================

Use Clerk.

Support:

Email
Password
Google
Apple
Passkeys where appropriate

Do not implement custom password authentication.

Backend must verify Clerk authentication.

Use authorization guards in NestJS.

Create:

AuthModule

Clerk authentication middleware/guards.

==================================================
46. AUTHORIZATION
==================================================

Every API endpoint must verify:

Authentication
+
User ownership
+
Permissions

A user must never be able to access another user's:

Tasks
Finance
Health
Medicine
Documents
Notes
People
Orders
etc.

==================================================
47. API
==================================================

Use REST.

Base:

/api/v1

Modules:

/auth
/users
/tasks
/calendar
/reminders
/notes
/finance
/health
/medicines
/goals
/habits
/wellbeing
/projects
/people
/meals
/travel
/vehicles
/shopping
/orders
/bills
/vault
/search
/life-graph
/ai
/notifications

Use consistent response formats.

Use proper HTTP status codes.

Validate all input using Zod.

==================================================
48. BACKEND ARCHITECTURE
==================================================

NestJS modules.

Example:

src/

auth/
users/
tasks/
calendar/
reminders/
notes/
finance/
health/
medicines/
goals/
habits/
wellbeing/
projects/
people/
meals/
travel/
vehicles/
shopping/
orders/
bills/
vault/
search/
life-graph/
ai/
notifications/

common/

Each feature should contain:

controller
service
repository
schemas
types
tests

Do not put database logic in controllers.

Architecture:

Controller
 ↓
Validation
 ↓
Service
 ↓
Repository
 ↓
Drizzle
 ↓
Neon

==================================================
49. BACKGROUND JOBS
==================================================

Use Redis + BullMQ.

Jobs:

Medicine reminders
Bill reminders
Subscription renewals
Document expiry alerts
Recurring tasks
Recurring events
Habit reminders
Goal reminders
Order delivery checks
Email notifications
AI document processing
Receipt processing
Prescription extraction

Do not block API requests for long-running jobs.

==================================================
50. FILE HANDLING
==================================================

Do not store large files inside PostgreSQL.

Use object storage.

Files:

Images
PDFs
Receipts
Prescriptions
Certificates
Insurance
IDs
Vehicle documents
Attachments

Store metadata in PostgreSQL.

Use signed URLs.

Do not expose private files publicly.

==================================================
51. SECURITY
==================================================

Security is critical because CRUNCHRR stores:

Finance
Health
Medicine
Documents
Personal information

Requirements:

HTTPS
Secure cookies
Clerk authentication
Server-side authorization
Input validation
Rate limiting
Audit logs
Secure file URLs
No secret keys in frontend
No service credentials in mobile app
No database credentials in client
Environment variables
Security headers
CORS configuration
Request validation

AI must never bypass authorization.

==================================================
52. DARK MODE
==================================================

Support:

Light
Dark
System

Dark mode should be deliberately designed.

Do not simply invert colors.

Use:

Deep navy-black background
Dark charcoal cards
Purple/indigo accents
Soft borders
Readable text

==================================================
53. RESPONSIVE WEB
==================================================

Desktop:

Sidebar
Main workspace
Optional context panel

Tablet:

Collapsible sidebar
Two-column Bento layout

Mobile web:

Mobile navigation
Single-column content
Bottom navigation
Floating Quick Add

Breakpoints:

Mobile:
<640

Tablet:
640–1024

Desktop:
1024–1440

Large:
1440+

==================================================
54. WEB INTERACTIONS
==================================================

Desktop should support:

Hover
Keyboard navigation
Drag and drop
Command palette
Context menus
Keyboard shortcuts
Resizable panels
Multi-column layouts

Use Framer Motion.

Animations should be subtle.

==================================================
55. MOBILE INTERACTIONS
==================================================

Mobile should support:

Swipe
Long press
Bottom sheets
Pull to refresh
Haptics
Native keyboard handling
Touch gestures

Never require hover.

==================================================
56. ACCESSIBILITY
==================================================

Support:

WCAG-friendly contrast
Keyboard navigation
Screen readers
Focus states
Dynamic text
Touch targets
Reduced motion

Respect prefers-reduced-motion on web.

==================================================
57. PERFORMANCE
==================================================

Web:

Use server rendering where appropriate.

Use:

Lazy loading
Code splitting
Image optimization
Virtualized lists
TanStack Query caching
Optimistic updates
Debounced search

Mobile:

Avoid unnecessary re-renders.

Use:

FlatList / FlashList where appropriate
Memoization
Query caching
Image optimization

Backend:

Use:

Pagination
Indexes
Efficient queries
Database connection pooling
Caching where appropriate

Never fetch huge datasets unnecessarily.

==================================================
58. OFFLINE SUPPORT
==================================================

Do not build a massive offline-first architecture initially.

Provide lightweight offline support for:

Tasks
Notes
Shopping
Habits
Calendar

Cache recently accessed data.

Queue safe mutations when appropriate.

Never blindly overwrite server data.

==================================================
59. ONBOARDING
==================================================

Create beautiful onboarding.

Step 1:

Welcome to Crunchrr.

Step 2:

Name

Step 3:

Timezone

Step 4:

Currency

Step 5:

What do you want to manage?

Options:

Tasks
Calendar
Finance
Health
Medicine
Goals
Habits
Notes
Projects
Everything

Step 6:

AI permissions

Step 7:

Notifications

Allow skipping optional steps.

Do not overwhelm users.

==================================================
60. EMPTY STATES
==================================================

Every module must have a polished empty state.

Use the Crunchrr mascot.

Example:

"No tasks yet."

"Let's get something done."

CTA:

Create Task

Use different mascot states depending on context.

==================================================
61. LOADING STATES
==================================================

Use skeleton loaders.

Do not show generic spinners everywhere.

Dashboard should progressively load.

==================================================
62. ERROR STATES
==================================================

Create friendly error states.

Examples:

Network unavailable
Authentication expired
Permission denied
Server error
Invalid input
File upload failed

Use mascot where appropriate.

Provide actionable recovery buttons.

==================================================
63. SETTINGS
==================================================

Settings sections:

Profile
Account
Appearance
Notifications
Privacy
Security
AI Permissions
Data
Connected Services
Export
Delete Account

==================================================
64. DATA EXPORT
==================================================

Allow users to export their data.

Support:

JSON
CSV where applicable
Documents as files

Export should include:

Tasks
Events
Notes
Finance
Health
Medicines
Goals
Habits
Projects
People
etc.

==================================================
65. DELETE ACCOUNT
==================================================

Provide secure account deletion.

Require confirmation.

Delete:

Personal records
Files
AI data
Notifications
Relationships

Respect retention policies if legally required.

==================================================
66. NOTIFICATION SYSTEM
==================================================

Create unified notification engine.

Examples:

"Medicine due in 15 minutes."

"Your electricity bill is due tomorrow."

"Passport expires in 30 days."

"Your order arrives tomorrow."

"Task overdue."

"Goal streak achieved."

Support:

Push
Email
In-app

==================================================
67. DESIGN SYSTEM
==================================================

Create centralized design tokens.

Tokens:

colors
spacing
radius
typography
shadows
elevation
motion

Create reusable:

Button
Card
BentoCard
IconButton
Badge
Avatar
Progress
Chart
Timeline
Calendar
DataTable
Modal
Drawer
BottomSheet
Toast
Tooltip
Popover
CommandPalette
Search
QuickAdd
FileUploader
EntityLink
EntityBadge
Skeleton
EmptyState

==================================================
68. BENTO SYSTEM
==================================================

Create reusable BentoGrid.

Cards support:

small
medium
large
wide
tall
full

Cards should adapt based on screen size.

Do not hardcode dashboard positions in a way that breaks responsive layouts.

==================================================
69. DASHBOARD PERSONALIZATION
==================================================

Allow users to customize dashboard.

Users can:

Show/hide widgets
Reorder widgets
Resize widgets where supported
Choose dashboard layout

Persist layout in database.

==================================================
70. CONTEXTUAL DASHBOARD
==================================================

Dashboard should prioritize what matters.

For example:

If the user has:

Medicine due soon

show Medicine card prominently.

If bills are due:

show Bills.

If travel is upcoming:

show Travel.

If tasks are overdue:

show Tasks.

The dashboard should feel intelligent.

==================================================
71. CROSS-MODULE RELATIONSHIPS
==================================================

Whenever a user views an entity, show related information.

Example:

Viewing a Project:

Tasks
Events
People
Notes
Expenses
Files

Viewing a Medicine:

Schedule
History
Inventory
Prescription
Related expenses
Reminders

Viewing an Order:

Items
Expense
Receipt
Delivery
Reminder

Viewing a Trip:

Calendar
People
Bookings
Expenses
Documents
Tasks

==================================================
72. AUDIT LOG
==================================================

Create audit logs for sensitive operations.

Examples:

Finance changed
Medicine edited
Health record modified
Document deleted
Account settings changed

Store:

user
action
entity
timestamp
metadata

Do not expose sensitive audit metadata unnecessarily.

==================================================
73. TESTING
==================================================

Write tests for:

Authentication
Authorization
Task CRUD
Calendar CRUD
Finance
Medicine scheduling
Reminder scheduling
Life Graph
Search
AI tools
File permissions
User ownership

E2E tests:

Login
Create task
Create event
Add expense
Add medicine
Create project
Search
AI action
Dashboard

==================================================
74. API CONTRACTS
==================================================

Use strongly typed request/response types.

Shared types should be available to:

Web
Mobile
Backend

Avoid duplicated interfaces.

==================================================
75. ERROR HANDLING
==================================================

Create centralized backend error handling.

Return safe error messages.

Never expose:

Database errors
Stack traces
Secrets
Internal implementation details

Log technical details server-side.

==================================================
76. RATE LIMITING
==================================================

Rate limit:

Authentication-sensitive endpoints
AI endpoints
Search
File uploads
Expensive operations

AI should have stricter limits.

==================================================
77. AI COST CONTROL
==================================================

Do not send the entire user's Life Graph to the AI.

Retrieve only relevant context.

Use:

Intent detection
Search
Tool calls
Context filtering
Token budgeting

Example:

Question:

"When is my medicine refill?"

Only retrieve relevant medicine inventory data.

==================================================
78. AI CONFIRMATION
==================================================

Read operations:

Can execute automatically if permitted.

Write operations:

Low-risk:

Create task
Create note

Can execute directly if user enabled it.

Sensitive:

Finance
Medicine
Health
Documents

Require confirmation.

Example:

"I found a dentist appointment tomorrow at 5 PM. Create the calendar event and reminder?"

Buttons:

Confirm
Cancel

==================================================
79. MOBILE DEEP LINKS
==================================================

Support deep links.

Examples:

crunchrr://task/123
crunchrr://event/123
crunchrr://medicine/123
crunchrr://order/123

Web URLs should map to equivalent entities.

==================================================
80. WEB URL STRUCTURE
==================================================

Use clean routes:

/
 /dashboard
 /calendar
 /tasks
 /reminders
 /notes
 /finance
 /health
 /medicines
 /goals
 /habits
 /wellbeing
 /projects
 /people
 /meals
 /travel
 /vehicles
 /shopping
 /orders
 /bills
 /vault
 /search
 /assistant
 /settings

Entity routes:

/tasks/[id]
/events/[id]
/medicines/[id]
/projects/[id]
etc.

==================================================
81. MOBILE SCREEN STRUCTURE
==================================================

Home
Calendar
Tasks
Search
More

Inside More:

Notes
Finance
Health
Medicines
Goals
Habits
Wellbeing
Projects
People
Meals
Travel
Vehicles
Shopping
Orders
Bills
Vault
AI
Settings

==================================================
82. PROFILE
==================================================

Profile:

Avatar
Name
Email
Timezone
Currency

Preferences:

Theme
Start of week
Date format
Time format
Language

==================================================
83. PRIVACY
==================================================

Create privacy controls.

AI access:

Tasks
Calendar
Notes
Finance
Health
Medicines
Documents
People

Users can disable access.

==================================================
84. FUTURE-READY ARCHITECTURE
==================================================

Design for future integrations:

Google Calendar
Apple Calendar
Google Drive
Apple services
Banking integrations
Fitness platforms
Email
Cloud storage
Shopping platforms

Do not implement all integrations now.

Create interfaces that allow them later.

==================================================
85. IMPORTANT MEDICAL SAFETY
==================================================

Health and medicine functionality is for organization and tracking.

It is not a medical diagnosis system.

Never:

Diagnose
Prescribe
Recommend stopping medicine
Recommend changing dosage
Replace a doctor

AI-generated health information must clearly be treated as informational.

==================================================
86. IMPORTANT FINANCE SAFETY
==================================================

Finance features are for personal organization.

Do not present AI-generated financial suggestions as professional financial advice.

==================================================
87. PRODUCT FEEL
==================================================

CRUNCHRR should feel like:

"My entire life is finally organized."

Not:

"Here are 20 separate apps."

The interface should continuously surface relationships.

Example:

Today:

Doctor appointment
↓
Reminder
↓
Health
↓
Expected expense
↓
Prescription

That is the CRUNCHRR experience.

==================================================
88. FIRST MVP
==================================================

The first production MVP must prioritize:

Authentication
Dashboard
Calendar
Tasks
Reminders
Notes
Finance
Health
Medicines
Goals
Habits
Life Graph
Universal Search
Quick Add
AI Assistant

Then expand:

Projects
People
Travel
Vehicles
Meals
Shopping
Orders
Bills
Life Vault

Do not sacrifice the quality of the core experience just to add every module immediately.

==================================================
89. DEVELOPMENT RULES
==================================================

Do not create a fake static prototype.

Build real:

Database
API
Authentication
CRUD
Validation
Relationships
Search
Notifications
AI tools

Do not hardcode fake user data in production.

Use seed data only in development/demo mode.

Do not use mock APIs where a real implementation is expected.

==================================================
90. CODE QUALITY
==================================================

Use strict TypeScript.

Avoid:

any

unless genuinely necessary.

Use:

Types
Interfaces
Zod schemas
DTOs
Services
Repositories
Reusable hooks
Reusable components

Follow clean architecture principles without unnecessary overengineering.

Do not duplicate logic.

Do not put business logic into UI components.

==================================================
91. FINAL PRODUCT REQUIREMENT
==================================================

The final application must feel like a polished commercial product.

It should be:

Fast
Responsive
Secure
Accessible
Scalable
Maintainable
Beautiful
Cross-platform

The desktop UI should feel like a premium modern productivity application.

The mobile UI should feel native and comfortable.

The backend should be modular and scalable.

The database should be normalized and properly indexed.

The Life Graph should connect the entire system.

The AI Assistant should operate through controlled tools.

==================================================
92. IMPLEMENTATION ORDER
==================================================

Build in this order.

PHASE 1:

Monorepo
TypeScript
Next.js
Expo
NestJS
Fastify
Drizzle
Neon
Clerk
Turborepo
Design system

PHASE 2:

Authentication
User profile
Navigation
Theme
Responsive shell

PHASE 3:

Dashboard
Bento system
Hero
KPI cards
Schedule
Tasks
Quick Add

PHASE 4:

Calendar
Reminders
Notes

PHASE 5:

Finance
Bills
Subscriptions
Orders

PHASE 6:

Health
Medicines
Wellbeing

PHASE 7:

Goals
Habits
Projects
People

PHASE 8:

Meals
Travel
Vehicles
Shopping
Life Vault

PHASE 9:

Life Graph
Entity relationships
Universal Search

PHASE 10:

AI Assistant
AI tools
Permissions
Confirmation system
Context retrieval

PHASE 11:

Notifications
Background jobs
Push
Email

PHASE 12:

Performance
Accessibility
Security
Testing
Production hardening

==================================================
93. DO NOT ASK UNNECESSARY QUESTIONS
==================================================

Make reasonable engineering decisions yourself.

Do not stop after generating a plan.

Actually implement the project.

When a decision has multiple reasonable solutions, select the solution that provides the best combination of:

Performance
Maintainability
Security
Developer experience
Scalability
Cross-platform compatibility

Do not simplify CRUNCHRR into a generic task manager.

The core product is:

PERSONAL LIFE OS
+
LIFE GRAPH
+
AI ASSISTANT

Build around those three concepts.

==================================================
94. FINAL DESIGN REQUIREMENT
==================================================

Use the provided CRUNCHRR UI reference as the visual direction.

Preserve:

- CRUNCHRR logo
- Purple/indigo/blue palette
- Bento grid
- Premium rounded cards
- Soft modern UI
- Scenic hero
- Clean sidebar
- Friendly mascot
- Strong information hierarchy

Improve:

- Responsiveness
- Accessibility
- Information density
- Navigation
- Mobile usability
- Interaction design
- Component consistency

Do not reproduce the reference as a static screenshot.

Turn the visual concept into a complete real application.

==================================================
START
==================================================

Start by creating the monorepo and core architecture.

Then build the design system.

Then authentication.

Then the responsive application shell.

Then the dashboard.

Then implement each module incrementally.

Every feature must connect to the shared backend, database, authentication, and Life Graph architecture.

Build CRUNCHRR as a serious production-grade Personal Life OS.