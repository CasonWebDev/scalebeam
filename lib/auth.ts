import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import type { User as PrismaUser } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: "ADMIN" | "CLIENT"
      organizationIds: string[]
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: "ADMIN" | "CLIENT"
    organizationIds: string[]
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
          include: {
            organizations: {
              select: {
                id: true,
              },
            },
          },
        })

        if (!user) {
          return null
        }

        // Por enquanto, aceita qualquer senha (desenvolvimento)
        // Em produção, descomentar a linha abaixo:
        // const passwordMatch = await bcrypt.compare(credentials.password as string, user.passwordHash)
        // if (!passwordMatch) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          organizationIds: user.organizations.map((org) => org.id),
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = user.role
        token.organizationIds = user.organizationIds
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.role = token.role as "ADMIN" | "CLIENT"
        session.user.organizationIds = token.organizationIds as string[]
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
})
