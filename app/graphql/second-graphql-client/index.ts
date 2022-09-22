import { gql } from "@apollo/client"
import { GET_CATEGORY, GET_POSTS } from "@app/graphql/queries/marketplace-query"
import { PostAttributes } from "@app/redux/reducers/store-reducer"
import { CREATE_POST } from "../mutations/marketplace-mutation"
import PuravidaClient from "./client"
import { getMarketPlaceCategoriesHandler, getPostsHandler } from "./handler"
export const getMartketPlaceCategories = async (): Promise<
  { _id: string; name: string }[]
> => {
  let res = await PuravidaClient.query({ query: GET_CATEGORY })
  let formattedResponse = getMarketPlaceCategoriesHandler(res)
  console.log("formattedResponse: ", formattedResponse)

  return formattedResponse
}
export const createPost = async (post: PostAttributes) => {
  let res = await PuravidaClient.mutate({ mutation: CREATE_POST, variables: { ...post } })
  return res
}

export const getListPost = async (): Promise<PostAttributes[]> => {
  let res = await PuravidaClient.query({ query: GET_POSTS })
  let formattedResponse = getPostsHandler(res).map((post) => ({
    ...post,
    location: {
      lat: post.location?.coordinates[1] || 0,
      long: post.location?.coordinates[0] || 0,
    },
  }))
  return formattedResponse
}

export const uploadImage = async (file: any) => {
  let res = await PuravidaClient.mutate({ mutation: UPLOAD_IMAGE, variables: { file } })
  return res.data.uploadFile?.url
}
const UPLOAD_IMAGE = gql`
  mutation uploadFile($file: Upload!) {
    uploadFile(file: $file) {
      filename
      url
    }
  }
`
