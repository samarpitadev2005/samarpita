import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Mounts the Express API from api/index.js into the dev server, so `npm run dev` serves
// /api/* exactly as Vercel does in production. Also maps /admin to admin.html like vercel.json.
function apiDevServer() {
  return {
    name: 'samarpita-api-dev',
    apply: 'serve',
    config(_, { mode }) {
      // Hand .env values (MONGODB_URI, JWT_SECRET, ...) to the API, which reads process.env like on Vercel
      const env = loadEnv(mode, process.cwd(), '')
      for (const [k, v] of Object.entries(env)) if (process.env[k] === undefined) process.env[k] = v
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/admin' || req.url.startsWith('/admin?')) {
          req.url = '/admin.html'
          return next()
        }
        if (!req.url.startsWith('/api/')) return next()
        try {
          const { default: app } = await server.ssrLoadModule('/api/index.js')
          app(req, res, next)
        } catch (err) {
          console.error(err)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'API failed to start. Check the terminal.' }))
        }
      })
    },
  }
}

export default defineConfig({
  // Hosted at the domain root on Vercel; only the old GitHub Pages build needs the repo prefix
  base: process.env.GITHUB_ACTIONS ? '/samarpita/' : '/',
  plugins: [react(), tailwindcss(), apiDevServer()],
  build: {
    rollupOptions: {
      // Two pages: the public website and the separate admin panel
      input: {
        main: 'index.html',
        admin: 'admin.html',
      },
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion', 'gsap', 'lenis'],
        },
      },
    },
  },
})
