import { useSettingsContext } from "../settings-context"

export const useLoginMethods = () => {
  const { data, loading } = useSettingsContext()

  const email = data?.me?.email?.address || undefined
  const emailVerified = Boolean(email && data?.me?.email?.verified)

  const phone = data?.me?.phone
  const phoneVerified = Boolean(phone)

  const bothEmailAndPhoneVerified = phoneVerified && emailVerified

  return {
    loading,
    email,
    emailVerified,
    phone,
    phoneVerified,
    bothEmailAndPhoneVerified,
  }
}
