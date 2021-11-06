import { useApolloClient } from "@apollo/client"
import { resetDataStore } from "../utils/logout"
import useToken from "../utils/use-token"

const useLogout = () => {
  const client = useApolloClient()
  const { removeToken } = useToken()

  // TODO a login function could be created in this hook
  const logout = () => resetDataStore({ client, removeToken })

  return {
    logout,
  }
}

export default useLogout
