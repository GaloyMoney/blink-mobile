import { useDarkModeQuery } from "@app/graphql/generated"

export const useDarkMode = () => {
  const { data } = useDarkModeQuery()
  // return true
  return data?.darkMode ?? false
}
