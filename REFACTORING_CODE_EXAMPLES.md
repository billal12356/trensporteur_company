# Refactoring Code Examples & Implementation Guide

## 1. Quick Win: Extract Utility Functions

### Before (Current State - Duplicated in 3+ pages)
```typescript
// Operateur.tsx
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("ar-DZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Vehecule.tsx
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("ar-DZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Chauffeur.tsx
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("ar-DZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
```

### After (Extracted to utility)
```typescript
// src/lib/formatters.ts
export const formatters = {
  date: (dateString: string): string => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("ar-DZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  },

  status: (status: string): { variant: "default" | "secondary" | "destructive" | "outline"; label: string } => {
    const statusMap: Record<string, { variant: any; label: string }> = {
      active: { variant: "default", label: "نشط" },
      inactive: { variant: "secondary", label: "غير نشط" },
      suspended: { variant: "destructive", label: "معلق" },
      stopped: { variant: "destructive", label: "متوقف" },
    }
    return statusMap[status] || { variant: "outline", label: status || "غير محدد" }
  },

  phone: (phone: string | undefined): string => {
    if (!phone) return "-"
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, "+213 $1 $2 $3") // Format Algerian phone
  },
}

// Usage in pages:
// Operateur.tsx, Vehecule.tsx, Chauffeur.tsx
import { formatters } from "@/lib/formatters"

// In render:
<TableCell>{formatters.date(operateur.date_expiration)}</TableCell>
<TableCell>{formatters.status(operateur.status_activite)}</TableCell>
<TableCell>{formatters.phone(operateur.num_telephone_client)}</TableCell>
```

---

## 2. Extract API Endpoints Configuration

### Before (URLs hardcoded in thunks)
```typescript
// In operateurSlice.ts
export const fetchOperateurs = createAsyncThunk(
  "operateur/fetchOperateurs",
  async (params: {...}, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/v1/operateur-dtw/find-all`, // ❌ Hardcoded
        { params, withCredentials: true }
      )
      return response.data
    } catch (error) { /* ... */ }
  }
)

// In vihiculeSlice.ts
export const fetchVihicules = createAsyncThunk(
  "vihicule/fetchVihicules",
  async (params: {...}, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/v1/vehicles/find-all`, // ❌ Hardcoded
        { params, withCredentials: true }
      )
      return response.data
    } catch (error) { /* ... */ }
  }
)
```

### After (Centralized endpoints)
```typescript
// src/constants/apiEndpoints.ts
export const API_ENDPOINTS = {
  OPERATEUR: {
    FIND_ALL: '/api/v1/operateur-dtw/find-all',
    FIND_ONE: (id: string) => `/api/v1/operateur-dtw/find/${id}`,
    CREATE: '/api/v1/operateur-dtw/create',
    UPDATE: (id: string) => `/api/v1/operateur-dtw/${id}`,
    DELETE: (id: string) => `/api/v1/operateur-dtw/${id}`,
    GENERATE_PDF: (id: string, vehicleIds?: string[]) => {
      const query = vehicleIds?.length ? `?vehicleIds=${vehicleIds.join(',')}` : ''
      return `/api/v1/operateur-dtw/${id}/pdf${query}`
    },
    GENERATE_PDFs: (id: string) => `/api/v1/operateur-dtw/generate-pdf?id=${id}`,
    EXPORT: '/api/v1/operateur-dtw/download',
  },

  VEHICLE: {
    FIND_ALL: '/api/v1/vehicles/find-all',
    FIND_ONE: (id: string) => `/api/v1/vehicles/find/${id}`,
    CREATE: '/api/v1/vehicles/create',
    UPDATE: (id: string) => `/api/v1/vehicles/${id}`,
    DELETE: (id: string) => `/api/v1/vehicles/${id}`,
    EXPORT: '/api/v1/vehicles/download',
    EXPORT_LINES: '/api/v1/vehicles/export-line',
  },

  CHAUFFEUR: {
    FIND_ALL: '/api/v1/chauffeurs/find-all',
    FIND_ONE: (id: string) => `/api/v1/chauffeurs/find/${id}`,
    CREATE: '/api/v1/chauffeurs/create',
    UPDATE: (id: string) => `/api/v1/chauffeurs/${id}`,
    DELETE: (id: string) => `/api/v1/chauffeurs/${id}`,
    EXPORT: '/api/v1/chauffeurs/download',
  },
}

// Usage in slices:
// operateurSlice.ts
export const fetchOperateurs = createAsyncThunk(
  "operateur/fetchOperateurs",
  async (params: {...}, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}${API_ENDPOINTS.OPERATEUR.FIND_ALL}`, // ✅ Centralized
        { params, withCredentials: true }
      )
      return response.data
    } catch (error) { /* ... */ }
  }
)
```

---

## 3. Create Custom Hook: useListPage

### Before (Duplicated in Operateur.tsx, Vehecule.tsx, Chauffeur.tsx)
```typescript
// Operateur.tsx
const EnhancedOperateur = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { operateurs, loading, total, limit } = useSelector((state: RootState) => state.operateur)
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    dispatch(fetchOperateurs({ search: searchQuery, page, limit: 10 }))
  }, [dispatch, searchQuery, page])

  const handleDelete = async (id: string) => {
    await dispatch(deleteOperateur(id))
    dispatch(fetchOperateurs({ search: searchQuery, page, limit: 10 }))
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await dispatch(exportOperateurs({ search: searchQuery }))
    } finally {
      setIsExporting(false)
    }
  }

  const handleRefresh = () => {
    dispatch(fetchOperateurs({ search: searchQuery, page, limit: 10 }))
  }

  const handlePrev = () => {
    if (page > 1) setPage(page - 1)
  }

  const handleNext = () => {
    if (page < Math.ceil(total / limit)) setPage(page + 1)
  }

  // ... same in Vehecule.tsx and Chauffeur.tsx
}
```

### After (Custom Hook)
```typescript
// src/hooks/useListPage.ts
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/redux/store"

