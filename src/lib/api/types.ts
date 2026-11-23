export type {
  ApiClientConfig,
  ApiRequestOptions,
  DataAdapterMode,
  HttpMethod,
  PaginationInput,
} from "./core"

export interface TrustedProfile {
  id: string
  full_name: string
  email: string | null
  role: "admin" | "student"
  is_active: boolean
  student_id?: string | null
}

export interface PageMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface Paginated<T> {
  data: T[]
  pagination: PageMeta
}

export interface ResultSummary {
  earned_marks: number | null
  max_marks: number | null
  percentage: number | null
  passed: boolean | null
  grade: string | null
  awaiting_manual_grading?: boolean
}
