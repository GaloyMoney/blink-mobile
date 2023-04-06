import { gql } from "@apollo/client";

export const MARKETPLACE_POST = gql`
  fragment MarketplacePost on MarketplacePost {
    _id
    address
    createdAt
    description
    imagesUrls
    location {
      coordinates
    }
    mainImageUrl
    name
    openHours
    rating
    status
    updatedAt
    userId
    tags {
      _id
      name
      slug
    }
    owner {
      phoneNumber
      hidePhoneNumber
    }
    slug
  }
`;
