// @/services/shoeby-scraper.ts
'use server';

/**
 * @fileOverview Service for scraping search results from Shoeby.nl.
 */

/**
 * Fetches search results HTML from Shoeby.nl based on clothing item and color.
 * Note: This is a basic scraper and might break if Shoeby.nl changes its structure
 * or implements anti-scraping measures. It also doesn't handle JavaScript-rendered content.
 *
 * @param clothingItem - The type of clothing item to search for.
 * @param colorPreference - The preferred color.
 * @returns A promise that resolves to the HTML string of the search results page, or null if an error occurs.
 */
export async function scrapeShoebySearchResults(
  clothingItem: string,
  colorPreference: string
): Promise<string | null> {
  const searchQuery = `${clothingItem} ${colorPreference}`;
  //This is a simplified example URL. Actual Shoeby.nl search URL structure might be different
  //and require more sophisticated parameter handling.
  const searchUrl = `https://www.shoeby.nl/zoeken?query=${encodeURIComponent(searchQuery)}`;

  try {
    console.log(`Attempting to scrape: ${searchUrl}`);
    const response = await fetch(searchUrl, {
      headers: {
        // Mimic a browser User-Agent to reduce chances of being blocked
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch from Shoeby.nl: ${response.status} ${response.statusText}`);
      const errorBody = await response.text();
      console.error(`Error body: ${errorBody.substring(0, 500)}...`); // Log first 500 chars of error
      return null;
    }

    const htmlContent = await response.text();
    if (!htmlContent || htmlContent.length < 100) {
        console.warn(`Scraped HTML content from ${searchUrl} seems too short or empty.`);
        return null;
    }
    console.log(`Successfully scraped ${htmlContent.length} bytes from ${searchUrl}`);
    return htmlContent;
  } catch (error) {
    console.error(`Error scraping Shoeby.nl for query "${searchQuery}":`, error);
    return null;
  }
}
