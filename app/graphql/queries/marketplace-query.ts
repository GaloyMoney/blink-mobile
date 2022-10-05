import { ApolloClient, gql } from "@apollo/client"

export const GET_CATEGORY = gql`
  query {
    getMarketplaceCategories(getMarketPlaceCategoriesInput: {}) {
      _id
      name
    }
  }
`
export const GET_POSTS = gql`
  query {
    getMarketplacePosts(getMarketplacePostsInput: { limit: 100 }) {
      _id
      address
      categoryId
      createdAt
      description
      imagesUrls
      location {
        coordinates
      }
      mainImageUrl
      name
      openHours
      price
      rating
      status
      updatedAt
      userId
    }
  }
`

export const FIND_TAGS = gql`
query marketplaceAutoCompleteTag ($autoCompleteTagInput: AutoCompleteTagInput!) {
    marketplaceAutoCompleteTag (autoCompleteTagInput: $autoCompleteTagInput) {
        _id
        createdAt
        name
        updatedAt
    }
}
`
