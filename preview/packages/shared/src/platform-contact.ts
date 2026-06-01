/** Preview 租车公司 / 平台客服（H5 展示、认证与违章咨询） */
export const RENTAL_COMPANY_CONTACT = {
  companyName: "租车平台客服中心",
  servicePhone: "400-888-6688",
  serviceHours: "9:00–18:00（工作日）"
} as const;

export const rentalCompanyPhoneDisplay = () => RENTAL_COMPANY_CONTACT.servicePhone;
