import { Can } from "../components/Can"
import { useAuthContext } from "../context/AuthContext"
import { useCan } from "../hooks/useCan"
import { setupAPIClient } from "../services/api"
import { withSSRAuth } from "../utils/withSSRAuth"

const Dashboard = () => {
  const { user } = useAuthContext()

  return (
    <>
      <h1>Dashboard: {user?.email}</h1>
    </>
  )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx)
  const response = await apiClient.get("/me")

  return {
    props: {}
  }
})

export default Dashboard
