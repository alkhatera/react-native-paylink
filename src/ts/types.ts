export interface TokenProps {
  apiId: string;
  secretKey: string;
  persistToken?: boolean;
  env?: 'test' | 'prod';
}

export interface PartnerTokenProps {
  partnerProfileNo?: string;
  partnerApiKey: string;
  persistToken: boolean;
  env?: 'test' | 'prod';
}

export interface MerchantTokenProps {
  email: string;
  profileNo: string;
  env?: 'test' | 'prod';
}

export interface Card {
  expiry: {
    month: string;
    year: string;
  };
  number: string;
  securityCode: string;
}

export interface Product {
  title: string;
  price: number;
  qty: number;
  description?: string;
  isDigital?: boolean;
  imageSrc?: string;
  specificVat?: number;
  productCost?: number;
}

export interface AddInvoiceProps {
  amount: number;
  callbackUrl?: string;
  clientEmail?: string;
  clientMobile: string;
  currency?: string;
  clientName: string;
  note?: string;
  orderNumber: string;
  smsMessage?: string;
  supportedCardBrands?: (
    | 'mada'
    | 'visaMastercard'
    | 'amex'
    | 'tabby'
    | 'tamara'
    | 'stcpay'
    | 'urpay'
  )[];
  displayPending?: boolean;
  card?: Card;
  products: Product[];
  callBackUrl?: string;
  env?: 'test' | 'prod';
}

export interface GetInvoiceProps {
  transactionNo: string;
  env?: 'test' | 'prod';
}

export interface RefundPaymentProps {
  orderNumber: string;
  refundReason: string;
  email: string;
  env?: 'test' | 'prod';
}

export interface SendOtpProps {
  stcpayMobileCountryCode: string;
  stcpayMobile: string;
  orderNumber: string;
  total: number;
  env: 'test' | 'prod';
}

export interface VerifyOtpProps {
  stcpayPaymentOTP: string;
  stcpayMobileCountryCode: string;
  stcpayMobile: string;
  paymentSessionId: string;
  signature: string;
  signedBase64Data: string;
  orderNumber: string;
  total: number;
  env: 'test' | 'prod';
}

export type Post = {
  url: string;
  payload: any;
  token?: string;
};

// EXPORT
export interface PayProps {
  callingCode?: string;
  phoneNumber?: string;
  card?: Card;
  token: string;
  callBackUrl?: string;
  amount: number;
  clientName: string;
  note?: string;
  orderNumber: string;
  products?: Product[];
  currency?: string;
  env: 'test' | 'prod';
  clientEmail?: string;
}

export interface VerifySTCPayOtpProps {
  code: string;
  callingCode: string;
  phoneNumber: string;
  paymentSessionId: string;
  signature: string;
  signedBase64Data: string;
  orderNumber: string;
  total: number;
  env: 'test' | 'prod';
}

export interface PaylinkPayment {
  amount: number;
  checkUrl: string;
  digitalOrder: boolean;
  foreignCurrencyRate: number;
  gatewayOrderRequest: {
    amount: number;
    callBackUrl: string;
    cancelUrl: string;
    clientEmail: string;
    clientMobile: string;
    clientName: string;
    currency: string;
    note: string;
    orderNumber: string;
    products: {
      amount: number;
      description: string;
      name: string;
      quantity: number;
    }[];
  };
  orderStatus: 'Cancelled' | 'Declined' | 'Paid' | 'Pending';
  paymentErrors: {
    errorCode: string;
    errorMessage: string;
    errorTile: Date;
    errorTitle: string;
  }[];
  qrUrl: string;
  success: boolean;
  transactionNo: string;
  url: string;
  paymentReceipt: {
    receiptUrl: string;
    passcode: string;
    paymentMethod: string;
    paymentDate: string;
    bankCardNumber: string;
  };
}
