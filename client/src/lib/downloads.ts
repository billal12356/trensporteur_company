/**
 * Centralized blob/file download utilities
 * Eliminates duplication in: operateurSlice.ts, vihiculeSlice.ts, generatePDF, DownloadOperateurPDF
 */

/**
 * Download a blob as a file
 * @param blob - The Blob to download
 * @param filename - The filename to save as
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a) // Append to ensure visibility in some browsers
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

/**
 * Open a blob in a new window (used for PDFs)
 * @param blob - The Blob to open
 * @returns The window reference
 */
export const openBlobInNewWindow = (blob: Blob): Window | null => {
  const url = window.URL.createObjectURL(blob)
  const newWindow = window.open(url)
  // Note: Don't revoke immediately; user might need the URL
  // Consider revoking after a delay or when window closes
  setTimeout(() => {
    window.URL.revokeObjectURL(url)
  }, 60000) // Revoke after 1 minute
  return newWindow
}

/**
 * Download a blob as PDF with specific filename
 * @param blob - PDF blob
 * @param filename - PDF filename
 */
export const downloadPDF = (blob: Blob, filename: string = "document.pdf"): void => {
  downloadBlob(blob, filename.endsWith(".pdf") ? filename : `${filename}.pdf`)
}

/**
 * Download a blob as Excel file
 * @param blob - Excel blob
 * @param filename - Excel filename
 */
export const downloadExcel = (blob: Blob, filename: string = "data.xlsx"): void => {
  downloadBlob(blob, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`)
}

/**
 * Download JSON data as file
 * @param data - Object to download as JSON
 * @param filename - Filename to save as
 */
export const downloadJSON = (data: any, filename: string = "data.json"): void => {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: "application/json" })
  downloadBlob(blob, filename.endsWith(".json") ? filename : `${filename}.json`)
}

/**
 * Download CSV data as file
 * @param csvContent - CSV content as string
 * @param filename - Filename to save as
 */
export const downloadCSV = (csvContent: string, filename: string = "data.csv"): void => {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  downloadBlob(blob, filename.endsWith(".csv") ? filename : `${filename}.csv`)
}

/**
 * Create a CSV from array of objects
 * @param data - Array of objects
 * @param filename - Filename to save as
 */
export const downloadDataAsCSV = <T extends Record<string, any>>(
  data: T[],
  filename: string = "data.csv"
): void => {
  if (!data || data.length === 0) {
    console.warn("No data to download")
    return
  }

  // Get headers from first object
  const headers = Object.keys(data[0])
  const csv = [
    headers.join(","),
    ...data.map((row) => headers.map((header) => JSON.stringify(row[header] ?? "")).join(",")),
  ].join("\n")

  downloadCSV(csv, filename)
}

/**
 * Generate a data URL for display purposes (not download)
 * @param blob - The Blob
 * @returns Data URL
 */
export const getBlobURL = (blob: Blob): string => {
  return window.URL.createObjectURL(blob)
}

/**
 * Revoke a blob URL (cleanup)
 * @param url - The blob URL to revoke
 */
export const revokeBlobURL = (url: string): void => {
  window.URL.revokeObjectURL(url)
}
