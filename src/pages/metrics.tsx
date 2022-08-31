import { Can } from "../components/Can"
import { useAuthContext } from "../context/AuthContext"
import { setupAPIClient } from "../services/api"
import { withSSRAuth } from "../utils/withSSRAuth"
import decode from "jwt-decode"

const Metrics = () => {
  const { user } = useAuthContext()

  return (
    <>
      <h1>Metrics: {user?.email}</h1>
      <Can roles={["administrator", "editor"]}>metrics</Can>
    </>
  )
}

export const getServerSideProps = withSSRAuth(
  async (ctx) => {
    const apiClient = setupAPIClient(ctx)
    const response = await apiClient.get("/me")

    return {
      props: {}
    }
  },
  {
    permissions: ["metrics.create"],
    roles: ["administrator"]
  }
)

export default Metrics
