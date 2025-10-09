/**
 * Navigation configuration for FitU application
 * Single source of truth for all navigation links
 */

export const navigationLinks = [
  {
    label: 'Home',
    href: '/',
    icon: '🏠'
  },
  {
    label: 'Recipes',
    href: '/recipes',
    icon: '🍽️'
  },
  {
    label: 'Calendar',
    href: '/calendar',
    icon: '🗓️'
  },
  {
    label: 'Virtual Gym',
    href: '/virtual-gym',
    icon: '🏋️'
  },
    {
    label: 'Exercise Library',
    href: '/exerciselibrary',
    icon: '💪'
  },
  {
    label: 'Workout Sets',
    href: '/workout-sets',
    icon: '📋',
    requiresAuth: true
  },

  {
    label: 'Vault',
    href: '/vault',
    icon: '🗓️'
  },
  {
    label: 'Sign Up',
    href: '/signup',
    icon: '📝'
  },
  {
    label: 'Login',
    href: '/login',
    icon: '🔐'
  }
]

export const socialLinks = [
  {
    label: 'Facebook',
    href: '#',
    icon: '📘'
  },
  {
    label: 'Twitter',
    href: '#',
    icon: '🐦'
  },
  {
    label: 'Instagram',
    href: '#',
    icon: '📷'
  }
]

