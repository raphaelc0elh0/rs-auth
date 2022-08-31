import { useAuthContext } from "../context/AuthContext"
import { setupAPIClient } from "../services/api"
import { withSSRAuth } from "../utils/withSSRAuth"

const Dashboard = () => {
  const { user } = useAuthContext()

  return <div>Dashboard: {user?.email}</div>
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx)
  const response = await apiClient.get("/me")

  return {
    props: {}
  }
})

export default Dashboard
