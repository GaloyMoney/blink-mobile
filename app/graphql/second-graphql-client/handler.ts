export const getMarketPlaceCategoriesHandler = (res: any) => {
  return res?.data?.getMarketplaceCategories
}
export const getPostsHandler = (res: any) => {
  return res?.data?.getMarketplacePosts || []
}
export const autoCompleteTagHandler = (res: any) => {
  return res?.data?.marketplaceAutoCompleteTag
}
export const getTagsHandler = (res: any) => {
  return res?.data?.getMarketplaceTags
}