import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/api/', '/hci-test'],
      },
    ],
    sitemap: 'https://www.wasatchwise.com/sitemap.xml',
  };
}
