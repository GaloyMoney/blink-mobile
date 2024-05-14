import { useSettingsScreenQuery } from "@app/graphql/generated"

export const useLoginMethods = () => {
  const { data } = useSettingsScreenQuery({ fetchPolicy: "cache-and-network" })

  const email = data?.me?.email?.address || undefined
  const emailVerified = Boolean(email && data?.me?.email?.verified)

  const phone = data?.me?.phone
  const phoneVerified = Boolean(phone)

  const bothEmailAndPhoneVerified = phoneVerified && emailVerified

  return {
    loading: !data, // Data would auto refresh after network call
    email,
    emailVerified,
    phone,
    phoneVerified,
    bothEmailAndPhoneVerified,
  }
}
