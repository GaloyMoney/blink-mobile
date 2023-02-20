export const TemplateMarketPlaceTag = {
  _id: "",
  createdAt: "",
  name: "",
  updatedAt: "",
  slug:"",
}
export const DefaultFilterPostModel = {
  maxDistance: 20000,
}
export interface MarketplaceTag {
  _id: string
  createdAt: string
  name: string
  updatedAt: string
  slug:string
}
export enum PostStatues {
  APPROVED = "APPROVED",
  DECLINED = "DECLINED",
  PENDING = "PENDING",
}
export interface MarketplacePost {
  _id: string
  address: string
  createdAt: string
  description: string
  imagesUrls: [string]
  location: {
    lat: number
    long: number
  }
  mainImageUrl: string
  name: string
  openHours?: string
  rating?: number
  status: PostStatues
  tagsIds: [string]
  updatedAt: string
  userId: string
  tags:MarketplaceTag[]
}
export interface GoogleMapLocation {
  id: string
  name: string
}
export interface PlaceCoordinates {
  latitude: number
  longitude: number
} 