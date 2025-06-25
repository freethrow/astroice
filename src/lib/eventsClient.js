// src/lib/eventsClient.js

// Store the base URL for the Google Apps Script web app
const GOOGLE_SCRIPT_URL = import.meta.env.PUBLIC_GOOGLE_SCRIPT_URL;

/**
 * Basic fetch wrapper with error handling
 * @param {Object} params - Parameters to send to the Google Script API
 * @returns {Promise<Object>} - Response data
 */
async function fetchFromScript(params = {}) {
  // Construct URL with query parameters
  const url = new URL(GOOGLE_SCRIPT_URL);
  
  // Add any query parameters
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      url.searchParams.append(key, params[key]);
    }
  });

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching from Google Script:', error);
    throw error;
  }
}

/**
 * Get all events from the API
 * @returns {Promise<Array>} - Array of event objects
 */
export async function getAllEvents() {
  const data = await fetchFromScript();
  // sort by date descending and only events in the past


  data.data.sort((a, b) => {
    const dateA = new Date(a.data_inizio);
    const dateB = new Date(b.data_inizio);
    return dateB - dateA;
  });
  
  return data.data || [];
}

/**
 * Get a single event by ID
 * @param {number} id - Event ID
 * @returns {Promise<Object|null>} - Event object or null if not found
 */
export async function getEventById(id) {
  const events = await getAllEvents();
  return events.find(event => event.id === Number(id)) || null;
}

/**
 * Get events by category
 * @param {string} categoria - Category name
 * @returns {Promise<Array>} - Array of filtered events
 */
export async function getEventsByCategory(categoria) {
  const events = await getAllEvents();
  return events.filter(event => event.categoria === categoria);
}

/**
 * Get events by office
 * @param {string} office - Office name
 * @returns {Promise<Array>} - Array of filtered events
 */
export async function getEventsByOffice(office) {
  const events = await getAllEvents();
  return events.filter(event => event.office === office);
}

/**
 * Get events by country
 * @param {string} paese - Country name
 * @returns {Promise<Array>} - Array of filtered events
 */
export async function getEventsByCountry(paese) {
  const events = await getAllEvents();
  return events.filter(event => event.paese === paese);
}

/**
 * Get events by city
 * @param {string} citta - City name
 * @returns {Promise<Array>} - Array of filtered events
 */
export async function getEventsByCity(citta) {
  const events = await getAllEvents();
  return events.filter(event => event.citta === citta);
}

/**
 * Get upcoming events (events with start date after today)
 * @param {number} limit - Maximum number of events to return
 * @returns {Promise<Array>} - Array of upcoming events
 */
export async function getUpcomingEvents(limit = 10) {
  const events = await getAllEvents();
  const today = new Date();
  
  return events
    .filter(event => new Date(event.data_inizio) >= today)
    .sort((a, b) => new Date(a.data_inizio) - new Date(b.data_inizio))
    .slice(0, limit);
}

/**
 * Get past events (events with end date before today)
 * @param {number} limit - Maximum number of events to return
 * @returns {Promise<Array>} - Array of past events
 */
export async function getPastEvents(limit = 10) {
  const events = await getAllEvents();
  const today = new Date();
  
  return events
    .filter(event => new Date(event.data_fine) < today)
    .sort((a, b) => new Date(b.data_fine) - new Date(a.data_fine))
    .slice(0, limit);
}

/**
 * Search events by title or description
 * @param {string} query - Search term
 * @returns {Promise<Array>} - Array of matching events
 */
export async function searchEvents(query) {
  if (!query) return [];
  
  const events = await getAllEvents();
  const normalizedQuery = query.toLowerCase();
  
  return events.filter(event => 
    event.titolo.toLowerCase().includes(normalizedQuery) || 
    event.descrizione.toLowerCase().includes(normalizedQuery)
  );
}

/**
 * Get events by date range
 * @param {string} startDate - Start date in ISO format (YYYY-MM-DD)
 * @param {string} endDate - End date in ISO format (YYYY-MM-DD)
 * @returns {Promise<Array>} - Array of events within date range
 */
export async function getEventsByDateRange(startDate, endDate) {
  const events = await getAllEvents();
  const start = startDate ? new Date(startDate) : new Date(0);
  const end = endDate ? new Date(endDate) : new Date('2099-12-31');
  
  return events.filter(event => {
    const eventStart = new Date(event.data_inizio);
    return eventStart >= start && eventStart <= end;
  });
}

/**
 * Get events by type
 * @param {string} tipologia - Event type
 * @returns {Promise<Array>} - Array of filtered events
 */
export async function getEventsByType(tipologia) {
  const events = await getAllEvents();
  return events.filter(event => event.tipologia === tipologia);
}

/**
 * Get events sorted by start date
 * @param {boolean} ascending - Sort direction (true for ascending, false for descending)
 * @returns {Promise<Array>} - Sorted array of events
 */
export async function getEventsSortedByDate(ascending = true) {
  const events = await getAllEvents();
  
  return events.sort((a, b) => {
    const dateA = new Date(a.data_inizio);
    const dateB = new Date(b.data_inizio);
    return ascending ? dateA - dateB : dateB - dateA;
  });
}

/**
 * Get events grouped by year and month
 * @returns {Promise<Object>} - Events grouped by year and month
 */
export async function getEventsGroupedByMonth() {
  const events = await getAllEvents();
  const groupedEvents = {};
  
  events.forEach(event => {
    const date = new Date(event.data_inizio);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // JavaScript months are 0-indexed
    
    if (!groupedEvents[year]) {
      groupedEvents[year] = {};
    }
    
    if (!groupedEvents[year][month]) {
      groupedEvents[year][month] = [];
    }
    
    groupedEvents[year][month].push(event);
  });
  
  return groupedEvents;
}

export async function getPastEvents(limit = null) {
  const events = await getAllEvents();
  const today = new Date();
  
  const pastEvents = events
    .filter(event => new Date(event.data_inizio) < today)
    .sort((a, b) => new Date(b.data_inizio) - new Date(a.data_inizio)); // Most recent first
  
  return limit ? pastEvents.slice(0, limit) : pastEvents;
}