interface UseListPageProps {
  fetchThunk: (params: any) => any
  deleteThunk?: (id: string) => any
  exportThunk?: (params: any) => any
  stateSelector: (state: RootState) => any
  limit?: number
}

export const useListPage = ({
  fetchThunk,
  deleteThunk,
  exportThunk,
  stateSelector,
  limit = 10,
}: UseListPageProps) => {
  const dispatch = useDispatch<AppDispatch>()
  const { data, total, loading } = useSelector(stateSelector)
  
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [isExporting, setIsExporting] = useState(false)

  // Fetch data when page or search changes
  useEffect(() => {
    dispatch(fetchThunk({ search: searchQuery, page, limit }))
  }, [dispatch, searchQuery, page])

  // Delete and refresh
  const handleDelete = async (id: string) => {
    if (deleteThunk) {
      await dispatch(deleteThunk(id))
      dispatch(fetchThunk({ search: searchQuery, page, limit }))
    }
  }

  // Export data
  const handleExport = async () => {
    if (exportThunk) {
      setIsExporting(true)
      try {
        await dispatch(exportThunk({ search: searchQuery }))
      } finally {
        setIsExporting(false)
      }
    }
  }

  // Refresh current page
  const handleRefresh = () => {
    dispatch(fetchThunk({ search: searchQuery, page, limit }))
  }

  // Pagination
  const handlePrev = () => {
    if (page > 1) setPage(page - 1)
  }

  const handleNext = () => {
    if (page < Math.ceil(total / limit)) setPage(page + 1)
  }

  // Calculate pagination info
  const totalPages = Math.ceil(total / limit)
  const startIndex = (page - 1) * limit + 1
  const endIndex = Math.min(page * limit, total)

  return {
    page,
    searchQuery,
    setSearchQuery,
    loading,
    isExporting,
    data,
    total,
    totalPages,
    startIndex,
    endIndex,
    handleDelete,
    handleExport,
    handleRefresh,
    handlePrev,
    handleNext,
  }
}

// Usage in pages:
// Operateur.tsx (simplified)
const EnhancedOperateur = () => {
  const {
    page,
    searchQuery,
    setSearchQuery,
    loading,
    isExporting,
    data: operateurs,
    total,
    handleDelete,
    handleExport,
    handleRefresh,
    handlePrev,
    handleNext,
  } = useListPage({
    fetchThunk: fetchOperateurs,
    deleteThunk: deleteOperateur,
    exportThunk: exportOperateurs,
    stateSelector: (state) => ({
      data: state.operateur.operateurs,
      total: state.operateur.total,
      loading: state.operateur.loading,
      limit: state.operateur.limit,
    }),
  })

  return (
    <MainContainer>
      {/* Now only render UI, no duplicated logic */}
      <Input
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="البحث..."
      />
      <Button onClick={handleExport} disabled={isExporting}>
        {isExporting ? "جاري التصدير..." : "تصدير"}
      </Button>
      <Button onClick={handleRefresh} disabled={loading}>
        تحديث
      </Button>
      {/* ... pagination and table */}
    </MainContainer>
  )
}
```

---

## 4. Create Custom Hook: useFormHandler

### Before (Duplicated in CreateOperateur.tsx, UpdateOperateur.tsx, etc.)
```typescript
// CreateOperateur.tsx
const [operateur, setOperateur] = useState<Partial<Operateur>>({})
const [hasChanges, setHasChanges] = useState(false)

