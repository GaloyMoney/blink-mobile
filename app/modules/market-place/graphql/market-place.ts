import { PostAttributes } from "@app/modules/market-place/redux/reducers/store-reducer"
import { GoogleMapLocation, MarketplaceTag, PlaceCoordinates } from "../models"
import PuravidaClient from "./client"
import {
  autoCompleteLocationHandler,
  autoCompleteTagHandler,
  createTagHandle,
  filterPostHandler,
  getLocationLatLongHandler,
  getTagsHandler,
  getMarketPlaceCategoriesHandler, 
  getPostsHandler
} from "./handler"
import { CREATE_TAG, CREATE_POST } from "./mutations/marketplace-mutation"
import {
  AUTO_COMPLETE_LOCATION,
  AUTO_COMPLETE_TAGS,
  FILTER_MARKET_PLACE_POST,
  GET_LOCATION_LAT_LONG,
  GET_TAGS,
  GET_CATEGORY, GET_POSTS, 
  UPLOAD_IMAGE
} from "./queries/marketplace-query"

export * from "./market-place"

type FilterPostParams = {
  latitude: number
  longitude: number
  maxDistance?: number
  minDistance?: number
  tagId?: string
  text?: string
}
export const autoCompleteTags = async (name: string): Promise<MarketplaceTag[]> => {
  const res = await PuravidaClient.query({ query: AUTO_COMPLETE_TAGS, variables: { name } })
  const formattedResponse = autoCompleteTagHandler(res)
  return formattedResponse
}

export const getTags = async (): Promise<MarketplaceTag[]> => {
  const res = await PuravidaClient.query({ query: GET_TAGS })
  const formattedResponse = getTagsHandler(res)
  return formattedResponse
}
export const autoComplete = async (name: string): Promise<GoogleMapLocation[]> => {
  const res = await PuravidaClient.query({
    query: AUTO_COMPLETE_LOCATION,
    variables: { name },
  })
  const formattedResponse = autoCompleteLocationHandler(res)
  return formattedResponse
}
export const getPlaceCoordinates = async (id: string): Promise<PlaceCoordinates> => {
  const res = await PuravidaClient.query({
    query: GET_LOCATION_LAT_LONG,
    variables: { id },
  })
  const formattedResponse = getLocationLatLongHandler(res)
  return formattedResponse
}

export const createTag = async (name: string) => {
  const res = await PuravidaClient.mutate({ mutation: CREATE_TAG, variables: { name } })
  const formattedResponse = createTagHandle(res)
  return formattedResponse
}
export const filterPosts = async (
  params: FilterPostParams,
): Promise<PostAttributes[]> => {
  const res = await PuravidaClient.query({
    query: FILTER_MARKET_PLACE_POST,
    variables: params,
  })
  const formattedResponse = filterPostHandler(res)
  return formattedResponse
}
export const getMartketPlaceCategories = async (): Promise<
  { _id: string; name: string }[]
> => {
  const res = await PuravidaClient.query({ query: GET_CATEGORY })
  const formattedResponse = getMarketPlaceCategoriesHandler(res)
  console.log("formattedResponse: ", formattedResponse)

  return formattedResponse
}
export const createPost = async (post: PostAttributes) => {
  const res = await PuravidaClient.mutate({ mutation: CREATE_POST, variables: { ...post } })
  return res
}

export const getListPost = async (): Promise<PostAttributes[]> => {
  const res = await PuravidaClient.query({ query: GET_POSTS })
  const formattedResponse = getPostsHandler(res).map((post) => ({
    ...post,
    location: {
      lat: post.location?.coordinates[1] || 0,
      long: post.location?.coordinates[0] || 0,
    },
  }))
  return formattedResponse
}

export const uploadImage = async (file: any) => {
  const res = await PuravidaClient.mutate({ mutation: UPLOAD_IMAGE, variables: { file } })
  return res.data.uploadFile?.url
}
