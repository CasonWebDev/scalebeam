/**
 * Project Status Configuration
 * Centralized status definitions for consistent UI across the app
 */
export const PROJECT_STATUS_CONFIG = {
  DRAFT: {
    label: "Rascunho",
    variant: "secondary" as const,
    color: "bg-slate-500",
  },
  IN_PRODUCTION: {
    label: "Em Produção",
    variant: "default" as const,
    color: "bg-blue-500",
  },
  READY: {
    label: "Pronto para Aprovar",
    variant: "default" as const,
    color: "bg-purple-500",
  },
  APPROVED: {
    label: "Aprovado",
    variant: "default" as const,
    color: "bg-green-500",
  },
  REVISION: {
    label: "Revisão Solicitada",
    variant: "default" as const,
    color: "bg-amber-500",
  },
} as const

/**
 * User Roles
 */
export const USER_ROLES = {
  ADMIN: "ADMIN",
  CLIENT: "CLIENT",
} as const

/**
 * File Size Formatter
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
