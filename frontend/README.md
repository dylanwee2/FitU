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