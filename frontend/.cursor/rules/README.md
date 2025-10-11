# Cursor Rules for Butler Application

This directory contains Cursor AI rules that help maintain consistency and quality across the Butler application codebase.

## Available Rules

### 1. `color-palette.mdc` (Always Applied)
**Purpose**: Defines the color palette and usage guidelines

**Key Topics**:
- Complete color palette with hex values
- Semantic color mapping (success, warning, error, info)
- Gradient patterns and combinations
- Rules for adding new colors
- Common styling patterns

**When to Reference**: When working with colors, creating new components, or applying themes

---

### 2. `scss-structure.mdc` (SCSS/CSS Files)
**Purpose**: SCSS organization and conventions

**Key Topics**:
- File organization structure
- Variable usage patterns
- BEM naming methodology
- Best practices (nesting, responsiveness, transitions)
- Syncfusion component styling
- Common component patterns

**Applies To**: `*.scss`, `*.css` files

**When to Reference**: When writing or modifying stylesheets

---

### 3. `theming-system.mdc` (Manual)
**Purpose**: Theme system architecture and customization

**Key Topics**:
- Theme selection and switching
- Available theme colors
- Core theme files and their purposes
- Dark mode implementation
- Theme persistence with localStorage
- CSS custom properties usage
- Gradient system

**When to Reference**: When implementing theme features, adding new themes, or working with dark mode

---

### 4. `component-styling.mdc` (HTML/TS Files)
**Purpose**: Component styling and template conventions

**Key Topics**:
- Angular component structure
- Template styling best practices
- CSS class and style binding
- Common component patterns (cards, forms, buttons)
- Syncfusion component integration
- Responsive design approaches
- Accessibility guidelines
- Performance considerations

**Applies To**: `*.html`, `*.ts` files

**When to Reference**: When creating or modifying Angular components

---

### 5. `design-principles.mdc` (Always Applied)
**Purpose**: Design principles and color theory

**Key Topics**:
- Color wheel theory (analogous, complementary, triadic)
- Visual hierarchy principles
- Contrast and readability (WCAG standards)
- Spacing and layout (8px grid system)
- Typography hierarchy
- Animation and motion guidelines
- Accessibility requirements
- Design checklist

**When to Reference**: When making design decisions, creating new UI patterns, or ensuring consistency

---

## How Rules Are Applied

### Automatic Application
Some rules are automatically applied to every request:
- `color-palette.mdc` - Always provides color guidance
- `design-principles.mdc` - Always provides design guidance

### File Type Application
Some rules apply automatically when editing specific file types:
- `scss-structure.mdc` - Applies when editing `.scss` or `.css` files
- `component-styling.mdc` - Applies when editing `.html` or `.ts` files

### Manual Application
Some rules can be manually invoked when needed:
- `theming-system.mdc` - Use when working on theme-related features

## Quick Reference

### Need to add a new color?
→ See `color-palette.mdc` - Section: "Rules for Adding New Colors"

### Styling a new component?
→ See `component-styling.mdc` - Section: "Common Component Patterns"

### Writing SCSS?
→ See `scss-structure.mdc` - Section: "Best Practices"

### Implementing dark mode?
→ See `theming-system.mdc` - Section: "Dark Mode"

### Checking color contrast?
→ See `design-principles.mdc` - Section: "Contrast & Readability"

### Need animation timing?
→ See `design-principles.mdc` - Section: "Animation & Motion"

## Color Reference Card

Quick reference for the most commonly used colors:

| Purpose | Color | Hex |
|---------|-------|-----|
| Primary / Theme | Blue | `#1b76ff` |
| Success | Green | `#3ddc84` |
| Warning | Orange | `#ff8c42` |
| Error | Red | `#ff5757` |
| Info | Cyan | `#1bb8ff` |
| Focus | Blue 10% | `rgba(27, 118, 255, 0.1)` |

## Common Tasks

### Adding a New Theme Color
1. Update `$theme-colors` map in `_variables.scss`
2. Add to `themes` array in `theme-panel.component.ts`
3. Test across all components
4. Document in `color-palette.mdc`

### Creating a New Component
1. Follow structure in `component-styling.mdc`
2. Use colors from `color-palette.mdc`
3. Apply design principles from `design-principles.mdc`
4. Test responsiveness and accessibility
5. Check design checklist before completion

### Modifying SCSS
1. Follow conventions in `scss-structure.mdc`
2. Use variables instead of hardcoded values
3. Follow BEM naming methodology
4. Test in both light and dark modes
5. Verify across all breakpoints

## Maintenance

These rules should be updated when:
- New colors are added to the palette
- Design patterns change
- New component patterns are established
- Accessibility requirements evolve
- Framework or library updates require new conventions

Last Updated: October 10, 2025
Updated By: Color theme migration from teal to blue

