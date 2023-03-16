import { useDarkModeQuery } from "@app/graphql/generated"

export const useDarkMode = () => {
  const { data } = useDarkModeQuery()
  return data?.darkMode ?? false
}
