export const TemplateMarketPlaceTag ={
  _id:'',
  createdAt: '',
  name: '',
  updatedAt: '',
}
export interface MarketplaceTag {
    _id: string
    createdAt: string
    name: string
    updatedAt: string
  }
  enum POST_STATUS {
    APPROVED="APPROVED",
    DECLINED="DECLINED",
    PENDING="PENDING"
  }
  export interface  MarketplacePost {
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
    status: POST_STATUS
    tagsIds: [string]
    updatedAt: string
    userId: string
  }