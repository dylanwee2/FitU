export default {
  mounted(el, binding) {
    const baseClass = 'reveal'
    const visibleClass = 'reveal--visible'
    el.classList.add(baseClass)

    const options = {
      root: null,
      rootMargin: '0px',
      threshold: binding.value?.threshold ?? 0.15
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          el.classList.add(visibleClass)
          if (binding.value?.once !== false) observer.unobserve(el)
        }
      })
    }, options)

    observer.observe(el)
    el.__revealObserver = observer
  },
  unmounted(el) {
    if (el.__revealObserver) {
      el.__revealObserver.disconnect()
      delete el.__revealObserver
    }
  }
}


