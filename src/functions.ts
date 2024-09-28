import {
  startPaymentAsync,
  type PaymentSummaryItem,
} from 'expo-apple-pay-button';
import { addInvoice, payInvoice, processSTCPayPayment, sendOtp } from './posts';
import type { PayProps, VerifySTCPayOtpProps } from './types';
import {
  isEmpty,
  isValidPhoneNumber,
  removeWhitespace,
  toEnglishNumber,
} from './utils';

export async function payUsingApplePay(
  merchantName: string,
  merchantId: string
) {
  console.log('Apple Pay Button Pressed');
  // Handle Apple Pay button press event

  try {
    const items: PaymentSummaryItem[] = [
      {
        label: 'Item 1',
        amount: '10.00',
      },
      {
        label: 'Item 2',
        amount: '20.00',
      },
    ];

    const payment = await startPaymentAsync({
      merchantName, // this is the name that will appear on the payment sheet
      merchantId, // this is the merchant id you have to create on the apple developer portal
      items,
    });

    if (!payment) {
      return {
        errors: [
          {
            en: 'Apple Pay Payment Failed',
            ar: 'فشل الدفع عبر Apple Pay',
          },
        ],
        response: payment,
      };
    } else {
      return payment;
    }
  } catch (error: any) {
    return {
      errors: [
        {
          en: 'Apple Pay Payment Failed:: ' + error.message,
          ar: 'فشل الدفع عبر Apple Pay:: ' + error.message,
        },
      ],
      response: null,
    };
  }
}

export async function sendSTCPayOtp({
  callingCode = '+966',
  phoneNumber = '',
  env = 'prod',
  amount,
  clientName,
  note,
  orderNumber,
  products = [],
  token,
  clientEmail,
  callBackUrl,
  currency = 'SAR',
}: PayProps) {
  if (isEmpty(token)) {
    return {
      errors: [
        {
          en: 'Token is required',
          ar: 'الرمز مطلوب',
        },
      ],
    };
  }

  const isPhoneNumberValid =
    isEmpty(callingCode) || isEmpty(phoneNumber)
      ? false
      : isValidPhoneNumber(callingCode, phoneNumber);

  if (!isPhoneNumberValid) {
    return {
      errors: [
        {
          en: 'Please provide a valid phone number',
          ar: 'الرجاء تقديم رقم هاتف صالح',
        },
      ],
    };
  }

  const stcpayMobileCountryCode = callingCode?.startsWith('+')
    ? (callingCode?.split('+')[1] ?? callingCode)
    : callingCode;
  const stcpayMobile = removeWhitespace(phoneNumber);

  try {
    const addInvoiceResponse = await addInvoice(
      {
        amount,
        clientMobile: `+${stcpayMobileCountryCode}${stcpayMobile}`,
        clientName: clientName,
        note,
        orderNumber,
        products,
        env,
        clientEmail,
        callBackUrl,
        currency,
      },
      token
    );

    if (
      addInvoiceResponse.status === '406' ||
      addInvoiceResponse.detail?.includes('غير مفعل')
    ) {
      return {
        errors: [
          {
            en: 'Account is not activated',
            ar: 'الحساب غير مفعل',
          },
        ],
        reponse: addInvoiceResponse,
      };
    }

    console.log('addInvoiceResponse:: ', addInvoiceResponse.transactionNo);

    const stcPayResponse = await sendOtp({
      stcpayMobileCountryCode,
      stcpayMobile,
      orderNumber: addInvoiceResponse.transactionNo,
      total: amount,
      env,
    });
    console.log('stcPayResponse:: ', stcPayResponse);

    return {
      transactionNo: addInvoiceResponse.transactionNo,
      paymentSessionId: stcPayResponse.paymentSessionId,
      signature: stcPayResponse.signature,
      signedBase64Data: stcPayResponse.signedBase64Data,
    };
  } catch (error: any) {
    return {
      errors: [
        {
          en: 'Error sending OTP:: ' + error.message,
          ar: 'خطأ في إرسال رمز التحقق:: ' + error.message,
        },
      ],
    };
  }
}

