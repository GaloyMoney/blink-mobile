/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: registerCaptcha
// ====================================================

export interface registerCaptcha_registerCaptchaGeetest {
  __typename: "RegisterCaptchaGeetestResult";
  success: number | null;
  gt: string | null;
  challenge: string | null;
  new_captcha: boolean | null;
}

export interface registerCaptcha {
  registerCaptchaGeetest: registerCaptcha_registerCaptchaGeetest | null;
}
