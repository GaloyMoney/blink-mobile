import axios from 'axios';
import { PostAttributes } from "@app/modules/market-place/redux/reducers/store-reducer"
import { GoogleMapLocation, MarketplaceTag, PlaceCoordinates } from "../models"
import {
  autoCompleteLocationHandler,
  autoCompleteTagHandler,
  createTagHandle,
  filterPostHandler,
  getLocationLatLongHandler,
  getTagsHandler,
  getMarketPlaceCategoriesHandler,
  getPostsHandler,
  myPostHandler,
  getPostDetailHandler
} from "./handler"
import { CREATE_TAG, CREATE_POST, USER_DEVICE, REPORT_POST } from "./mutations/marketplace-mutation"
import {
  AUTO_COMPLETE_LOCATION,
  AUTO_COMPLETE_TAGS,
  FILTER_MARKET_PLACE_POST,
  GET_LOCATION_LAT_LONG,
  GET_TAGS,
  GET_CATEGORY, GET_POSTS,
  MY_POST,
  GET_POST_DETAIL
} from "./queries/marketplace-query"

import { getUniqueId } from "react-native-device-info"
import { getStorage } from '../utils/helper';
import { ACCESS_TOKEN } from '../config/constant';
import { client } from '../navigation/marketplace-stack';

type FilterPostParams = {
  latitude: number
  longitude: number
  maxDistance?: number
  minDistance?: number
  tagId?: string
  text?: string
}
export const autoCompleteTags = async (name: string): Promise<MarketplaceTag[]> => {
  const res = await client.query({ query: AUTO_COMPLETE_TAGS, variables: { name } })
  const formattedResponse = autoCompleteTagHandler(res)
  return formattedResponse
}

export const getTags = async (): Promise<MarketplaceTag[]> => {
  const res = await client.query({ query: GET_TAGS })
  const formattedResponse = getTagsHandler(res)
  return formattedResponse
}
export const autoComplete = async (name: string): Promise<GoogleMapLocation[]> => {
  const res = await client.query({
    query: AUTO_COMPLETE_LOCATION,
    variables: { name },
  })
  const formattedResponse = autoCompleteLocationHandler(res)
  return formattedResponse
}
export const getPlaceCoordinates = async (id: string): Promise<PlaceCoordinates> => {
  const res = await client.query({
    query: GET_LOCATION_LAT_LONG,
    variables: { id },
  })
  const formattedResponse = getLocationLatLongHandler(res)
  return formattedResponse
}

export const createTag = async (name: string) => {
  const res = await client.mutate({ mutation: CREATE_TAG, variables: { name } })
  const formattedResponse = createTagHandle(res)
  return formattedResponse
}
export const filterPosts = async (
  params: FilterPostParams,
): Promise<PostAttributes[]> => {
  const res = await client.query({
    query: FILTER_MARKET_PLACE_POST,
    variables: params,
  })
  const formattedResponse = filterPostHandler(res)
  return formattedResponse
}
export const getMartketPlaceCategories = async (): Promise<
  { _id: string; name: string }[]
> => {
  const res = await client.query({ query: GET_CATEGORY })
  const formattedResponse = getMarketPlaceCategoriesHandler(res)

  return formattedResponse
}
export const createPost = async (post: PostAttributes) => {
  const res = await client.mutate({ mutation: CREATE_POST, variables: { ...post } })
  return res
}

export const getListPost = async (): Promise<PostAttributes[]> => {
  const res = await client.query({ query: GET_POSTS })
  const formattedResponse = getPostsHandler(res).map((post:any) => ({
    ...post,
    location: {
      lat: post.location?.coordinates[1] || 0,
      long: post.location?.coordinates[0] || 0,
    },
  }))
  return formattedResponse
}

export const uploadImage = async (uri: any, name: string, type: string, baseUrl: string) => {

  const token = await getStorage(ACCESS_TOKEN)
  
  let data = new FormData();
  data.append('image', { uri, name, filename: name, type });

  const res = await axios.post(`${baseUrl}/media/single`, data,{

    headers: {
      "Content-Type": "multipart/form-data",
      "authorization": `Bearer ${token}`,
    },
  })

  return res.data?.s3Result?.url
}

export const getMyPost = async (): Promise<PostAttributes[]> => {
  const res = await client.query({ query: MY_POST })
  
  const formattedResponse = myPostHandler(res).map((post:any) => ({
    ...post,
    location: {
      lat: post.location?.coordinates[1] || 0,
      long: post.location?.coordinates[0] || 0,
    },
  }))

  return formattedResponse
}

export const uploadDeviceToken = async (token: string) => {
  const deviceId = await getUniqueId()
  await client.mutate({ mutation: USER_DEVICE, variables: { deviceId, token } })
}

export const getPostDetail = async (id: string): Promise<PostAttributes> => {
  const res = await client.query({ query: GET_POST_DETAIL, variables: { id } })
  
  const formattedResponse = getPostDetailHandler(res)

  return {
    ...formattedResponse,
    location: {
      lat: formattedResponse.location?.coordinates[1] || 0,
      long: formattedResponse.location?.coordinates[0] || 0,
    },
  }
}

export const reportPost = async (params: { postSlug: string, reason: string }) => {
  const res = await client.mutate({ mutation: REPORT_POST, variables: { ...params } })
  return res
}