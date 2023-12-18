import { gql } from "@apollo/client"
import { useLoginMethodsQuery } from "@app/graphql/generated"
import { useLevel } from "@app/graphql/level-context"

gql`
  query LoginMethods {
    me {
      phone
      email {
        address
        verified
      }
    }
  }
`

export const useLoginMethods = () => {
  const { isAtLeastLevelZero } = useLevel()
  const { data, loading } = useLoginMethodsQuery({
    skip: !isAtLeastLevelZero,
  })

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
