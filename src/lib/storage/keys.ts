/** Central key names so storage stays consistent across reloads and future connectors. */

export const STORAGE_NS = 'statfinder:v1'

export const SETTINGS_KEY = `${STORAGE_NS}:settings`
export const API_KEY_SESSION = `${STORAGE_NS}:apiKey:session`
export const API_KEY_LOCAL = `${STORAGE_NS}:apiKey:local`

export const SAVED_QUERIES_KEY = `${STORAGE_NS}:savedQueries`
