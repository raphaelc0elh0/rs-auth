import axios, { AxiosError } from "axios"
import { GetServerSidePropsContext } from "next"
import { parseCookies, setCookie } from "nookies"
import { signOut } from "../context/AuthContext"
import { AuthTokenError } from "./errors/AuthTokerError"

type ErrorType = { message?: string; code?: string }
type FailedRequestQueue = {
  onSuccess: (token: string) => void
  onFailure: (error: AxiosError) => void
}

let isRefreshing = false
let failedRequestsQueue = <FailedRequestQueue[]>[]

export const setupAPIClient = (ctx?: GetServerSidePropsContext) => {
  let cookies = parseCookies(ctx)

  const api = axios.create({
    baseURL: "http://localhost:3333",
    headers: {
      Authorization: `Bearer ${cookies["rs-auth-token"]}`
    }
  })

  api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ErrorType>) => {
      if (error.response?.status === 401) {
        if (error.response?.data?.code === "token.expired") {
          cookies = parseCookies(ctx)
          const refreshToken = cookies["rs-auth-refreshToken"]
          const originalConfig = error.config

          if (!isRefreshing) {
            isRefreshing = true
            api
              .post("/refresh", {
                refreshToken
              })
              .then((response) => {
                setCookie(ctx, "rs-auth-token", response.data.token, {
                  maxAge: 60 * 60 * 24 * 30, // 30 days
                  path: "/"
                })
                setCookie(ctx, "rs-auth-refreshToken", response.data.refreshToken, {
                  maxAge: 60 * 60 * 24 * 30, // 30 days
                  path: "/"
                })

                api.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`

                failedRequestsQueue.forEach((request) => request.onSuccess(response.data.token))
                failedRequestsQueue = []
              })
              .catch((error) => {
                failedRequestsQueue.forEach((request) => request.onFailure(error))
                failedRequestsQueue = []

                if (typeof window !== "undefined") {
                  signOut()
                } else {
                  return Promise.reject(new AuthTokenError())
                }
              })
              .finally(() => {
                isRefreshing = false
              })
          }

          return new Promise((resolve, reject) => {
            failedRequestsQueue.push({
              onSuccess: (token: string) => {
                if (!originalConfig?.headers) {
                  return reject()
                }
                originalConfig.headers["Authorization"] = `Bearer ${token}`
                resolve(api(originalConfig))
              },
              onFailure: (error: AxiosError) => {
                reject(error)
              }
            })
          })
        } else {
          if (typeof window !== "undefined") {
            signOut()
          } else {
            return Promise.reject(new AuthTokenError())
          }
        }
      }

      return Promise.reject(error)
    }
  )

  return api
}
