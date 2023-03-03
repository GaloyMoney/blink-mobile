import { gql } from "@apollo/client"

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
      # hidePhoneNumber
    }
  }
`
export const FILTER_MARKET_PLACE_POST = gql`
  query filterMarketplacePosts(
    $latitude: Float
    $longitude: Float
    $maxDistance: Float=2000
    $minDistance: Float=0
    $tagsSlugs: [String!]
    $text: String=""
  ) {
    filterMarketplacePosts(
      filterPostsInput: {
        latitude: $latitude
        longitude: $longitude
        maxDistance: $maxDistance
        minDistance: $minDistance
        tagsSlugs: $tagsSlugs
        text: $text
        limit: 100
      }
    ) {
      data {

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
      owner {
        phoneNumber
        hidePhoneNumber
      }
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
  query myPosts($page: Float = 1,$limit: Float = 10) {
    myPosts(myPostsInput:{page:$page,limit:$limit}) {
      data {
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
          slug
        }
        owner {
          phoneNumber
          hidePhoneNumber
        }
      }
    }
  }
`

export const GET_POST_DETAIL = gql`
  query getMarketplacePost($id: String!) {
    getMarketPlacePost(id:$id) {
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
    }
  }
`