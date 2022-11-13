import { PostAttributes } from "@app/modules/market-place/redux/reducers/store-reducer"
import PuravidaClient from "./client"
import { getMarketPlaceCategoriesHandler, getPostsHandler } from "./handler"
import { CREATE_POST } from "./mutations/marketplace-mutation"
import { GET_CATEGORY, GET_POSTS, UPLOAD_IMAGE } from "./queries/marketplace-query"
export * from "./market-place"
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