const handleChange = (field: keyof Operateur, value: any) => {
  setOperateur((prev) => ({ ...prev, [field]: value }))
}

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  await dispatch(createOperateur(operateur as Operateur)).unwrap()
  navigate("/operateur")
}

// UpdateOperateur.tsx
const [formData, setFormData] = useState<Operateur>({} as Operateur)
const [hasChanges, setHasChanges] = useState(false)

useEffect(() => {
  if (operateur) setFormData(operateur)
}, [operateur])

useEffect(() => {
  if (!operateur) return
  setHasChanges(!isEqual(formData, operateur))
}, [formData, operateur])

const handleChange = (name: keyof Operateur, value: any) => {
  setFormData((prev) => ({ ...prev, [name]: value }))
}

const handleSubmitForm = () => {
  if (!id) return
  dispatch(updateOperateur({ id, data: formData }))
}
```

### After (Custom Hook)
```typescript
// src/hooks/useFormHandler.ts
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { AppDispatch } from "@/redux/store"
import { isEqual } from "lodash"

interface UseFormHandlerProps<T> {
  initialData?: Partial<T>
  onSubmit: (data: T) => Promise<any>
  onSuccess?: (data?: any) => void
  onError?: (error: any) => void
}

export const useFormHandler = <T,>({
  initialData = {},
  onSubmit,
  onSuccess,
  onError,
}: UseFormHandlerProps<T>) => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const [formData, setFormData] = useState<Partial<T>>(initialData)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Update hasChanges when formData or initialData changes
  useEffect(() => {
    setHasChanges(!isEqual(formData, initialData))
  }, [formData, initialData])

  // Update initialData
  useEffect(() => {
    setFormData(initialData)
  }, [initialData])

  // Handle field changes
  const handleChange = (field: keyof T, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value === "" ? undefined : value,
    }))
    // Clear error for this field
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
    if (e) e.preventDefault()

    if (!hasChanges) {
      console.warn("No changes made")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await onSubmit(formData as T)
      onSuccess?.(result)
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || "خطأ غير معروف"
      setErrors({ _general: errorMsg })
      onError?.(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Reset form
  const handleReset = () => {
    setFormData(initialData)
    setErrors({})
  }

  return {
    formData,
    handleChange,
    handleSubmit,
    handleReset,
    hasChanges,
    isSubmitting,
    errors,
    setErrors,
  }
}

// Usage in pages:
// CreateOperateur.tsx (simplified)
const CreateOperateur = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const { formData, handleChange, handleSubmit, hasChanges, isSubmitting, errors } = useFormHandler({
    initialData: {} as Operateur,
    onSubmit: async (data) => {
      return await dispatch(createOperateur(data)).unwrap()
    },
    onSuccess: () => {
      navigate("/operateur")
    },
  })

  return (
    <MainContainer>
      <form onSubmit={handleSubmit}>
        <Input
          value={formData.fullName_arabe ?? ""}
          onChange={(e) => handleChange("fullName_arabe", e.target.value)}
          error={errors.fullName_arabe}
        />
        {/* ... more fields */}
        <Button type="submit" disabled={isSubmitting || !hasChanges}>
          {isSubmitting ? "جاري الحفظ..." : "حفظ"}
        </Button>
      </form>
    </MainContainer>
  )
}
```

---

## 5. Extract Blob Download Utility

### Before (Duplicated in 3+ Redux thunks)
```typescript
// operateurSlice.ts - generatePDF thunk
const blob = new Blob([response.data], { type: "application/pdf" })
const url = window.URL.createObjectURL(blob)
window.open(url)

// vihiculeSlice.ts - DownloadOperateurPDF thunk
const blob = new Blob([response.data], { type: "application/pdf" })
const url = window.URL.createObjectURL(blob)
const a = document.createElement("a")
a.href = url
a.download = vehicleIds?.length ? `operateur_${id}_selected.pdf` : `operateur_${id}.pdf`
a.click()
window.URL.revokeObjectURL(url)
```

### After (Centralized utility)
```typescript
// src/lib/downloads.ts
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a) // Append to ensure visibility
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

export const openBlobInNewWindow = (blob: Blob) => {
  const url = window.URL.createObjectURL(blob)
  window.open(url)
  // Don't revoke URL immediately; user might need it
}

