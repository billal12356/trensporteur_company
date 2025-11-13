/**
 * Centralized API endpoints configuration
 * Eliminates hardcoded URLs scattered across Redux slices
 * Used by: operateurSlice.ts, vihiculeSlice.ts, chauffeurSlice.ts
 */

export const API_ENDPOINTS = {
  // ============ OPERATEUR ENDPOINTS ============
  OPERATEUR: {
    FIND_ALL: "/api/v1/operateur-dtw/find-all",
    FIND_ONE: (id: string) => `/api/v1/operateur-dtw/find/${id}`,
    CREATE: "/api/v1/operateur-dtw/create",
    UPDATE: (id: string) => `/api/v1/operateur-dtw/${id}`,
    DELETE: (id: string) => `/api/v1/operateur-dtw/${id}`,

    // PDF Generation
    GENERATE_PDF: (id: string) => `/api/v1/operateur-dtw/generate?id=${id}`,
    GENERATE_PDFs: (id: string) => `/api/v1/operateur-dtw/generate-pdf?id=${id}`,

    // PDF with vehicle selection
    GENERATE_PDF_WITH_VEHICLES: (id: string, vehicleIds?: string[]) => {
      const query = vehicleIds?.length ? `?vehicleIds=${vehicleIds.join(",")}` : ""
      return `/api/v1/operateur-dtw/${id}/pdf${query}`
    },

    // Export & Download
    EXPORT: "/api/v1/operateur-dtw/download",
    EXPORT_STATS: (startDate: string, endDate: string) =>
      `/api/v1/operateur-dtw/export-stats?startDate=${startDate}&endDate=${endDate}`,
  },

  // ============ VEHICLE ENDPOINTS ============
  VEHICLE: {
    FIND_ALL: "/api/v1/vehicles/find-all",
    FIND_ONE: (id: string) => `/api/v1/vehicles/find/${id}`,
    CREATE: "/api/v1/vehicles/create",
    UPDATE: (id: string) => `/api/v1/vehicles/${id}`,
    DELETE: (id: string) => `/api/v1/vehicles/${id}`,

    // Export
    EXPORT: "/api/v1/vehicles/download",
    EXPORT_LINES: "/api/v1/vehicles/export-line",
  },

  // ============ CHAUFFEUR ENDPOINTS ============
  CHAUFFEUR: {
    FIND_ALL: "/api/v1/chauffeurs/find-all",
    FIND_ONE: (id: string) => `/api/v1/chauffeurs/find/${id}`,
    CREATE: "/api/v1/chauffeurs/create",
    UPDATE: (id: string) => `/api/v1/chauffeurs/${id}`,
    DELETE: (id: string) => `/api/v1/chauffeurs/${id}`,

    // Export
    EXPORT: "/api/v1/chauffeurs/download",
  },

  // ============ AUTH ENDPOINTS ============
  AUTH: {
    LOGIN: "/api/v1/auth/login",
    LOGOUT: "/api/v1/auth/logout",
    REFRESH: "/api/v1/auth/refresh",
    VERIFY: "/api/v1/auth/verify",
  },

  // ============ STATE ENDPOINTS ============
  STATE: {
    FIND_ALL: "/api/v1/state/find-all",
    FIND_ONE: (id: string) => `/api/v1/state/find/${id}`,
  },

  // ============ EXCEL IMPORT ENDPOINTS ============
  IMPORT: {
    OPERATEUR: "/api/v1/import-operateur/upload",
    VEHICLES: "/api/v1/import-vehicles/upload",
    CHAUFFEURS: "/api/v1/import-chauffeurs/upload",
  },
}

/**
 * Helper function to build full API URL
 * @param apiBaseUrl - Base API URL from env
 * @param endpoint - Endpoint path from API_ENDPOINTS
 * @returns Full URL
 */
export const buildAPIURL = (apiBaseUrl: string, endpoint: string): string => {
  // Remove trailing slash from baseUrl if present
  const base = apiBaseUrl.endsWith("/") ? apiBaseUrl.slice(0, -1) : apiBaseUrl
  // Ensure endpoint starts with /
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`
  return `${base}${path}`
}

/**
 * Type-safe endpoint getter
 * Usage: getEndpoint("OPERATEUR", "FIND_ALL")
 */
export const getEndpoint = <T extends keyof typeof API_ENDPOINTS>(
  resource: T,
  key: keyof (typeof API_ENDPOINTS)[T]
): any => {
  return (API_ENDPOINTS[resource] as any)[key]
}
