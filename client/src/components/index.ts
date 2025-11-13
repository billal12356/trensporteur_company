/**
 * Phase 2 Components Index
 * Central export point for all reusable components
 * 
 * Components created to eliminate 1,100+ LOC of duplication:
 * - FormBuilder: Renders dynamic forms (eliminates ~600 LOC from 4+ form pages)
 * - ListTable: Generic table component (eliminates ~500 LOC from 3 list pages)
 * - ErrorBoundary: Enhanced error handling (eliminates ~100 LOC of try-catch blocks)
 * - Skeleton components: Loading placeholders (eliminates ~100 LOC of skeleton UI)
 */

// Forms
export { FormBuilder, FormFieldsBuilder } from './forms/FormBuilder'
export type { FormFieldConfig } from './forms/FormBuilder'

// Tables
export { ListTable, useTableActions, useTableColumns } from './tables/ListTable'
export type { TableColumn, TableAction } from './tables/ListTable'

// Error Handling
export { ErrorBoundary, useErrorHandler, withErrorBoundary } from './common/ErrorBoundary'

// Skeletons
export {
  SkeletonTable,
  SkeletonForm,
  SkeletonCard,
  SkeletonAvatarList,
  SkeletonGrid,
} from './ui/SkeletonTable'
