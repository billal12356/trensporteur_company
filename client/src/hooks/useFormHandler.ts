/**
 * useFormHandler Hook - Eliminates duplicate form logic
 * Used by: CreateOperateur.tsx, UpdateOperateur.tsx, CreateVihicules.tsx, UpdateVihicules.tsx, etc.
 * Reduces ~200 LOC per form page
 */

import { useEffect, useState } from "react"
import { isEqual } from "lodash"

interface UseFormHandlerOptions<T> {
  initialData?: Partial<T>
  onSubmit: (data: T) => Promise<any>
  onSuccess?: (data?: any) => void
  onError?: (error: any) => void
  compareOriginal?: Partial<T>
}

interface UseFormHandlerReturn<T> {
  formData: Partial<T>
  setFormData: (data: Partial<T>) => void
  handleChange: (field: keyof T, value: any) => void
  handleSubmit: (e?: React.FormEvent) => Promise<void>
  handleReset: () => void
  hasChanges: boolean
  isSubmitting: boolean
  errors: Record<string, string>
  setErrors: (errors: Record<string, string>) => void
  clearError: (field: string) => void
  addError: (field: string, message: string) => void
}

/**
 * Custom hook for form handling
 * Centralizes form state, validation, submission, and change detection
 */
export const useFormHandler = <T,>({
  initialData = {},
  onSubmit,
  onSuccess,
  onError,
  compareOriginal,
}: UseFormHandlerOptions<T>): UseFormHandlerReturn<T> => {
  const [formData, setFormData] = useState<Partial<T>>(initialData)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Detect changes when formData changes
  useEffect(() => {
    const compareData = compareOriginal ?? initialData
    setHasChanges(!isEqual(formData, compareData))
  }, [formData, initialData, compareOriginal])

  // Update formData when initialData changes (e.g., loading form data)
  useEffect(() => {
    setFormData(initialData)
  }, [initialData])

  // Handle field change
  const handleChange = (field: keyof T, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value === "" ? undefined : value,
    }))

    // Clear error for this field when user starts typing
    if (errors[field as string]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field as string]
        return newErrors
      })
    }
  }

  // Submit form
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    // Don't submit if no changes
    if (!hasChanges) {
      console.warn("No changes detected")
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const result = await onSubmit(formData as T)
      onSuccess?.(result)
    } catch (error: any) {
      console.error("Form submission error:", error)

      // Extract error message from various sources
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        error?.error ||
        "حدث خطأ غير معروف"

      // Set general error or field-specific errors
      if (typeof error?.response?.data?.errors === "object") {
        setErrors(error.response.data.errors)
      } else {
        setErrors({ _general: errorMsg })
      }

      onError?.(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset form to initial state
  const handleReset = () => {
    setFormData(initialData)
    setErrors({})
  }

  // Clear specific error
  const clearError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }

  // Add error for specific field
  const addError = (field: string, message: string) => {
    setErrors((prev) => ({
      ...prev,
      [field]: message,
    }))
  }

  return {
    formData,
    setFormData,
    handleChange,
    handleSubmit,
    handleReset,
    hasChanges,
    isSubmitting,
    errors,
    setErrors,
    clearError,
    addError,
  }
}
