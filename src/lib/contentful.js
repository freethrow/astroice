import * as contentful from 'contentful';

// Create the contentful client
const contentfulClient = contentful.createClient({
  space: import.meta.env.CONTENTFUL_SPACE_ID,
  accessToken: import.meta.env.CONTENTFUL_ACCESS_KEY,
});

// Export the client
export { contentfulClient };

// Image optimization helper functions
export const optimizeImage = (imageField, options = {}) => {
  if (!imageField?.fields?.file?.url) return null;
  
  const {
    width = null,
    height = null,
    quality = 80,
    format = 'webp',
    fit = 'fill'
  } = options;
  
  let url = `https:${imageField.fields.file.url}`;
  const params = [];
  
  if (width) params.push(`w=${width}`);
  if (height) params.push(`h=${height}`);
  if (quality) params.push(`q=${quality}`);
  if (format) params.push(`fm=${format}`);
  if (fit) params.push(`fit=${fit}`);
  
  if (params.length > 0) {
    url = `${url}?${params.join('&')}`;
  }
  
  return {
    src: url,
    width: width || imageField.fields.file.details.image.width,
    height: height || imageField.fields.file.details.image.height,
    alt: imageField.fields.title || '',
    contentType: imageField.fields.file.contentType
  };
};

// Generate responsive image sizes
export const getResponsiveImageSet = (imageField) => {
  if (!imageField?.fields?.file?.url) return null;
  
  return {
    thumbnail: optimizeImage(imageField, { width: 300, height: 300 }),
    small: optimizeImage(imageField, { width: 640 }),
    medium: optimizeImage(imageField, { width: 1024 }),
    large: optimizeImage(imageField, { width: 1600 }),
    original: optimizeImage(imageField)
  };
};

// Fetch entries with common params
const fetchEntries = async (content_type, options = {}) => {
  const entries = await contentfulClient.getEntries({
    content_type,
    ...options,
  });
  return entries.items;
};

// Helper function to fetch all events
export async function getAllEvents() {
  const entries = await contentfulClient.getEntries({
    content_type: 'event',
    order: '-fields.eventTime' // The minus sign indicates descending order
  });
  return entries.items;
}

// Helper function to fetch a single event by slug
export async function getEventBySlug(slug) {
  const entries = await contentfulClient.getEntries({
    content_type: 'event',
    'fields.slug': slug,
    limit: 1
  });
  return entries.items[0];
}


// Get single event and its clippings
export async function getEventAndClippings(slug) {
  const eventEntries = await fetchEntries('event', { 'fields.slug': slug, limit: 1 });
  const event = eventEntries[0];

  const clippings = event ? await fetchEntries('clipping', {
    'fields.event.sys.id': event.sys.id,
    order: '-sys.createdAt'
  }) : [];

  return { event, clippings };
}

// Helper function to fetch all articles
export async function getAllArticles() {
  const entries = await contentfulClient.getEntries({
    content_type: 'article',
    order: '-sys.createdAt'
  });
  return entries.items;
}

// Helper function to fetch a single article by slug
export async function getArticleBySlug(slug) {
  const entries = await contentfulClient.getEntries({
    content_type: 'article',
    'fields.slug': slug,
    limit: 1
  });
  return entries.items[0];
}

export async function getAllGalleries() {
  const entries = await contentfulClient.getEntries({
    content_type: 'gallery',
    order: '-sys.createdAt'
  });
  return entries.items;
}

// Helper function to fetch a single gallery by slug
export async function getGalleryBySlug(slug) {
  const entries = await contentfulClient.getEntries({
    content_type: 'gallery',
    'fields.slug': slug,
    limit: 1
  });
  return entries.items[0];
}

// Add helper function for clippings
export async function getAllClippings() {
  const entries = await contentfulClient.getEntries({
    content_type: 'clipping',
    order: '-sys.createdAt'
  });
  return entries.items;
}

export async function getAllDocuments() {
  const entries = await contentfulClient.getEntries({
    content_type: 'document'
  });
  return entries.items;
}

export async function getAllVideos() {
  const entries = await contentfulClient.getEntries({
    content_type: 'video',
    order: '-sys.createdAt'
  });
  return entries.items;
}