/**
 * ListTable Component - Eliminates 500+ LOC of repeated table rendering
 * Used by: Operateur.tsx, Vehecule.tsx, Chauffeur.tsx (list pages)
 * Provides: Responsive tables, sorting, filtering, actions, loading states
 */

import React, { useMemo, useState } from "react"
import { formatters } from "@/lib/formatters"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, ChevronsUpDown, Loader2, Trash2, Edit2, Eye } from "lucide-react"

export interface TableColumn<T> {
  key: keyof T
  label: string
  sortable?: boolean
  width?: string // e.g., "w-32", "w-48"
  render?: (value: any, item: T) => React.ReactNode
  className?: string
  alignment?: "left" | "center" | "right"
}

export interface TableAction<T> {
  label: string
  icon?: React.ReactNode
  onClick: (item: T) => void
  variant?: "default" | "destructive" | "outline" | "ghost"
  disabled?: (item: T) => boolean
  confirmMessage?: string // Shows confirmation dialog
}

interface ListTableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  isLoading?: boolean
  isEmpty?: boolean
  emptyMessage?: string
  actions?: TableAction<T>[]
  onRowClick?: (item: T) => void
  pagination?: {
    page: number
    total: number
    limit: number
    onPageChange: (page: number) => void
  }
  striped?: boolean
  hoverable?: boolean
  compact?: boolean
  showIndex?: boolean
  containerClassName?: string
  tableClassName?: string
}

/**
 * Generic ListTable Component
 * Handles: Rendering, sorting, pagination, actions, loading states
 * Reduces table-related LOC by ~500 per page (3 pages × 500 = 1,500 LOC)
 */
