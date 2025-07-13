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

/**
 * This is used to fetch the partner token for the partner sign up process.
 * @param partnerProfileNo - The profile number of the partner.
 * @param partnerApiKey - The API key of the partner.
 * @param persistToken - Whether to persist the token or not.
 * @returns A promise that resolves to the partner token.
 */
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

/**
 * Fetch the merchant token for the merchant payment.
 * @param apiId - The API ID of the merchant.
 * @param secretKey - The secret key of the merchant.
 * @param persistToken - Whether to persist the token or not.
 * @param env - The environment to use (default is 'prod').
 * @returns A promise that resolves to the merchant token.
 */
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

/**
 * Fetch the sub-merchant token for the sub-merchant payment.
 * @param email - The email of the sub-merchant.
 * @param partnerProfileNo - The profile number of the partner.
 * @param env - The environment to use (default is 'prod').
 * @param token - The merchant token to use for authentication.
 * @returns A promise that resolves to the sub-merchant token.
 */
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

/**
 * Create a new invoice using the Paylink API.
 * @param props - The properties for the invoice.
 * @param token - The merchant or sub-merchant token to use for authentication.
 * @returns A promise that resolves to the created invoice.
 */
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

/**
 * Pay an invoice using the Paylink API.
 * @param props - The properties for the payment.
 * @param token - The merchant or sub-merchant token to use for authentication.
 */
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

/**
 * Fetch the payment details for a specific transaction.
 * @param transactionNo - The transaction number to fetch details for.
 * @param env - The environment to use (default is 'prod').
 * @param token - The merchant or sub-merchant token to use for authentication.
 * @returns A promise that resolves to the payment details.
 */
export async function fetchPayment(
  { transactionNo, env = 'prod' }: GetInvoiceProps,
  token: string // merchant/sub-merchant token
) {
  return GET(
    `${PAYLINK_KEYS[env].PAYLINK_URL}/api/getInvoice/${transactionNo}`,
    token
  ) as Promise<PaylinkPayment>;
}

/**
 * Send an OTP for STC Pay payment.
 * @param props - The properties for sending the OTP.
 * @returns A promise that resolves to the response from the API.
 */
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

/**
 * Process the STC Pay payment after OTP verification.
 * @param props - The properties for processing the payment.
 * @returns A promise that resolves to the response from the API.
 */
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

/**
 * Refund a payment using the Paylink API.
 * @param props - The properties for the refund.
 * @param token - The merchant or sub-merchant token to use for authentication.
 * @returns A promise that resolves to the refund response.
 */
export async function refundPayment(
  { orderNumber, refundReason, email, env = 'prod' }: RefundPaymentProps,
  token: string // merchant/sub-merchant token
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
