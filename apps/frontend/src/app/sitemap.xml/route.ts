export async function GET() {
	if (process.env.NODE_ENV !== 'production') {
		return new Response('Sitemap disabled in non-production', {status: 404});
	}
	const baseUrl = 'https://portfolioanalyzer.ru';

	const staticRoutes = ['', 'faq', 'feedback'];

	const body = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${staticRoutes
		.map(
			(route) => `
      <url>
        <loc>${baseUrl}/${route}</loc>
        <changefreq>monthly</changefreq>
        <priority>${route === '' ? '1.0' : '0.7'}</priority>
      </url>`,
		)
		.join('')}
  </urlset>`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml',
		},
	});
}
