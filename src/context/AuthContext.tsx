import Router from "next/router"
import { createContext, useContext, useEffect, useState } from "react"
import { api } from "../services/apiClient"
import { setCookie, parseCookies, destroyCookie } from "nookies"

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
  signOut: () => void
  isAuthenticated: boolean
  user?: User
}

interface AuthProviderProps {
  children: React.ReactNode
}

const AuthContext = createContext({} as AuthContextData)

let authChannel: BroadcastChannel

export const signOut = (broadcast: boolean = true) => {
  destroyCookie(undefined, "rs-auth-token")
  destroyCookie(undefined, "rs-auth-refreshToken")

  if (broadcast) authChannel.postMessage("signOut")

  Router.push("/")
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User>()
  const isAuthenticated = !!user

  useEffect(() => {
    authChannel = new BroadcastChannel("auth")

    authChannel.onmessage = (message) => {
      switch (message.data) {
        case "signOut":
          signOut(false)
          break
        default:
          break
      }
    }
  }, [])

  useEffect(() => {
    const { "rs-auth-token": token } = parseCookies()

    if (token) {
      api
        .get("/me")
        .then((response) => {
          const { email, permissions, roles } = response.data

          setUser({ email, permissions, roles })
        })
        .catch(() => {
          signOut()
        })
    }
  }, [])

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

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`

      Router.push("/dashboard")
    } catch (error) {
      console.log(error)
    }
  }

  return <AuthContext.Provider value={{ signIn, signOut, isAuthenticated, user }}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => useContext(AuthContext)
