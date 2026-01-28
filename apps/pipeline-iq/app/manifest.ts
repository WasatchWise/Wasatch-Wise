import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GrooveLeads - Construction Project Intelligence',
    short_name: 'GrooveLeads',
    description: 'Discover and qualify high-value construction projects on the go',
    start_url: '/projects',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'Dashboard',
        short_name: 'Dashboard',
        description: 'View all projects',
        url: '/projects',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Activated Leads',
        short_name: 'Leads',
        description: 'View opened emails',
        url: '/projects?filter=activated',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
    ],
    categories: ['business', 'productivity'],
  }
}

