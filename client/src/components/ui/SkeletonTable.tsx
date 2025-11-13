/**
 * SkeletonTable Component - Loading skeleton for tables
 * Used by: All list pages during data fetching
 * Eliminates 100+ LOC of repeated skeleton UI logic
 */

import React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface SkeletonTableProps {
  columns?: number
  rows?: number
  hasActions?: boolean
  striped?: boolean
}

/**
 * SkeletonTable Component - Animated loading skeleton
 */
export const SkeletonTable = React.forwardRef<HTMLDivElement, SkeletonTableProps>(
  ({ columns = 5, rows = 8, hasActions = true, striped = true }, ref) => {
    const totalColumns = hasActions ? columns + 1 : columns

    return (
      <div
        ref={ref}
        className="border rounded-lg overflow-hidden animate-pulse"
      >
        <div className="overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-gray-100">
                {Array.from({ length: totalColumns }).map((_, idx) => (
                  <TableHead key={idx} className="text-right">
                    <div className="h-4 bg-gray-300 rounded w-24" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {Array.from({ length: rows }).map((_, rowIdx) => (
                <TableRow
                  key={rowIdx}
                  className={striped && rowIdx % 2 === 1 ? "bg-gray-50" : ""}
                >
                  {Array.from({ length: totalColumns }).map((_, colIdx) => (
                    <TableCell key={colIdx} className="py-3">
                      <div className="h-4 bg-gray-200 rounded w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination skeleton */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="flex gap-2">
            <div className="h-8 bg-gray-200 rounded w-20" />
            <div className="h-8 bg-gray-200 rounded w-16" />
            <div className="h-8 bg-gray-200 rounded w-20" />
          </div>
        </div>
      </div>
    )
  }
)

SkeletonTable.displayName = "SkeletonTable"

/**
 * Skeleton form component - Loading skeleton for forms
 */
export const SkeletonForm = React.forwardRef<
  HTMLDivElement,
  { fields?: number; cols?: number }
>(({ fields = 4, cols = 2 }, ref) => {
  const rows = Math.ceil(fields / cols)

  return (
    <div ref={ref} className="space-y-6 animate-pulse">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className={`grid gap-4 grid-cols-${cols}`}
        >
          {Array.from({
            length: Math.min(cols, fields - rowIdx * cols),
          }).map((_, colIdx) => (
            <div key={colIdx} className="flex flex-col gap-2">
              <div className="h-4 bg-gray-300 rounded w-20" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ))}

      {/* Buttons */}
      <div className="flex gap-3 justify-end mt-8">
        <div className="h-10 bg-gray-200 rounded w-24" />
        <div className="h-10 bg-gray-200 rounded w-24" />
      </div>
    </div>
  )
})

SkeletonForm.displayName = "SkeletonForm"

/**
 * Skeleton card component - Loading skeleton for cards
 */
export const SkeletonCard = React.forwardRef<
  HTMLDivElement,
  { lines?: number }
>(({ lines = 3 }, ref) => {
  return (
    <div ref={ref} className="p-6 border rounded-lg space-y-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>

      {/* Content lines */}
      <div className="space-y-3 mt-4">
        {Array.from({ length: lines }).map((_, idx) => (
          <div
            key={idx}
            className="h-3 bg-gray-200 rounded w-full"
            style={{
              width: idx === lines - 1 ? "80%" : "100%",
            }}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-6">
        <div className="h-9 bg-gray-200 rounded flex-1" />
        <div className="h-9 bg-gray-200 rounded w-24" />
      </div>
    </div>
  )
})

SkeletonCard.displayName = "SkeletonCard"

/**
 * Skeleton avatar list component - Loading skeleton for user/item lists
 */
export const SkeletonAvatarList = React.forwardRef<
  HTMLDivElement,
  { items?: number }
>(({ items = 5 }, ref) => {
  return (
    <div ref={ref} className="space-y-3 animate-pulse">
      {Array.from({ length: items }).map((_, idx) => (
        <div key={idx} className="flex items-center gap-4 p-3 border rounded-lg">
          {/* Avatar */}
          <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />

          {/* Content */}
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>

          {/* Action button */}
          <div className="w-16 h-8 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  )
})

SkeletonAvatarList.displayName = "SkeletonAvatarList"

/**
 * Skeleton grid component - Loading skeleton for grid layouts
 */
export const SkeletonGrid = React.forwardRef<
  HTMLDivElement,
  { items?: number; cols?: number }
>(({ items = 6, cols = 3 }, ref) => {
  return (
    <div
      ref={ref}
      className={`grid gap-4 grid-cols-${cols} animate-pulse`}
    >
      {Array.from({ length: items }).map((_, idx) => (
        <div key={idx} className="p-4 border rounded-lg space-y-3">
          {/* Image placeholder */}
          <div className="w-full h-32 bg-gray-200 rounded" />

          {/* Title */}
          <div className="h-4 bg-gray-200 rounded w-3/4" />

          {/* Description lines */}
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-5/6" />
          </div>

          {/* Action button */}
          <div className="h-8 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  )
})

SkeletonGrid.displayName = "SkeletonGrid"
