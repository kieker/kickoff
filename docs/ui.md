# UI Notes

## Application Icon

Status: **Active in beta**

- The desktop window and browser fallback use a bold white `K` mark over Kickoff's dark red/cyan palette.
- Source asset: `apps/desktop/assets/kickoff-icon.png`.
- The current mark is intentionally simple and can be replaced when the broader brand identity is finalized.

## Widget Icons

Status: **Active in beta**

Current approach:

- Platform widgets use brand icons from `react-icons/si`.
- Weather uses a generic weather icon because it represents a data category rather than a platform brand.
- Widget icon visibility can be controlled globally or per widget in the settings drawer.

Project files:

- `packages/dashboard/src/components/widget-shell.tsx`
- `packages/dashboard/src/components/settings-panel.tsx`
- `packages/dashboard/src/widgets/`

Phase-two idea:

- Add selectable icon styles, such as brand, monochrome, minimal, or no icons.
- Keep brand icons opt-in if the design later needs a quieter or less brand-heavy look.
- Expand and shrink widgets by click and drag, and support collapsing widgets.

## Drawers

Status: **Right-aligned by default**

Current approach:

- The embedded YouTube player uses a right-side modal drawer.
- Opening a modal drawer locks background scrolling so the application scrollbar does not overlap its controls.
- Drawers provide Escape-to-close, focus containment, initial focus, and focus restoration.

Phase-two idea:

- Add a user preference for left- or right-aligned drawers.
- Apply the preference consistently to player, settings, and future detail drawers rather than adding a
  player-specific toggle.
