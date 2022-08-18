import { ApolloClient, gql } from "@apollo/client"

export const CREATE_POST = gql`
  mutation createPost(
    $address: String
    $categoryId: String!
    $description: String!
    $email: String
    $imagesUrls: [String!]
    $latitude: Float!
    $longitude: Float!
    $mainImageUrl: String
    $name: String!
    $openHours: String
    $phoneNumber: String
    $price: Float!
    $userId: String!
  ) {
    createMarketplacePost(
      createMarketplacePostInput: {
        address: $address
        categoryId: $categoryId
        description: $description
        email: $email
        imagesUrls: $imagesUrls
        latitude: $latitude
        longitude: $longitude
        mainImageUrl: $mainImageUrl
        name: $name
        openHours: $openHours
        phoneNumber: $phoneNumber
        price: $price
        userId: $userId
      }
    ) {
      status
    }
  }
`