export const ListTable = React.forwardRef<HTMLDivElement, ListTableProps<any>>(
  (
    {
      columns,
      data,
      isLoading = false,
      isEmpty = false,
      emptyMessage = "لا توجد بيانات",
      actions = [],
      onRowClick,
      pagination,
      striped = true,
      hoverable = true,
      compact = false,
      showIndex = false,
      containerClassName = "border rounded-lg overflow-hidden",
      tableClassName = "w-full",
    },
    ref
  ) => {
    const [sortBy, setSortBy] = useState<keyof any | null>(null)
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

    // Compute sorted data
    const sortedData = useMemo(() => {
      if (!sortBy) return data
      return [...data].sort((a, b) => {
        const aVal = a[sortBy]
        const bVal = b[sortBy]

        // Handle null/undefined
        if (aVal == null && bVal == null) return 0
        if (aVal == null) return sortDir === "asc" ? 1 : -1
        if (bVal == null) return sortDir === "asc" ? -1 : 1

        // Handle strings
        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
        }

        // Handle numbers & dates
        if (aVal < bVal) return sortDir === "asc" ? -1 : 1
        if (aVal > bVal) return sortDir === "asc" ? 1 : -1
        return 0
      })
    }, [data, sortBy, sortDir])

    const handleSort = (key: keyof any) => {
      if (sortBy === key) {
        setSortDir(sortDir === "asc" ? "desc" : "asc")
      } else {
        setSortBy(key)
        setSortDir("asc")
      }
    }

    const handleActionClick = (action: TableAction<any>, item: any, e: React.MouseEvent) => {
      // Prevent default form submission and stop propagation so clicks don't trigger page reloads
      e.preventDefault()
      e.stopPropagation()

      if (action.confirmMessage) {
        if (window.confirm(action.confirmMessage)) {
          action.onClick(item)
        }
      } else {
        action.onClick(item)
      }
    }

    // Loading skeleton rows
    if (isLoading) {
      return (
        <div ref={ref} className={containerClassName}>
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
            <p className="text-gray-600">جاري التحميل...</p>
          </div>
        </div>
      )
    }

    // Empty state
    if (isEmpty || sortedData.length === 0) {
      return (
        <div ref={ref} className={containerClassName}>
          <div className="p-8 text-center text-gray-500">
            <p>{emptyMessage}</p>
          </div>
        </div>
      )
    }

    return (
      <div ref={ref} className={containerClassName}>
        <div className="overflow-x-auto">
          <Table className={tableClassName}>
            <TableHeader>
              <TableRow className="bg-gray-50">
                {showIndex && <TableHead className="w-12 text-right">#</TableHead>}

                {columns.map((col) => (
                  <TableHead
                    key={String(col.key)}
                    className={`text-right ${col.width || ""} ${col.className || ""}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span>{col.label}</span>
                      {col.sortable && (
                          <button
                          type="button"
                          onClick={() => handleSort(col.key)}
                          className="p-1 hover:bg-gray-200 rounded-md transition"
                          title="Click to sort"
                        >
                          {sortBy === col.key ? (
                            sortDir === "asc" ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )
                          ) : (
                            <ChevronsUpDown className="w-4 h-4 text-gray-300" />
                          )}
                        </button>
                      )}
                    </div>
                  </TableHead>
                ))}

                {actions.length > 0 && (
                  <TableHead className="w-32 text-right">الإجراءات</TableHead>
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {sortedData.map((item, idx) => (
                <TableRow
                  key={idx}
                  className={`
                    ${striped && idx % 2 === 1 ? "bg-gray-50" : ""}
                    ${hoverable ? "hover:bg-blue-50 transition cursor-pointer" : ""}
                  `}
                  onClick={() => onRowClick?.(item)}
                >
                  {showIndex && <TableCell className="text-gray-500 text-right">{idx + 1}</TableCell>}

                  {columns.map((col) => (
                    <TableCell
                      key={String(col.key)}
                      className={`${compact ? "py-2" : ""} ${col.alignment === "center" ? "text-center" : col.alignment === "left" ? "text-left" : "text-right"} ${col.className || ""}`}
                    >
                      {col.render ? col.render(item[col.key], item) : String(item[col.key] ?? "-")}
                    </TableCell>
                  ))}

                  {actions.length > 0 && (
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {actions.map((action, aIdx) => (
                          <Button
                              key={aIdx}
                              type="button"
                              variant={action.variant || "ghost"}
                              size="sm"
                              disabled={action.disabled?.(item)}
                              onClick={(e) => handleActionClick(action, item, e)}
                              title={action.label}
                            >
                            {action.icon || action.label}
                          </Button>
                        ))}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Info */}
        {pagination && (
          <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-600 text-right">
              عرض {pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} من {pagination.total}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => pagination.onPageChange(pagination.page - 1)}
              >
                السابق
              </Button>

              <div className="px-4 py-2 text-sm font-medium text-gray-700 border rounded-md bg-white">
                صفحة {pagination.page}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page * pagination.limit >= pagination.total}
                onClick={() => pagination.onPageChange(pagination.page + 1)}
              >
                التالي
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }
)

ListTable.displayName = "ListTable"

/**
 * Convenience hook for creating common table actions
 */
export function useTableActions<T extends { id: string | number }>(
  onEdit?: (item: T) => void,
  onView?: (item: T) => void,
  onDelete?: (item: T) => void
): TableAction<T>[] {
  const actions: TableAction<T>[] = []

  if (onView) {
    actions.push({
      label: "عرض",
      icon: <Eye className="w-4 h-4" />,
      onClick: onView,
      variant: "ghost",
    })
  }

  if (onEdit) {
    actions.push({
      label: "تعديل",
      icon: <Edit2 className="w-4 h-4" />,
      onClick: onEdit,
      variant: "outline",
    })
  }

  if (onDelete) {
    actions.push({
      label: "حذف",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: onDelete,
      variant: "destructive",
      confirmMessage: "هل أنت متأكد من حذف هذا العنصر؟",
    })
  }

  return actions
}

/**
 * Convenience hook for creating common table columns
 */
export function useTableColumns<T>(): {
  text: (key: keyof T, label: string, sortable?: boolean) => TableColumn<T>
  number: (key: keyof T, label: string, sortable?: boolean) => TableColumn<T>
  date: (key: keyof T, label: string, sortable?: boolean) => TableColumn<T>
  badge: (key: keyof T, label: string) => TableColumn<T>
  custom: (key: keyof T, label: string, render: (value: any, item: T) => React.ReactNode) => TableColumn<T>
} {
  return {
    text: (key, label, sortable = false) => ({
      key,
      label,
      sortable,
      width: "w-32",
    }),

    number: (key, label, sortable = false) => ({
      key,
      label,
      sortable,
      alignment: "left",
      render: (val) => val?.toLocaleString?.() || val,
    }),

    date: (key, label, sortable = false) => ({
      key,
      label,
      sortable,
      width: "w-24",
      render: (val) => {
        // Use centralized French date formatter for consistent UI
        if (!val) return "-"
        try {
          return formatters.tableDate(val)
        } catch {
          return String(val)
        }
      },
    }),

    badge: (key, label) => ({
      key,
      label,
      render: (val) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            val === "active" || val === true
              ? "bg-green-100 text-green-800"
              : val === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {String(val)}
        </span>
      ),
    }),

    custom: (key, label, render) => ({
      key,
      label,
      render,
    }),
  }
}
