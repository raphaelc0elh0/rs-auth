import { createContext, useContext } from "react"

type SignInCredentials = {
  email: string
  password: string
}

type AuthContextData = {
  signIn: (credentials: SignInCredentials) => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext({} as AuthContextData)

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const isAuthenticated = false

  const signIn = async ({ email, password }: SignInCredentials) => {
    console.log(email, password)
  }

  return <AuthContext.Provider value={{ signIn, isAuthenticated }}>{children}</AuthContext.Provider>
}

export const useAuthContext = useContext(AuthContext)
