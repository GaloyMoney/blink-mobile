export const getMarketPlaceCategoriesHandler = (res: any) => {
  return res?.data?.getMarketplaceCategories
}
export const getPostsHandler = (res: any) => {
  return res?.data?.getMarketplacePosts || []
}
