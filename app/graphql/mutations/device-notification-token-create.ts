import { gql } from "@apollo/client"

const deviceNotificationTokenCreate = gql`
  mutation deviceNotificationTokenCreate($input: DeviceNotificationTokenCreateInput!) {
    deviceNotificationTokenCreate(input: $input) {
      errors {
        __typename
        message
      }
      success
    }
  }
`

export default deviceNotificationTokenCreate
