

import { MarketplaceTag } from "@app/constants/model";
import { AUTO_COMPLETE_TAGS, GET_TAGS } from "../queries/marketplace-query";
import PuravidaClient from "./client"
import { autoCompleteTagHandler, getTagsHandler } from "./handler";
export const autoCompleteTags = async (name:string): Promise<
  MarketplaceTag[]
> => {
  let res = await PuravidaClient.query({ query: AUTO_COMPLETE_TAGS,variables:{name} })
  let formattedResponse = autoCompleteTagHandler(res)
  return formattedResponse
}

export const getTags = async (): Promise<
MarketplaceTag[]
> => {
  let res = await PuravidaClient.query({ query: GET_TAGS })
  let formattedResponse = getTagsHandler(res)
  return formattedResponse
}