export async function verifySTCPayOtp({
  code,
  callingCode,
  phoneNumber,
  paymentSessionId,
  signature,
  signedBase64Data,
  orderNumber,
  total,
  env = 'prod',
}: VerifySTCPayOtpProps) {
  const stcpayPaymentOTP = toEnglishNumber(code);

  if (stcpayPaymentOTP.length !== 6) {
    return {
      errors: [
        {
          en: 'Please provide a valid OTP',
          ar: 'الرجاء تقديم رمز تحقق صالح',
        },
      ],
    };
  }

  if (
    isEmpty(paymentSessionId) ||
    isEmpty(signature) ||
    isEmpty(signedBase64Data)
  ) {
    return {
      errors: [
        {
          en: 'Please provide a valid payment session',
          ar: 'الرجاء تقديم جلسة دفع صالحة',
        },
      ],
    };
  }

  try {
    const stcpayMobileCountryCode = callingCode?.startsWith('+')
      ? (callingCode?.split('+')[1] ?? callingCode)
      : callingCode;
    const stcpayMobile = removeWhitespace(phoneNumber);

    const stcPayResponse = await processSTCPayPayment({
      stcpayMobileCountryCode,
      stcpayMobile,
      orderNumber,
      total,
      stcpayPaymentOTP,
      paymentSessionId,
      signature,
      signedBase64Data,
      env,
    });

    console.log('stcPayResponse:: ', stcPayResponse);

    if (stcPayResponse.statusCode === 200) {
      return stcPayResponse;
    } else {
      return {
        errors: [
          {
            en: 'Error processing STCPay payment',
            ar: 'خطأ في معالجة دفع STCPay',
          },
        ],
        response: stcPayResponse,
      };
    }
  } catch (error: any) {
    return {
      errors: [
        {
          en: 'Error verifying OTP:: ' + error.message,
          ar: 'خطأ في التحقق من رمز التحقق:: ' + error.message,
        },
      ],
    };
  }
}

export async function payUsingCard({
  callingCode = '+966',
  phoneNumber = '',
  card,
  token,
  callBackUrl,
  amount,
  clientName,
  note,
  currency = 'SAR',
  orderNumber,
  products = [],
  clientEmail,
  env = 'prod',
}: PayProps) {
  if (isEmpty(token)) {
    return {
      errors: [
        {
          en: 'Token is required',
          ar: 'الرمز مطلوب',
        },
      ],
    };
  }

  if (
    isEmpty(card?.number) ||
    isEmpty(card?.expiry.month) ||
    isEmpty(card?.expiry.year) ||
    isEmpty(card?.securityCode)
  ) {
    return {
      errors: [
        {
          en: 'Please provide a valid card data',
          ar: 'الرجاء تقديم بيانات بطاقة صالحة',
        },
      ],
    };
  }

  const stcpayMobileCountryCode = callingCode?.startsWith('+')
    ? (callingCode?.split('+')[1] ?? callingCode)
    : callingCode;
  const stcpayMobile = removeWhitespace(phoneNumber);
  try {
    const payInvoiceResponse = await payInvoice(
      {
        amount,
        callBackUrl,
        clientEmail,
        clientMobile: `+${stcpayMobileCountryCode}${stcpayMobile}`,
        currency,
        clientName,
        note,
        orderNumber,
        products,
        card,
        env,
      },
      token
    );

    if (
      payInvoiceResponse.status === '406' ||
      payInvoiceResponse.detail?.includes('غير مفعل')
    ) {
      return {
        errors: [
          {
            en: 'Account is not activated',
            ar: 'الحساب غير مفعل',
          },
        ],
        response: payInvoiceResponse,
      };
    }

    console.log(payInvoiceResponse);
    return payInvoiceResponse;
  } catch (error: any) {
    return {
      errors: [
        {
          en: 'Error paying invoice:: ' + error.message,
          ar: 'خطأ في دفع الفاتورة:: ' + error.message,
        },
      ],
    };
  }
}
