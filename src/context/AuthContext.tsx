import Router from "next/router"
import { createContext, useContext, useState } from "react"
import { api } from "../services/api"
import { setCookie } from "nookies"

type User = {
  email: string
  permissions: string[]
  roles: string[]
}

type SignInCredentials = {
  email: string
  password: string
}

type AuthContextData = {
  signIn: (credentials: SignInCredentials) => Promise<void>
  isAuthenticated: boolean
  user?: User
}

const AuthContext = createContext({} as AuthContextData)

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User>()
  const isAuthenticated = !!user

  const signIn = async ({ email, password }: SignInCredentials) => {
    try {
      const response = await api.post("/sessions", { email, password })
      const { token, refreshToken, permissions, roles } = response.data

      setCookie(undefined, "rs-auth-token", token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/"
      })
      setCookie(undefined, "rs-auth-refreshToken", refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/"
      })

      setUser({ email, permissions, roles })
      Router.push("/dashboard")
    } catch (error) {
      console.log(error)
    }
  }

  return <AuthContext.Provider value={{ signIn, isAuthenticated, user }}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => useContext(AuthContext)
