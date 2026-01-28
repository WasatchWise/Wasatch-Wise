/**
 * Shared API types
 */

export interface ApiResponse<T> {
  data?: T
  error?: {
    message: string
    code?: string
  }
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page?: number
  pageSize?: number
}

