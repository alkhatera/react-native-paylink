import { PAYLINK_KEYS } from './constants';
import type {
  AddInvoiceProps,
  GetInvoiceProps,
  MerchantTokenProps,
  PartnerTokenProps,
  PaylinkPayment,
  Post,
  RefundPaymentProps,
  SendOtpProps,
  TokenProps,
  VerifyOtpProps,
} from './types';

export async function fetchMerchantToken({
  apiId,
  secretKey,
  persistToken = true,
  env = 'prod',
}: TokenProps) {
  return POST({
    url: `${PAYLINK_KEYS[env].PAYLINK_URL}/api/auth`,
    payload: {
      apiId,
      secretKey,
      persistToken,
    },
  }) as Promise<{ id_token: string }>;
}

export async function fetchPartnerToken({
  partnerProfileNo,
  partnerApiKey,
  persistToken,
  env = 'prod',
}: PartnerTokenProps) {
  return POST({
    url: `${PAYLINK_KEYS[env].PAYLINK_URL}/api/partner/auth`,
    payload: {
      profileNo: partnerProfileNo,
      apiKey: partnerApiKey,
      persistToken: persistToken || false,
    },
  }) as Promise<{ id_token: string }>;
}

export async function fetchSubMerchantToken(
  { email, partnerProfileNo, env = 'prod' }: MerchantTokenProps,
  token: string // merchant token
) {
  const authToken = await GET(
    `${PAYLINK_KEYS[env].PAYLINK_URL}/rest/partner/getMerchantKeys/email/${email}?profileNo=${partnerProfileNo}`,
    token
  );

  return authToken as {
    id: number;
    merchantId: number;
    merchantPhone: string;
    apiId: string;
    secretKey: string;
  };
}

export async function addInvoice(
  {
    amount,
    callbackUrl,
    clientEmail,
    clientMobile,
    clientName,
    currency,
    note,
    orderNumber,
    products,
    smsMessage,
    supportedCardBrands,
    displayPending,
    callBackUrl,
    env = 'prod',
  }: AddInvoiceProps,
  token: string // merchant/sub-merchant token
) {
  return POST({
    url: `${PAYLINK_KEYS[env].PAYLINK_URL}/api/addInvoice`,
    payload: {
      amount,
      callbackUrl,
      clientEmail,
      clientMobile,
      clientName,
      currency,
      note,
      orderNumber,
      products,
      smsMessage,
      supportedCardBrands,
      displayPending,
      callBackUrl,
    },
    token,
  });
}

export async function payInvoice(
  {
    amount,
    callbackUrl,
    clientEmail,
    clientMobile,
    clientName,
    currency,
    note,
    orderNumber,
    products,
    smsMessage,
    supportedCardBrands,
    displayPending,
    card,
    callBackUrl,
    env = 'prod',
  }: AddInvoiceProps,
  token: string // merchant/sub-merchant token
) {
  return POST({
    url: `${PAYLINK_KEYS[env].PAYLINK_URL}/api/payInvoice`,
    payload: {
      amount,
      callbackUrl,
      clientEmail,
      clientMobile,
      clientName,
      currency,
      note,
      orderNumber,
      products,
      smsMessage,
      supportedCardBrands,
      displayPending,
      card,
      callBackUrl,
    },
    token,
  });
}

export async function fetchPayment(
  { transactionNo, env = 'prod' }: GetInvoiceProps,
  token: string // merchant/sub-merchant token
) {
  return GET(
    `${PAYLINK_KEYS[env].PAYLINK_URL}/api/getInvoice/${transactionNo}`,
    token
  ) as Promise<PaylinkPayment>;
}

export async function sendOtp({
  stcpayMobileCountryCode,
  stcpayMobile,
  orderNumber,
  total,
  env,
}: SendOtpProps) {
  return POST({
    url: `${PAYLINK_KEYS[env].ORDER_URL}/rest/pay/stcpay/sendOtp`,
    payload: {
      stcpayMobileCountryCode,
      stcpayMobile,
      orderNumber,
      total,
    },
  });
}

export async function processSTCPayPayment({
  stcpayMobileCountryCode,
  stcpayMobile,
  orderNumber,
  total,
  stcpayPaymentOTP,
  paymentSessionId,
  signature,
  signedBase64Data,
  env,
}: VerifyOtpProps) {
  return POST({
    url: `${PAYLINK_KEYS[env].ORDER_URL}/rest/pay/stcpay/processPayment`,
    payload: {
      stcpayMobileCountryCode,
      stcpayMobile,
      orderNumber,
      total,
      stcpayPaymentOTP,
      paymentSessionId,
      signature,
      signedBase64Data,
    },
  });
}

export async function refundPayment(
  { orderNumber, refundReason, email, env = 'prod' }: RefundPaymentProps,
  token: string // partner token
): Promise<any> {
  return POST({
    url: `${
      PAYLINK_KEYS[env].PAYLINK_URL
    }/rest/partner/v2/merchant/email/${email}/refund`,
    payload: {
      orderNumber,
      refundReason,
    },
    token,
  });
}

async function POST({ url, payload, token }: Post) {
  try {
    let headers: {
      [key: string]: string;
    } = {
      'Accept': 'application/json, text/plain',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    };

    if (token) {
      headers = {
        ...headers,
        Authorization: `Bearer ${token}`,
      };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const result = await res.json();
      return result;
    }
    throw new Error(`ERR ${res.status} ${await res.text()}`);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

async function GET(url: string, token?: string) {
  try {
    let headers: Record<string, string> = {
      'Accept': 'application/json, text/plain',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    };

    if (token) {
      headers = {
        ...headers,
        Authorization: `Bearer ${token}`,
      };
    }

    const res = await fetch(url, { headers });
    return res.json();
  } catch (error: any) {
    throw new Error(error.message);
  }
}
