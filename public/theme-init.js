// Apply the saved (or system) theme before first paint to avoid a flash
try {
  var t = localStorage.getItem('theme')
  if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark')
  }
} catch (e) {}
