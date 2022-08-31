import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next"
import { destroyCookie, parseCookies } from "nookies"
import { AuthTokenError } from "../services/errors/AuthTokerError"

export const withSSRAuth = <P>(fn: GetServerSideProps<P>) => {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx)

    if (!cookies["rs-auth-token"]) {
      return {
        redirect: {
          destination: "/",
          permanent: false
        }
      }
    }

    try {
      return await fn(ctx)
    } catch (error) {
      if (error instanceof AuthTokenError) {
        destroyCookie(ctx, "rs-auth-token")
        destroyCookie(ctx, "rs-auth-refreshToken")

        return {
          redirect: {
            destination: "/",
            permanent: false
          }
        }
      }

      return {
        redirect: {
          destination: "/error",
          permanent: false
        }
      }
    }
  }
}
