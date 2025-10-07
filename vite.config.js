import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3001,
        open: true,
        proxy: {
            '/api': {
                target: process.env.VITE_API_URL ? 
                    process.env.VITE_API_URL.replace('/api', '') : 
                    'http://localhost:3000',
                changeOrigin: true,
                secure: true,
                rewrite: (path) => path.replace(/^\/api/, '/api')
            },
        },
    },
    define: {
        __APP_ENV__: process.env.VITE_NODE_ENV,
    },
})
