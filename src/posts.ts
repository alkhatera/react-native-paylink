import { PAYLINK_KEYS } from './constants';
import type {
  AddInvoiceProps,
  Post,
  SendOtpProps,
  TokenProps,
  VerifyOtpProps,
} from './types';

export async function fetchToken({
  apiId,
  secretKey,
  persistToken,
  env,
}: TokenProps) {
  return POST({
    url: `${PAYLINK_KEYS[env].PAYLINK_URL}/api/auth`,
    payload: {
      apiId,
      secretKey,
      persistToken,
    },
  });
}

// TODO: ADD FETCH MERCHANT TOKEN

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
    env,
  }: AddInvoiceProps,
  token: string
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
    env,
  }: AddInvoiceProps,
  token: string
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
    throw new Error(`ERR ${res.status}`);
  } catch (error: any) {
    throw new Error(error.message);
  }
}
