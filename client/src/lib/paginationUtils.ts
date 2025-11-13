/**
 * Pagination utility functions
 * Eliminates repeated pagination logic in list pages
 */

/**
 * Calculate total pages
 * @param total - Total items count
 * @param limit - Items per page
 * @returns Total number of pages
 */
export const calculateTotalPages = (total: number, limit: number): number => {
  return Math.ceil(total / limit)
}

/**
 * Calculate start and end indices for current page
 * @param page - Current page number (1-based)
 * @param limit - Items per page
 * @param total - Total items count
 * @returns Object with start and end indices
 */
export const calculatePageIndices = (
  page: number,
  limit: number,
  total: number
): { startIndex: number; endIndex: number } => {
  const startIndex = (page - 1) * limit + 1
  const endIndex = Math.min(page * limit, total)
  return { startIndex, endIndex }
}

/**
 * Check if can go to next page
 * @param page - Current page number
 * @param total - Total items count
 * @param limit - Items per page
 * @returns True if can go next
 */
export const canGoNext = (page: number, total: number, limit: number): boolean => {
  return page < calculateTotalPages(total, limit)
}

/**
 * Check if can go to previous page
 * @param page - Current page number
 * @returns True if can go previous
 */
export const canGoPrevious = (page: number): boolean => {
  return page > 1
}

/**
 * Get next page number
 * @param page - Current page number
 * @param total - Total items count
 * @param limit - Items per page
 * @returns Next page number or current page if already at end
 */
export const getNextPage = (page: number, total: number, limit: number): number => {
  return canGoNext(page, total, limit) ? page + 1 : page
}

/**
 * Get previous page number
 * @param page - Current page number
 * @returns Previous page number or 1 if already at start
 */
export const getPreviousPage = (page: number): number => {
  return canGoPrevious(page) ? page - 1 : 1
}

/**
 * Pagination info object
 */
export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  startIndex: number
  endIndex: number
  canGoNext: boolean
  canGoPrevious: boolean
}

/**
 * Get complete pagination info
 * @param page - Current page
 * @param limit - Items per page
 * @param total - Total items
 * @returns Complete pagination information
 */
export const getPaginationInfo = (page: number, limit: number, total: number): PaginationInfo => {
  const totalPages = calculateTotalPages(total, limit)
  const { startIndex, endIndex } = calculatePageIndices(page, limit, total)

  return {
    page,
    limit,
    total,
    totalPages,
    startIndex,
    endIndex,
    canGoNext: canGoNext(page, total, limit),
    canGoPrevious: canGoPrevious(page),
  }
}

/**
 * Format pagination display text
 * @param startIndex - Start index
 * @param endIndex - End index
 * @param total - Total items
 * @returns Formatted text like "عرض 1-10 من 100"
 */
export const formatPaginationText = (startIndex: number, endIndex: number, total: number): string => {
  if (total === 0) return "لا توجد نتائج"
  return `عرض ${startIndex}-${endIndex} من ${total}`
}
