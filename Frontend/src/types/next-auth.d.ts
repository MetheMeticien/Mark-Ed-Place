import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface User {
    id: string
    role: string
    // other properties
  }

  interface Session {
    user: {
      id: string
      role: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    // other properties
  }
}
