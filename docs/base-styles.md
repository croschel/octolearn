# Rule: Base Styles & Design Tokens

## Overview
All visual constants (colors, spacing, radii, shadows, typography) live in CSS custom properties defined in `styles/tokens.css`. These are consumed by Tailwind via `tailwind.config.ts`. **Never hardcode hex values, pixel sizes, or font sizes directly in components.**

---

## Token Files

### `styles/globals.css`
Entry point. Imports Tailwind directives and the token files:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import './tokens.css';
@import './typography.css';

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}
```

### `styles/tokens.css`
All CSS custom properties. Defined on `:root` for light mode, `.dark` for dark mode:

```css
:root {
  /* === Brand === */
  --brand-primary: 263 70% 50%;       /* violet-600 equivalent */
  --brand-primary-hover: 263 70% 45%;
  --brand-accent: 174 60% 51%;        /* teal-400 equivalent */

  /* === Semantic Background === */
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --surface: 210 40% 98%;
  --surface-raised: 0 0% 100%;

  /* === UI Chrome === */
  --border: 214 32% 91%;
  --border-strong: 214 32% 80%;
  --ring: 263 70% 50%;

  /* === Text === */
  --text-primary: 222 47% 11%;
  --text-secondary: 215 20% 45%;
  --text-disabled: 215 20% 65%;
  --text-inverse: 0 0% 100%;

  /* === Status === */
  --success: 160 60% 40%;
  --success-subtle: 160 60% 95%;
  --warning: 38 92% 50%;
  --warning-subtle: 38 92% 95%;
  --error: 0 72% 51%;
  --error-subtle: 0 72% 97%;
  --info: 199 89% 48%;
  --info-subtle: 199 89% 95%;

  /* === Radius === */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;

  /* === Shadows === */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);

  /* === Spacing scale (extra tokens beyond Tailwind defaults) === */
  --space-18: 4.5rem;
  --space-22: 5.5rem;
}

.dark {
  --background: 222 47% 4%;
  --foreground: 210 40% 98%;
  --surface: 222 47% 7%;
  --surface-raised: 222 47% 10%;

  --border: 217 33% 17%;
  --border-strong: 217 33% 25%;

  --text-primary: 210 40% 98%;
  --text-secondary: 215 20% 65%;
  --text-disabled: 215 20% 40%;

  --success-subtle: 160 60% 10%;
  --warning-subtle: 38 92% 10%;
  --error-subtle: 0 72% 10%;
  --info-subtle: 199 89% 10%;
}
```

### `styles/typography.css`
Font scale and text style utilities:
```css
@layer base {
  :root {
    --font-sans: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif;
    --font-mono: 'JetBrains Mono', ui-monospace, 'Cascadia Code', monospace;

    /* Fluid type scale */
    --text-xs: clamp(0.7rem, 0.7rem + 0.1vw, 0.75rem);
    --text-sm: clamp(0.8rem, 0.8rem + 0.1vw, 0.875rem);
    --text-base: clamp(0.9rem, 0.9rem + 0.15vw, 1rem);
    --text-lg: clamp(1rem, 1rem + 0.2vw, 1.125rem);
    --text-xl: clamp(1.1rem, 1.1rem + 0.3vw, 1.25rem);
    --text-2xl: clamp(1.25rem, 1.25rem + 0.5vw, 1.5rem);
    --text-3xl: clamp(1.5rem, 1.5rem + 1vw, 1.875rem);
    --text-4xl: clamp(1.875rem, 1.875rem + 1.5vw, 2.25rem);
    --text-5xl: clamp(2.25rem, 2.25rem + 2vw, 3rem);
  }
}
```

---

## Tailwind Config Integration

In `tailwind.config.ts`, extend the theme to consume the CSS variables:

```ts
theme: {
  extend: {
    colors: {
      background: 'hsl(var(--background))',
      foreground: 'hsl(var(--foreground))',
      surface: 'hsl(var(--surface))',
      'surface-raised': 'hsl(var(--surface-raised))',
      border: 'hsl(var(--border))',
      ring: 'hsl(var(--ring))',
      brand: {
        DEFAULT: 'hsl(var(--brand-primary))',
        hover: 'hsl(var(--brand-primary-hover))',
        accent: 'hsl(var(--brand-accent))',
      },
      text: {
        primary: 'hsl(var(--text-primary))',
        secondary: 'hsl(var(--text-secondary))',
        disabled: 'hsl(var(--text-disabled))',
        inverse: 'hsl(var(--text-inverse))',
      },
      success: {
        DEFAULT: 'hsl(var(--success))',
        subtle: 'hsl(var(--success-subtle))',
      },
      warning: {
        DEFAULT: 'hsl(var(--warning))',
        subtle: 'hsl(var(--warning-subtle))',
      },
      error: {
        DEFAULT: 'hsl(var(--error))',
        subtle: 'hsl(var(--error-subtle))',
      },
    },
    borderRadius: {
      sm: 'var(--radius-sm)',
      md: 'var(--radius-md)',
      lg: 'var(--radius-lg)',
      xl: 'var(--radius-xl)',
      full: 'var(--radius-full)',
    },
    boxShadow: {
      sm: 'var(--shadow-sm)',
      md: 'var(--shadow-md)',
      lg: 'var(--shadow-lg)',
    },
    fontFamily: {
      sans: ['var(--font-sans)'],
      mono: ['var(--font-mono)'],
    },
  },
}
```

---

## Rules

- **Never** use raw hex (`#7c3aed`) or rgb values in className or style props
- **Always** reference a token: `text-brand`, `bg-surface`, `border-border`
- shadcn/ui components are pre-wired to these tokens via the `cn()` utility — don't override their color classes without a good reason
- Dark mode is handled by the `.dark` class on `<html>` — Tailwind's `dark:` prefix is for component-level overrides only
- When adding a new color need, add the token to `tokens.css` first, then wire it in `tailwind.config.ts` — never use a one-off arbitrary value like `bg-[#123456]`
