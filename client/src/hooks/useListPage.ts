/**
 * useListPage Hook - Eliminates duplicate pagination/search/export logic
 * Used by: Operateur.tsx, Vehecule.tsx, Chauffeur.tsx
 * Reduces ~250 LOC per page
 */

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "@/redux/store"
import { getPaginationInfo, PaginationInfo } from "@/lib/paginationUtils"

interface UseListPageOptions {
  fetchThunk: (params: any) => any
  deleteThunk?: (id: string) => any
  exportThunk?: (params: any) => any
  stateSelector: (state: RootState) => {
    data: any[]
    total: number
    loading?: boolean
    limit?: number
  }
  limit?: number
}

interface UseListPageReturn {
  // Pagination state
  page: number
  setPage: (page: number) => void
  searchQuery: string
  setSearchQuery: (query: string) => void

  // Loading states
  loading: boolean
  isExporting: boolean

  // Data
  data: any[]
  total: number
  limit: number

  // Pagination info
  pagination: PaginationInfo

  // Handlers
  handleDelete: (id: string) => Promise<void>
  handleExport: () => Promise<void>
  handleRefresh: () => void
  handlePrev: () => void
  handleNext: () => void
}

/**
 * Custom hook for list page logic
 * Centralizes pagination, search, export, delete functionality
 */
export const useListPage = ({
  fetchThunk,
  deleteThunk,
  exportThunk,
  stateSelector,
  limit = 10,
}: UseListPageOptions): UseListPageReturn => {
  const dispatch = useDispatch<AppDispatch>()
  const { data, total, loading = false } = useSelector(stateSelector)

  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [isExporting, setIsExporting] = useState(false)

  // Fetch data when page or search changes
  useEffect(() => {
    dispatch(
      fetchThunk({
        search: searchQuery,
        page,
        limit,
      })
    )
  }, [dispatch, searchQuery, page, limit])

  // Handle delete and refresh
  const handleDelete = async (id: string) => {
    if (deleteThunk) {
      try {
        await dispatch(deleteThunk(id))
        // Refresh data after deletion
        dispatch(
          fetchThunk({
            search: searchQuery,
            page,
            limit,
          })
        )
      } catch (error) {
        console.error("Error deleting item:", error)
        throw error
      }
    }
  }

  // Handle export
  const handleExport = async () => {
    if (exportThunk) {
      setIsExporting(true)
      try {
        await dispatch(exportThunk({ search: searchQuery }))
      } catch (error) {
        console.error("Error exporting data:", error)
        throw error
      } finally {
        setIsExporting(false)
      }
    }
  }

  // Refresh current page
  const handleRefresh = () => {
    dispatch(
      fetchThunk({
        search: searchQuery,
        page,
        limit,
      })
    )
  }

  // Pagination handlers
  const handlePrev = () => {
    if (page > 1) setPage(page - 1)
  }

  const handleNext = () => {
    const totalPages = Math.ceil(total / limit)
    if (page < totalPages) setPage(page + 1)
  }

  // Calculate pagination info
  const pagination = getPaginationInfo(page, limit, total)

  return {
    page,
    setPage,
    searchQuery,
    setSearchQuery,
    loading,
    isExporting,
    data,
    total,
    limit,
    pagination,
    handleDelete,
    handleExport,
    handleRefresh,
    handlePrev,
    handleNext,
  }
}
