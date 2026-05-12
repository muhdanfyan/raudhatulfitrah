import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProd = env.VITE_APP_ENV === 'production';

  return {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-firebase': ['firebase/app', 'firebase/messaging'],
            'vendor-ui': ['lucide-react', 'react-helmet-async'],
            // Feature chunks
            'feature-qr': ['@yudiel/react-qr-scanner', 'qrcode.react'],
            'feature-editor': ['react-quill'],
          }
        }
      },
      chunkSizeWarningLimit: 500,
    },
    plugins: [
      react(),
      // PWA only for production
      ...(isProd ? [VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['logo.png'],
        manifest: {
          name: 'Pisantri - Sistem Informasi Pesantren',
          short_name: 'Pisantri',
          description: 'Aplikasi manajemen pesantren digital',
          theme_color: '#10b981',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/api\.pondokinformatika\.id\/api\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 // 24 hours
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        }
      })] : []),
    ],
    optimizeDeps: {
      exclude: [],
    },
    server: {
      port: 5233,
      host: '0.0.0.0',
    },
  };
});
