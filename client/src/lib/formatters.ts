/**
 * Centralized formatting utilities to eliminate duplication across pages
 * Used by: Operateur.tsx, Vehecule.tsx, Chauffeur.tsx, DetailsOperateur.tsx
 */

/**
 * Format date to Arabic locale (ar-DZ) with long format
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string or "-" if invalid
 */
export const formatDate = (dateString: string | Date | undefined): string => {
  if (!dateString) return "-"
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "-"
    return date.toLocaleDateString("ar-DZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch {
    return "-"
  }
}

/**
 * Format date to French locale (fr-FR) with long format
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string or "-" if invalid
 */
export const formatDateFrench = (dateString: string | Date | undefined): string => {
  if (!dateString) return "-"
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "-"
    return date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch {
    return "-"
  }
}

/**
 * Format date to short format (YYYY-MM-DD)
 * @param dateString - ISO date string
 * @returns Short formatted date or "-"
 */
export const formatDateShort = (dateString: string | Date | undefined): string => {
  if (!dateString) return "-"
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "-"
    return date.toISOString().split("T")[0]
  } catch {
    return "-"
  }
}

/**
 * Format time string (HH:MM or HH:MM:SS)
 * Ensures consistent formatting across locales
 * @param timeString - time string in format "HH:MM" or "HH:MM:SS"
 * @returns Formatted time or "-"
 */
export const formatTime = (timeString: string | undefined): string => {
  if (!timeString) return "-"
  
  // If it looks like a valid time format, return as-is
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(timeString)) {
    return timeString
  }
  
  // Try to parse as Date and format as time
  try {
    const date = new Date(timeString)
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    }
  } catch {
    // Fall through
  }
  
  return timeString || "-"
}

/**
 * Get status badge configuration with variant and label
 * Used by: Operateur.tsx, Vehecule.tsx, Chauffeur.tsx
 * @param status - status string
 * @returns Object with variant and label
 */
export const getStatusBadge = (
  status: string | undefined
): { variant: "default" | "secondary" | "destructive" | "outline"; label: string } => {
  const statusMap: Record<
    string,
    { variant: "default" | "secondary" | "destructive" | "outline"; label: string }
  > = {
    active: { variant: "default", label: "نشط" },
    inactive: { variant: "secondary", label: "غير نشط" },
    suspended: { variant: "destructive", label: "معلق" },
    stopped: { variant: "destructive", label: "متوقف" },
    paused: { variant: "secondary", label: "موقوف مؤقتاً" },
    pending: { variant: "outline", label: "قيد الانتظار" },

    // Arabic variants
    نشط: { variant: "default", label: "نشط" },
    "غير نشط": { variant: "secondary", label: "غير نشط" },
    معلق: { variant: "destructive", label: "معلق" },
    متوقف: { variant: "destructive", label: "متوقف" },

    // Other common statuses
    عمومي: { variant: "default", label: "عمومي" },
    خاص: { variant: "secondary", label: "خاص" },
    PRIVE: { variant: "secondary", label: "خاص" },
    PUBLICE: { variant: "default", label: "عمومي" },
  }

  if (!status) {
    return { variant: "outline", label: "غير محدد" }
  }

  return (
    statusMap[status] || {
      variant: "outline" as const,
      label: status || "غير محدد",
    }
  )
}

/**
 * Format phone number (Algerian format)
 * Converts: "213XXXXXXXXX" → "+213 XXX XXX XXXX"
 * @param phone - phone number string
 * @returns Formatted phone or "-"
 */
export const formatPhone = (phone: string | undefined): string => {
  if (!phone) return "-"

  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, "")

  // If already has +213 prefix or 0213, format accordingly
  if (cleaned.startsWith("213")) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`
  }

  // If starts with 0, replace with 213
  if (cleaned.startsWith("0")) {
    const without0 = cleaned.slice(1)
    return `+213 ${without0.slice(0, 3)} ${without0.slice(3, 6)} ${without0.slice(6)}`
  }

  // Default formatting
  if (cleaned.length >= 9) {
    return `+213 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`
  }

  return phone
}

/**
 * Format currency (DZD - Algerian Dinar)
 * @param amount - amount as number
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number | undefined): string => {
  if (amount === undefined || amount === null) return "-"
  return new Intl.NumberFormat("ar-DZ", {
    style: "currency",
    currency: "DZD",
    minimumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format number with Arabic locale
 * @param num - number to format
 * @returns Formatted number string
 */
export const formatNumber = (num: number | undefined): string => {
  if (num === undefined || num === null) return "-"
  return new Intl.NumberFormat("ar-DZ").format(num)
}

/**
 * Truncate string with ellipsis
 * @param str - string to truncate
 * @param length - max length
 * @returns Truncated string
 */
export const truncate = (str: string | undefined, length: number = 50): string => {
  if (!str) return "-"
  return str.length > length ? str.slice(0, length) + "..." : str
}

/**
 * Convert yes/no or true/false to Arabic
 * @param value - boolean or string
 * @returns Arabic label
 */
export const formatBoolean = (value: boolean | string | undefined): string => {
  if (value === undefined || value === null) return "لا"
  if (typeof value === "boolean") {
    return value ? "نعم" : "لا"
  }
  if (value === "yes") return "نعم"
  if (value === "no") return "لا"
  return String(value)
}

/**
 * Safe JSON parse with fallback
 * @param str - JSON string
 * @param fallback - fallback value
 * @returns Parsed object or fallback
 */
export const safeParse = <T = any>(str: string | undefined, fallback: T): T => {
  if (!str) return fallback
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}

/**
 * All formatters exported as a single object for convenience
 */
export const formatters = {
  date: formatDate,
  dateFrench: formatDateFrench,
  dateShort: formatDateShort,
  time: formatTime,
  status: getStatusBadge,
  phone: formatPhone,
  currency: formatCurrency,
  number: formatNumber,
  truncate,
  boolean: formatBoolean,
}