// Usage in slices:
// operateurSlice.ts
export const generatePDF = createAsyncThunk(
  "pdf/generate",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}${API_ENDPOINTS.OPERATEUR.GENERATE_PDFs(id)}`,
        { responseType: "blob" }
      )
      const blob = new Blob([response.data], { type: "application/pdf" })
      openBlobInNewWindow(blob) // ✅ Centralized
      return true
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "PDF generation failed")
    }
  }
)

// vihiculeSlice.ts
export const DownloadOperateurPDF = createAsyncThunk<void, {...}>(
  "operateur/downloadPDF",
  async ({ id, vehicleIds }, { rejectWithValue }) => {
    try {
      const query = vehicleIds?.length ? `?vehicleIds=${vehicleIds.join(",")}` : ""
      const response = await axios.get(
        `${API_URL}${API_ENDPOINTS.OPERATEUR.GENERATE_PDF(id, vehicleIds)}`,
        { responseType: "blob" }
      )
      const blob = new Blob([response.data], { type: "application/pdf" })
      const filename = vehicleIds?.length
        ? `operateur_${id}_selected.pdf`
        : `operateur_${id}.pdf`
      downloadBlob(blob, filename) // ✅ Centralized
    } catch (error) {
      return rejectWithValue("فشل تحميل الملف")
    }
  }
)
```

---

## 6. Create FormBuilder Component

### Before (Massive form with 50+ identical field blocks)
```typescript
// CreateOperateur.tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="flex flex-col gap-2">
    <label className="text-sm text-end font-medium text-gray-700">رقم ملف المتعامل</label>
    <Input
      type="number"
      value={operateur.num_docier_client ?? ""}
      onChange={(e) => handleChange("num_docier_client", Number(e.target.value))}
    />
  </div>
  <div className="flex flex-col gap-2">
    <label className="text-sm text-end font-medium text-gray-700">رقم الولاية</label>
    <Input
      type="number"
      value={operateur.num_wilaya ?? ""}
      onChange={(e) => handleChange("num_wilaya", Number(e.target.value))}
    />
  </div>
</div>

{/* Repeated 30+ more times for different fields */}
```

