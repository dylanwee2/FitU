# FitU

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

## USAGE

### Navigation Components

The application includes reusable Navbar and Footer components that appear on all pages.

#### Adding Navigation Links

To add or modify navigation links, edit `src/config/nav.config.js`:

```javascript
export const navigationLinks = [
  {
    label: 'Home',
    href: '/',
    icon: '🏠'  // Optional emoji icon
  },
  {
    label: 'New Page',
    href: '/new-page',
    icon: '📄'
  }
]
```

#### Active Route Highlighting

The navbar automatically highlights the current route using Vue Router's `useRoute()`. Active links are styled with:
- Bold font weight
- Primary color highlighting
- `aria-current="page"` attribute for screen readers

#### Mobile Menu Behavior

The mobile menu includes:
- **Toggle**: Click the hamburger button to open/close
- **Outside Click**: Click outside the menu to close it
- **Escape Key**: Press Escape to close and return focus to toggle button
- **Focus Trap**: Tab navigation stays within the menu when open
- **Focus Restoration**: Focus returns to toggle button when menu closes

#### Accessibility Features

- **Skip to Content**: Hidden link appears when focused (Tab key)
- **ARIA Labels**: Proper navigation landmarks and labels
- **Focus Management**: Visible focus indicators and logical tab order
- **Screen Reader Support**: Semantic HTML and ARIA attributes

#### Footer Features

- **Dynamic Year**: Copyright year updates automatically
- **Back to Top**: Smooth scroll to main content with focus management
- **Social Links**: Configurable social media links (currently using emoji icons)
- **Responsive Design**: Adapts to mobile and desktop layouts

## THEME

### Red & Cream Theme System

The application uses a warm, inviting Red & Cream theme with CSS variables for consistent styling across all components.

#### Theme Colors

**Red & Cream Palette:**
- Background: `#FFF7E6` (Cream)
- Surface: `#FFEBD0` (Light Cream)
- Text: `#1E1B16` (Dark Brown)
- Muted: `#7A6E65` (Muted Brown)
- Primary: `#E63946` (Red)
- Primary-700: `#C92D3A` (Dark Red - hover)
- Secondary: `#7A0017` (Deep Red)
- Accent: `#D4A017` (Warm Gold)
- Success: `#16A34A`
- Warning: `#D97706`
- Danger: `#DC2626`

#### Theme Files

- **`src/assets/theme.css`**: CSS variables and utility classes
- **`src/assets/base.css`**: Global base styles and typography

#### Using Theme Tokens

**CSS Variables:**
```css
.my-component {
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border-subtle);
  box-shadow: var(--shadow-card);
}
```

**Utility Classes:**
```html
<div class="u-surface u-text u-card">
  <h2 class="u-text-primary">Title</h2>
  <p class="u-muted">Description</p>
  <button class="u-btn u-btn--primary">Action</button>
</div>
```

#### Available Utility Classes

**Backgrounds:**
- `.u-bg` - Main background (cream)
- `.u-surface` - Surface background (light cream)
- `.u-bg-primary` - Primary color background (red)
- `.u-bg-secondary` - Secondary color background (deep red)
- `.u-bg-accent` - Accent color background (warm gold)

**Text Colors:**
- `.u-text` - Main text color (dark brown)
- `.u-muted` - Muted text color (muted brown)
- `.u-text-primary` - Primary text color (red)
- `.u-text-secondary` - Secondary text color (deep red)
- `.u-text-accent` - Accent text color (warm gold)

**Components:**
- `.u-card` - Card with surface background, border, and shadow
- `.u-link` - Themed link with hover effects
- `.u-btn` - Base button styles
- `.u-btn--primary` - Primary button (red)
- `.u-btn--secondary` - Secondary button (outlined red)
- `.u-btn--danger` - Danger button
- `.u-btn--accent` - Accent button (warm gold)

#### Examples

**Button Variants:**
```html
<button class="u-btn u-btn--primary">Primary Action</button>
<button class="u-btn u-btn--secondary">Secondary Action</button>
<button class="u-btn u-btn--danger">Delete</button>
<button class="u-btn u-btn--accent">Special Action</button>
```

**Card Component:**
```html
<div class="u-card p-4">
  <h3 class="u-text-primary">Card Title</h3>
  <p class="u-muted">Card description with muted text.</p>
  <a href="#" class="u-link">Learn more</a>
</div>
```

**Form Elements:**
```html
<form class="u-surface p-4">
  <label class="fw-semibold">Email</label>
  <input type="email" class="form-control" placeholder="Enter email">
  <button type="submit" class="u-btn u-btn--primary mt-3">Submit</button>
</form>
```

**Hero Section:**
```html
<section class="u-hero-gradient text-center p-5">
  <h1 class="text-white">Welcome to FitU</h1>
  <p class="text-white">Your personal meal planning companion</p>
</section>
```

#### Customization

**Adding New Colors:**
1. Add CSS variables to `src/assets/theme.css`
2. Create utility classes if needed
3. Maintain the warm, cohesive color palette

**Component Theming:**
- Use CSS variables instead of hardcoded colors
- Leverage utility classes for consistency
- Maintain accessibility standards

#### Accessibility

- All colors meet WCAG AA contrast requirements
- Focus indicators use theme-aware colors
- Warm color palette reduces eye strain
- High contrast text ensures readability