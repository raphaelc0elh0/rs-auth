import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next"
import { parseCookies } from "nookies"

export const withSSRGuest = <P>(fn: GetServerSideProps<P>) => {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx)

    if (cookies["rs-auth-token"]) {
      return {
        redirect: {
          destination: "/dashboard",
          permanent: false
        }
      }
    }

    return await fn(ctx)
  }
}
