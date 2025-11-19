import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

/**
 * Verifica se o usuário está autenticado
 */
export async function requireAuth() {
  const session = await auth()

  if (!session?.user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      session: null,
    }
  }

  return { error: null, session }
}

/**
 * Verifica se o usuário é ADMIN
 */
export async function requireAdmin() {
  const { error, session } = await requireAuth()

  if (error) return { error, session: null }

  if (session!.user.role !== "ADMIN") {
    return {
      error: NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      ),
      session: null,
    }
  }

  return { error: null, session }
}

/**
 * Verifica se o usuário é CLIENT
 */
export async function requireClient() {
  const { error, session } = await requireAuth()

  if (error) return { error, session: null }

  if (session!.user.role !== "CLIENT") {
    return {
      error: NextResponse.json(
        { error: "Forbidden - Client access required" },
        { status: 403 }
      ),
      session: null,
    }
  }

  return { error: null, session }
}
