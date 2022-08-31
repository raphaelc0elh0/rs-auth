import { useAuthContext } from "../context/AuthContext"
import { validateUserPermissions } from "../utils/validateUserPermissions"

type UseCanParams = {
  permissions?: string[]
  roles?: string[]
}

export const useCan = ({ permissions = [], roles = [] }: UseCanParams) => {
  const { user, isAuthenticated } = useAuthContext()

  if (!isAuthenticated || !user) {
    return false
  }

  const userHasValidPermissions = validateUserPermissions({
    user,
    permissions,
    roles
  })

  return userHasValidPermissions
}
