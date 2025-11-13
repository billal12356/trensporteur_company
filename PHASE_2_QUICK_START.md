# 🚀 Phase 2 Components - Quick Start Guide

## Table of Contents
1. [FormBuilder](#formbuilder)
2. [ListTable](#listtable)
3. [ErrorBoundary](#errorboundary)
4. [Skeleton Components](#skeleton-components)

---

## FormBuilder

### Basic Usage

```typescript
import { FormBuilder, FormFieldsBuilder } from '@/components'

// Define fields
const fields = new FormFieldsBuilder<CreateOperateurDTO>()
  .text('name', 'الاسم', 2)
  .email('email', 'البريد الإلكتروني', 2)
  .phone('phone', 'رقم الهاتف')
  .textarea('address', 'العنوان', 3, 4)
  .build()

// Use in component
const [formData, setFormData] = useState({})
const [errors, setErrors] = useState({})
const [isSubmitting, setIsSubmitting] = useState(false)

<FormBuilder
  fields={fields}
  data={formData}
  onChange={(field, value) => setFormData({...formData, [field]: value})}
  onSubmit={async () => {
    setIsSubmitting(true)
    try {
      await dispatch(createOperateur(formData))
      navigate('/list')
    } finally {
      setIsSubmitting(false)
    }
  }}
  isSubmitting={isSubmitting}
  errors={errors}
  submitLabel="حفظ"
  resetButton={true}
  onReset={() => setFormData({})}
/>
```

### Advanced: Custom Rendering

```typescript
const fields = [
  {
    name: 'name',
    label: 'الاسم',
    type: 'text',
    required: true,
    validation: (val) => val?.length < 3 ? 'Must be at least 3 characters' : null,
    cols: 2
  },
  {
    name: 'status',
    label: 'الحالة',
    type: 'select',
    options: [
      { label: 'نشط', value: 'active' },
      { label: 'غير نشط', value: 'inactive' }
    ],
    required: true,
    cols: 2
  },
  {
    name: 'description',
    label: 'الوصف',
    type: 'textarea',
    rows: 4,
    cols: 4
  }
]

<FormBuilder
  fields={fields}
  data={formData}
  onChange={handleChange}
  onSubmit={handleSubmit}
  containerClassName="grid grid-cols-1 md:grid-cols-2 gap-6"
  submitButtonClassName="bg-blue-600 hover:bg-blue-700"
/>
```

### With useFormHandler Hook

```typescript
import { useFormHandler } from '@/hooks'

const { formData, handleChange, handleSubmit, hasChanges, errors, setErrors } = 
  useFormHandler({
    initialData: initialOperateur,
    onSubmit: async (data) => {
      const result = await dispatch(updateOperateur(data))
      return result
    },
    onSuccess: () => navigate('/list')
  })

<FormBuilder
  fields={fields}
  data={formData}
  onChange={handleChange}
  onSubmit={handleSubmit}
  errors={errors}
/>

// Show save button only if changes detected
{hasChanges && <Button>Save Changes</Button>}
```

---

## ListTable

### Basic Usage

```typescript
import { ListTable, useTableColumns, useTableActions } from '@/components'

const columns = useTableColumns<Operateur>()
const [tableColumns] = useState([
  columns.text('name', 'الاسم', true),           // sortable
  columns.text('email', 'البريد الإلكتروني'),
  columns.date('createdAt', 'تاريخ الإنشاء', true),
  columns.badge('status', 'الحالة')
])

const actions = useTableActions(
  (item) => navigate(`/operateur/${item.id}/edit`),  // onEdit
  (item) => navigate(`/operateur/${item.id}`),       // onView
  (item) => dispatch(deleteOperateur(item.id))       // onDelete
)

<ListTable
  columns={tableColumns}
  data={operateurs}
  actions={actions}
  isLoading={loading}
  isEmpty={operateurs.length === 0}
  emptyMessage="لا توجد بيانات متاحة"
  pagination={{
    page,
    total,
    limit: 10,
    onPageChange: setPage
  }}
  hoverable={true}
  striped={true}
/>
```

### Advanced: Custom Column Rendering

```typescript
const columns = [
  columns.text('name', 'الاسم', true),
  {
    key: 'phone' as const,
    label: 'الهاتف',
    render: (value) => <a href={`tel:${value}`}>{value}</a>
  },
  {
    key: 'operateurs' as const,
    label: 'عدد السيارات',
    render: (_, item) => item.operateurs?.length || 0,
    alignment: 'center'
  },
  {
    key: 'status' as const,
    label: 'الحالة',
    render: (status) => (
      <Badge 
        variant={status === 'active' ? 'default' : 'secondary'}
      >
        {status}
      </Badge>
    )
  }
]
```

### With useListPage Hook

```typescript
import { useListPage } from '@/hooks'

const {
  page,
  setPage,
  searchQuery,
  setSearchQuery,
  loading,
  isExporting,
  data,
  total,
  pagination,
  handleDelete,
  handleExport,
  handleRefresh
} = useListPage({
  fetchThunk: fetchOperateurs,
  deleteThunk: deleteOperateur,
  exportThunk: exportOperateurs,
  stateSelector: (state) => ({
    data: state.operateur.operateurs,
    total: state.operateur.total,
    loading: state.operateur.loading,
    limit: 10
  })
})

<div>
  <Input
    placeholder="Search..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
  
  <Button onClick={handleExport} disabled={isExporting}>
    {isExporting ? 'Exporting...' : 'Export'}
  </Button>
  
  <ListTable
    columns={columns}
    data={data}
    isLoading={loading}
    pagination={pagination}
    actions={useTableActions(null, null, handleDelete)}
  />
</div>
```

---

## ErrorBoundary

### Basic Wrapping

```typescript
import { ErrorBoundary } from '@/components'

<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

### With Custom Fallback

```typescript
<ErrorBoundary
  fallback={(error, retry) => (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
      <h2 className="text-red-900 font-bold">خطأ: {error.message}</h2>
      <button onClick={retry} className="mt-4 px-4 py-2 bg-red-600 text-white rounded">
        إعادة محاولة
      </button>
    </div>
  )}
  onError={(error, errorInfo) => {
    // Log to error tracking service
    console.error('Component error:', error, errorInfo)
  }}
  showDetails={true}  // Show stack trace in dev
>
  <MyComponent />
</ErrorBoundary>
```

### HOC Usage

```typescript
import { withErrorBoundary } from '@/components'

const SafeOperateurList = withErrorBoundary(
  OperateurList,
  (error, retry) => (
    <div className="p-4 text-center">
      <p>Failed to load list: {error.message}</p>
      <button onClick={retry}>Retry</button>
    </div>
  )
)

// Now use it
<SafeOperateurList />
```

### useErrorHandler Hook

```typescript
import { useErrorHandler } from '@/components'

function MyComponent() {
  const { error, clearError, throwError } = useErrorHandler()

  const handleAsyncAction = async () => {
    try {
      await riskyOperation()
    } catch (err) {
      throwError(new Error(`Failed: ${err.message}`))
    }
  }

  return <button onClick={handleAsyncAction}>Do Something</button>
}

// Wrap with ErrorBoundary to catch thrown errors
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

---

## Skeleton Components

### SkeletonTable

```typescript
import { SkeletonTable } from '@/components'

{loading ? (
  <SkeletonTable 
    rows={8}           // Show 8 skeleton rows
    columns={5}        // For 5 columns
    hasActions={true}  // Include actions column
    striped={true}     // Alternating row colors
  />
) : (
  <ListTable {...props} />
)}
```

### SkeletonForm

```typescript
import { SkeletonForm } from '@/components'

{loadingForm ? (
  <SkeletonForm 
    fields={6}   // Number of form fields
    cols={2}     // Grid columns
  />
) : (
  <FormBuilder {...props} />
)}
```

### SkeletonCard

```typescript
import { SkeletonCard } from '@/components'

{loading ? (
  <SkeletonCard lines={3} />  // 3 lines of text
) : (
  <Card>
    <CardContent>{content}</CardContent>
  </Card>
)}
```

### SkeletonGrid

```typescript
import { SkeletonGrid } from '@/components'

{loading ? (
  <SkeletonGrid 
    items={6}   // 6 items
    cols={3}    // 3 columns
  />
) : (
  <div className="grid grid-cols-3 gap-4">
    {items.map(item => <Card key={item.id}>{item}</Card>)}
  </div>
)}
```

---

## Integration Patterns

### Pattern 1: Complete List Page

```typescript
// pages/operateur/Operateur.tsx
import { useListPage } from '@/hooks'
import { ListTable, useTableColumns, useTableActions, SkeletonTable } from '@/components'

export function OperateurList() {
  const {
    data, loading, total, page, searchQuery,
    setPage, setSearchQuery, handleDelete, handleExport
  } = useListPage({
    fetchThunk: fetchOperateurs,
    deleteThunk: deleteOperateur,
    exportThunk: exportOperateurs,
    stateSelector: (state) => ({
      data: state.operateur.operateurs,
      total: state.operateur.total,
      loading: state.operateur.loading,
      limit: 10
    })
  })

  const columns = useTableColumns<Operateur>()
  const tableColumns = [
    columns.text('name', 'الاسم', true),
    columns.date('createdAt', 'التاريخ', true),
    columns.badge('status', 'الحالة')
  ]

  const actions = useTableActions(
    (item) => navigate(`/edit/${item.id}`),
    (item) => navigate(`/view/${item.id}`),
    handleDelete
  )

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      
      {loading ? (
        <SkeletonTable />
      ) : (
        <ListTable
          columns={tableColumns}
          data={data}
          actions={actions}
          pagination={{
            page,
            total,
            limit: 10,
            onPageChange: setPage
          }}
        />
      )}
    </div>
  )
}
```

### Pattern 2: Complete Form Page

```typescript
// pages/operateur/CreateOperateur.tsx
import { useFormHandler } from '@/hooks'
import { FormBuilder, FormFieldsBuilder, ErrorBoundary } from '@/components'

export function CreateOperateur() {
  const { formData, handleChange, handleSubmit, hasChanges, errors } = 
    useFormHandler({
      initialData: {},
      onSubmit: async (data) => {
        const result = await dispatch(createOperateur(data))
        return result
      },
      onSuccess: () => navigate('/list')
    })

  const fields = new FormFieldsBuilder<CreateOperateurDTO>()
    .text('name', 'الاسم', 2)
    .email('email', 'البريد', 2)
    .textarea('address', 'العنوان', 4)
    .build()

  return (
    <ErrorBoundary>
      <FormBuilder
        fields={fields}
        data={formData}
        onChange={handleChange}
        onSubmit={handleSubmit}
        errors={errors}
        resetButton={true}
        submitLabel="Create"
      />
      {hasChanges && <p>Unsaved changes</p>}
    </ErrorBoundary>
  )
}
```

---

## Migration Checklist

When migrating a page to use new components:

- [ ] Import component(s) from `@/components`
- [ ] Define form fields or table columns
- [ ] Replace inline JSX with component
- [ ] Update state management (use hooks if applicable)
- [ ] Update error handling (use ErrorBoundary)
- [ ] Add loading skeletons
- [ ] Test on desktop and mobile
- [ ] Test error scenarios
- [ ] Run `npm run build` to verify compilation
- [ ] Commit changes

---

## Common Patterns

### Conditional Rendering
```typescript
// Before
{isLoading ? (
  <div className="p-4">
    {Array.from({length: 8}).map((_, i) => (
      <Skeleton key={i} className="h-12 mb-2" />
    ))}
  </div>
) : data.length > 0 ? (
  <table>...</table>
) : (
  <p>No data</p>
)}

// After
{isLoading ? (
  <SkeletonTable />
) : (
  <ListTable
    columns={columns}
    data={data}
    isEmpty={data.length === 0}
  />
)}
```

### Error Handling
```typescript
// Before
try {
  await dispatch(action())
} catch (err) {
  setError(err.message)
}

// After
<ErrorBoundary onError={(err) => console.error(err)}>
  <Component />
</ErrorBoundary>
```

---

## Tips & Best Practices

1. **Always use generics**: `<FormBuilder<MyType>>` for better type safety
2. **Validate early**: Use `validation` field in FormBuilder
3. **Reuse hooks**: `useTableActions`, `useTableColumns` are composable
4. **Error boundaries**: Wrap components that can throw at the page level
5. **Loading states**: Always show SkeletonTable/Form while loading
6. **Responsive**: Use `cols` parameter in FormBuilder for responsive layouts
7. **Accessibility**: Components follow a11y best practices
8. **RTL**: All components support RTL (Arabic) out of the box

---

**Created**: Phase 2 Completion  
**Status**: Ready for Production  
**Questions?** Refer to component JSDoc comments or PHASE_2_COMPONENTS_REPORT.md