### After (Dynamic form builder)
```typescript
// src/components/forms/FormBuilder.tsx
import React from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export interface FormFieldConfig<T = any> {
  name: keyof T
  label: string
  type: "text" | "number" | "date" | "email" | "tel" | "select" | "textarea"
  placeholder?: string
  required?: boolean
  disabled?: boolean
  options?: Array<{ label: string; value: string | number }>
  className?: string
  cols?: number // for grid layout (1-4)
  validation?: (value: any) => string | null
}

interface FormBuilderProps<T> {
  fields: FormFieldConfig<T>[]
  data: Partial<T>
  onChange: (field: keyof T, value: any) => void
  onSubmit: (e?: React.FormEvent) => void | Promise<void>
  submitLabel?: string
  isSubmitting?: boolean
  errors?: Record<string, string>
  submitButtonClassName?: string
  formClassName?: string
  containerClassName?: string
}

export const FormBuilder = <T,>({
  fields,
  data,
  onChange,
  onSubmit,
  submitLabel = "حفظ",
  isSubmitting = false,
  errors = {},
  submitButtonClassName = "",
  formClassName = "space-y-6",
  containerClassName = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
}: FormBuilderProps<T>) => {
  // Group fields by column
  const groupedFields = fields.reduce(
    (acc, field) => {
      const cols = field.cols ?? 1
      acc[cols] = acc[cols] ?? []
      acc[cols].push(field)
      return acc
    },
    {} as Record<number, FormFieldConfig<T>[]>
  )

  return (
    <form className={formClassName} onSubmit={onSubmit}>
      {Object.entries(groupedFields).map(([cols, fieldsGroup]) => (
        <div
          key={cols}
          className={containerClassName}
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          }}
        >
          {fieldsGroup.map((field) => (
            <FormField<T>
              key={String(field.name)}
              field={field}
              value={data[field.name] ?? ""}
              onChange={onChange}
              error={errors[String(field.name)]}
            />
          ))}
        </div>
      ))}

      <Button
        type="submit"
        disabled={isSubmitting}
        className={submitButtonClassName || "mt-6 w-full"}
      >
        {isSubmitting ? "جاري الحفظ..." : submitLabel}
      </Button>
    </form>
  )
}

// Helper component for individual field
const FormField = <T,>({
  field,
  value,
  onChange,
  error,
}: {
  field: FormFieldConfig<T>
  value: any
  onChange: (name: keyof T, value: any) => void
  error?: string
}) => {
  const baseClasses = "flex flex-col gap-2"
  const labelClasses = "text-sm font-medium text-end text-gray-700"
  const errorClasses = "text-sm text-red-600"

  return (
    <div className={baseClasses}>
      <label className={labelClasses}>
        {field.label}
        {field.required && <span className="text-red-500 mr-1">*</span>}
      </label>

      {field.type === "select" ? (
        <Select
          value={String(value) ?? ""}
          onValueChange={(val) =>
            onChange(field.name, field.type === "number" ? Number(val) : val)
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={field.placeholder || "اختر..."} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt) => (
              <SelectItem key={opt.value} value={String(opt.value)}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : field.type === "textarea" ? (
        <Textarea
          value={String(value) ?? ""}
          onChange={(e) =>
            onChange(field.name, e.target.value === "" ? undefined : e.target.value)
          }
          placeholder={field.placeholder}
          disabled={field.disabled}
          className={error ? "border-red-500" : ""}
        />
      ) : (
        <Input
          type={field.type}
          value={String(value) ?? ""}
          onChange={(e) => {
            const val = e.target.value
            if (field.type === "number") {
              onChange(field.name, val === "" ? undefined : Number(val))
            } else {
              onChange(field.name, val === "" ? undefined : val)
            }
          }}
          placeholder={field.placeholder}
          disabled={field.disabled}
          className={error ? "border-red-500" : ""}
        />
      )}

      {error && <p className={errorClasses}>{error}</p>}
    </div>
  )
}

// Usage in pages:
// CreateOperateur.tsx (simplified)
import { FormBuilder, FormFieldConfig } from "@/components/forms/FormBuilder"

const CreateOperateur = () => {
  const { formData, handleChange, handleSubmit, isSubmitting, errors } = useFormHandler({...})

  const formFields: FormFieldConfig<Operateur>[] = [
    { name: "num_docier_client", label: "رقم ملف المتعامل", type: "number", required: true, cols: 1 },
    { name: "num_wilaya", label: "رقم الولاية", type: "number", required: true, cols: 1 },
    { name: "date_expiration", label: "تاريخ انتهاء الصلاحية", type: "date", cols: 1 },
    { name: "fullName_arabe", label: "الاسم و لقب المتعامل بالعربية", type: "text", cols: 2 },
    { name: "fullName_francais", label: "الاسم و لقب المتعامل بالفرنسية", type: "text", cols: 2 },
    { name: "activite", label: "النشاط", type: "select", options: [{ label: "نقل المسافرين", value: "نقل المسافرين" }], cols: 1 },
    { name: "status_activite", label: "حالة النشاط", type: "select", options: [{ label: "عمومي", value: "عمومي" }, { label: "خاص", value: "خاص" }], cols: 1 },
    // ... more fields
  ]

  return (
    <MainContainer>
      <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded">
        <h2 className="text-2xl font-bold mb-6">📝 تسجيل المتعامل</h2>
        <FormBuilder<Operateur>
          fields={formFields}
          data={formData}
          onChange={handleChange}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          errors={errors}
          submitLabel="حفظ المتعامل"
        />
      </div>
    </MainContainer>
  )
}
```

---

## Summary Table: Before vs After

| Aspect | Before | After | Savings |
|--------|--------|-------|---------|
| Duplicate formatDate functions | 3 | 1 utility | ~30 LOC |
| Duplicate getStatusBadge functions | 3 | 1 utility | ~36 LOC |
| Duplicate handlePrev/Next logic | 3 | 1 hook | ~45 LOC |
| List page logic duplication | 3 pages | useListPage hook | ~250 LOC |
| Form handling duplication | 4+ pages | useFormHandler hook | ~200 LOC |
| Form field rendering | 50+ hardcoded | FormBuilder component | ~600 LOC |
| Blob download logic | 3+ thunks | downloadBlob utility | ~60 LOC |
| API URL hardcoding | Scattered | API_ENDPOINTS config | ~50 LOC |
| **TOTAL REDUCTION** | **~4,800 LOC** | **~2,000 LOC** | **~2,800 LOC (58%)** |

---

**Implementation Priority**:
1. ✅ Quick wins (formatters, downloads, API endpoints) — 2 hours
2. 🔧 Custom hooks (useListPage, useFormHandler) — 4 hours
3. 🏗️ FormBuilder component — 3 hours
4. 📝 Refactor pages with new infrastructure — 10 hours
5. 🧪 Add tests — 5 hours

**Total**: ~24 hours for a single developer
