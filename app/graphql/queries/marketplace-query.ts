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
      createdAt
      description
      imagesUrls
      location {
        coordinates
      }
      mainImageUrl
      name
      openHours
      rating
      status
      updatedAt
      userId
      tags {
        _id
        name
      }
      hidePhoneNumber
    }
  }
`

export const AUTO_COMPLETE_TAGS = gql`
query marketplaceAutoCompleteTag($name: String!) {
  marketplaceAutoCompleteTag(
    autoCompleteTagInput: { name: $name }
  ) {
    _id
    name
    createdAt
    updatedAt
  }
}
`
export const GET_TAGS = gql`
query{
  getMarketplaceTags(getMarketPlaceTagsInput:{}){   
      _id,
      name,
      createdAt,
      updatedAt
  }
}
`

export const AUTO_COMPLETE_LOCATION = gql`
query googleMapAutoComplete($name: String!) {
  googleMapAutoComplete(
    name: $name 
  ) {
    id
    name 
  }
}
`