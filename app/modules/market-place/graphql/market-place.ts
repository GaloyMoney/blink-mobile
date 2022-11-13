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
} from "./handler"
import { CREATE_TAG } from "./mutations/marketplace-mutation"
import {
  AUTO_COMPLETE_LOCATION,
  AUTO_COMPLETE_TAGS,
  FILTER_MARKET_PLACE_POST,
  GET_LOCATION_LAT_LONG,
  GET_TAGS,
} from "./queries/marketplace-query"
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
