import { useAuthContext } from "../context/AuthContext"

const Dashboard = () => {
  const { user } = useAuthContext()

  return <div>Dashboard: {user?.email}</div>
}
export default Dashboard
