# Extractable components
No shared layout components exist in apps/home. App owns the single-page header and grid.
## AppCard
- Source: apps/home/src/components/AppCard.tsx
- Category: basic
- Description: App title, description and category in a linked card.
- Extractable props: href (string), title, description, category.
- Hardcoded: classes and styling.
Basic cards stay inline in drafts; no layout extraction required.
