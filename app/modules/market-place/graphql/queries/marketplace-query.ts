import { gql } from "@apollo/client"
import { MARKETPLACE_POST } from "../fragments"

export const GET_CATEGORY = gql`
  query {
    getMarketplaceCategories(getMarketPlaceCategoriesInput: {}) {
      _id
      name
    }
  }
`

export const FILTER_MARKET_PLACE_POST = gql`
  ${MARKETPLACE_POST}
  query filterMarketplacePosts(
    $latitude: Float
    $latitudeDelta: Float
    $longitude: Float 
    $longitudeDelta: Float 
    $tagsSlugs: [String!]
    $text: String=""
    $sortBy: String="distance"
  ) {
    filterMarketplacePosts(
      filterPostsInput: {
        latitude: $latitude
        latitudeDelta: $latitudeDelta
        longitude: $longitude 
        longitudeDelta: $longitudeDelta
        tagsSlugs: $tagsSlugs
        text: $text
        limit: 100
        sortBy: $sortBy
      }
    ) {
      data {
        ...MarketplacePost
      }
    }
  }
`
export const AUTO_COMPLETE_TAGS = gql`
  query marketplaceAutoCompleteTag($name: String!) {
    marketplaceAutoCompleteTag(autoCompleteTagInput: { name: $name }) {
      _id
      name
      createdAt
      updatedAt
    }
  }
`
export const GET_TAGS = gql`
  query {
    getMarketplaceTags(getMarketPlaceTagsInput: {limit:30}) {
      data {
      _id
      name
      createdAt
      updatedAt
      slug
      }
    }
  }
`

export const AUTO_COMPLETE_LOCATION = gql`
  query googleMapAutoComplete($name: String!) {
    googleMapAutoComplete(name: $name) {
      id
      name
    }
  }
`
export const GET_LOCATION_LAT_LONG = gql`
  query googleMapPlaceCoordinates($id: String!) {
    googleMapPlaceCoordinates(id: $id) {
      latitude
      longitude
    }
  }
`
export const UPLOAD_IMAGE = gql`
  mutation uploadFile($file: Upload!) {
    uploadFile(file: $file) {
      filename
      url
    }
  }
`

export const MY_POST = gql`
  ${MARKETPLACE_POST}

  query myPosts($page: Float = 1,$limit: Float = 10) {
    myPosts(myPostsInput:{page:$page,limit:$limit}) {
      data {
        ...MarketplacePost
      }
    }
  }
`

export const GET_POST_DETAIL = gql`
  ${MARKETPLACE_POST}
  query getMarketplacePost($id: String!) {
    getMarketPlacePost(id:$id) {
      ...MarketplacePost
    }
  }
`