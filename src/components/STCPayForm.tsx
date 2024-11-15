import { AlertCircleIcon, ArrowLeft } from 'lucide-react-native';
import { forwardRef, useState, type ForwardedRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import PhoneInput, {
  IPhoneInputRef,
} from 'react-native-international-phone-number';
import AwesomeButton from 'react-native-really-awesome-button';
import { addInvoice, processSTCPayPayment, sendOtp } from '../ts/api';
import { COLORS } from '../ts/constants';
import type { AddInvoiceProps } from '../ts/types';
import {
  isEmpty,
  isValidPhoneNumber,
  removeWhitespace,
  toEnglishNumber,
} from '../ts/utils';
import OTPInputView from '@twotalltotems/react-native-otp-input';

interface STCPayInputProps {
  language: 'ar' | 'en';
  onError?: (error: string) => void;
  order: AddInvoiceProps;
  token: string;
  setTransactionNo: (transactionNo: string) => void;
  setStcPayObj: (stcPayObj: {
    paymentSessionId: string;
    signature: string;
    signedBase64Data: string;
  }) => void;
  handleScroll: (index: number) => void;
  scheme: 'light' | 'dark';
}

export const STCPayInput = forwardRef(
  (
    {
      language,
      onError,
      order,
      token,
      setTransactionNo,
      setStcPayObj,
      handleScroll,
      scheme,
    }: STCPayInputProps,
    phoneInputRef: ForwardedRef<IPhoneInputRef>
  ) => {
    const [showError, setShowError] = useState<undefined | string>();

    async function onSendOtp(next?: () => void) {
      const isPhoneNumberValid = isEmpty(
        // @ts-ignore
        phoneInputRef?.current?.fullPhoneNumber ?? ''
      )
        ? false
        : isValidPhoneNumber(
            // @ts-ignore
            phoneInputRef?.current?.selectedCountry?.callingCode ?? '+966',
            // @ts-ignore
            phoneInputRef?.current?.value || ''
          );

      if (!isPhoneNumberValid) {
        const err =
          language === 'ar'
            ? 'الرجاء تقديم رقم هاتف صالح'
            : 'Please provide a valid phone number';
        if (onError) {
          onError(err);
        }
        setShowError(err);
        next && next();
        return;
      } else {
        setShowError(undefined);
      }
      const stcpayMobileCountryCode =
        // @ts-ignore
        (phoneInputRef?.current?.selectedCountry?.callingCode?.startsWith('+')
          ? // @ts-ignore
            phoneInputRef.current?.selectedCountry?.callingCode?.split('+')[1]
          : // @ts-ignore
            phoneInputRef?.current?.selectedCountry?.callingCode) || '+966';
      const stcpayMobile = removeWhitespace(
        // @ts-ignore
        phoneInputRef?.current?.value || ''
      );

      try {
        const addInvoiceResponse = await addInvoice(order, token);

        if (
          addInvoiceResponse.status === '406' ||
          addInvoiceResponse.detail?.includes('غير مفعل')
        ) {
          const err =
            language === 'ar' ? 'الحساب غير مفعل' : 'Account is not activated';
          if (onError) {
            onError(err);
          }
          setShowError(err);
          return;
        }

        setTransactionNo(addInvoiceResponse.transactionNo);
        // console.log('addInvoiceResponse:: ', addInvoiceResponse.transactionNo);

        // /rest/pay/stcpay/sendOtp
        const requestBody = {
          stcpayMobileCountryCode,
          stcpayMobile,
          orderNumber: addInvoiceResponse.transactionNo,
          total: order.amount || 0,
          env: order.env || 'prod',
        };

        const stcPayResponse = await sendOtp(requestBody);
        // console.log('stcPayResponse:: ', stcPayResponse);

        setStcPayObj({
          paymentSessionId: stcPayResponse.paymentSessionId,
          signature: stcPayResponse.signature,
          signedBase64Data: stcPayResponse.signedBase64Data,
        });

        handleScroll(2);
      } catch (error) {
        console.log('ERR @ sendSMS -> AuthenticationContent:: ', error);
        const err =
          language === 'ar'
            ? 'الرجاء تقديم رقم هاتف صالح'
            : 'Please provide a valid phone number';
        if (onError) {
          onError(err);
        }
        setShowError(err);
      } finally {
        next && next();
      }
    }

    return (
      <>
        <PhoneInput
          ref={phoneInputRef}
          placeholder={language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
          modalSearchInputPlaceholder={
            language === 'ar' ? 'بحث...' : 'Search...'
          }
          modalNotFoundCountryMessage={
            language === 'ar' ? 'لم يتم العثور على البلد' : 'Country not found'
          }
          language={language}
          defaultCountry="SA"
          popularCountries={['BH', 'SA']}
          modalHeight="90%"
          phoneInputStyles={phoneInputStyles(scheme)}
          modalStyles={modalStyles(scheme)}
        />

        <View style={{ height: 15 }} />

        {showError ? (
          <View style={styles.error}>
            <AlertCircleIcon color={COLORS[scheme].error} />
            <Text style={{ color: COLORS[scheme].error }}>{showError}</Text>
          </View>
        ) : null}

        <View style={{ height: 15 }} />

        <AwesomeButton
          progress
          onPress={onSendOtp}
          height={45}
          // @ts-ignore
          width={'100%'}
          backgroundColor={COLORS[scheme].stcpay}
        >
          {language === 'ar' ? 'ارسل الرمز القصير' : 'Send STC Pay OTP'}
        </AwesomeButton>
      </>
    );
  }
);

interface STCPayOtpProps {
  handleScroll: (index: number) => void;
  scheme: 'light' | 'dark';
  stcPayObj: {
    paymentSessionId: string;
    signature: string;
    signedBase64Data: string;
  };
  language: 'ar' | 'en';
  transactionNo: string;
  onError?: (error: string) => void;
  order: AddInvoiceProps;
}

export const STCPayOtp = forwardRef(
  (
    {
      handleScroll,
      scheme,
      stcPayObj,
      language,
      transactionNo,
      onError,
      order,
    }: STCPayOtpProps,
    phoneInputRef: ForwardedRef<IPhoneInputRef>
  ) => {
    const [showError, setShowError] = useState<undefined | string>();
    const [code, setCode] = useState('');
    const [numberOfChars] = useState(6);

    async function onCodeFilled(_code: string, next?: () => void) {
      const stcpayMobileCountryCode =
        // @ts-ignore
        phoneInputRef?.current?.selectedCountry?.callingCode?.startsWith('+')
          ? // @ts-ignore
            phoneInputRef.current?.selectedCountry?.callingCode?.split('+')[1]
          : // @ts-ignore
            phoneInputRef?.current?.selectedCountry?.callingCode;
      const stcpayMobile = removeWhitespace(
        // @ts-ignore
        phoneInputRef?.current?.value || ''
      );

      if (
        !stcPayObj.paymentSessionId ||
        !stcPayObj.signature ||
        !stcPayObj.signedBase64Data
      ) {
        const err =
          language === 'ar'
            ? 'الرجاء تقديم رقم هاتف صالح'
            : 'Please provide a valid phone number';
        if (onError) {
          onError(err);
        }
        setShowError(err);
        next && next();
        return;
      }

      try {
        const requestBody = {
          stcpayMobileCountryCode,
          stcpayMobile,
          orderNumber: transactionNo,
          total: order.amount || 0,
          stcpayPaymentOTP: toEnglishNumber(_code),
          paymentSessionId: stcPayObj.paymentSessionId,
          signature: stcPayObj.signature,
          signedBase64Data: stcPayObj.signedBase64Data,
          env: order.env || 'prod',
        };
        const stcPayResponse = await processSTCPayPayment(requestBody);

        // console.log('stcPayResponse:: ', stcPayResponse);

        if (stcPayResponse.statusCode === 200) {
          // TODO: SUCCESS OPERATION
        }
      } catch (error) {
        console.log('ERR @ sendSMS -> AuthenticationContent:: ', error);
        const err =
          language === 'ar'
            ? 'الرمز المدخل خاطئ'
            : 'The entered code is incorrect';
        if (onError) {
          onError(err);
        }
        setShowError(err);
      } finally {
        next && next();
      }
    }

    return (
      <>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
          <AwesomeButton
            onPress={() => {
              handleScroll(1);
              // reset
              setCode('');
            }}
            height={50}
            width={50}
            borderRadius={50 / 2}
            backgroundColor={COLORS[scheme].stcpay}
          >
            <ArrowLeft size={24} color={COLORS[scheme].bg} />
          </AwesomeButton>

          <Text
            style={{
              fontWeight: 'bold',
              fontSize: 18,
              color: COLORS[scheme].text,
            }}
          >
            {language === 'ar'
              ? 'أدخل الرمز المرسل لك'
              : 'Enter the code sent to you'}
          </Text>
        </View>

        <View style={{ height: 15 }} />

        {/* TODO: Change to Normal Textfield to Account for Different OTP Lengths */}
        <OTPInputView
          style={{ width: '100%', height: 50 }}
          pinCount={numberOfChars}
          code={code || ''}
          onCodeChanged={(_code: string) => setCode(toEnglishNumber(_code))}
          codeInputFieldStyle={codeInputFieldStyle(scheme)}
          autoFocusOnLoad={false}
          // onCodeFilled={(code) => {}}
        />

        <View style={{ height: 10 }} />

        {showError ? (
          <View style={styles.error}>
            <AlertCircleIcon color={COLORS[scheme].error} />
            <Text style={{ color: COLORS[scheme].error }}>{showError}</Text>
          </View>
        ) : null}

        <View style={{ height: 15 }} />

        <AwesomeButton
          progress
          onPress={(next) => onCodeFilled(code, next)}
          height={45}
          // @ts-ignore
          width={'100%'}
          backgroundColor={COLORS[scheme].stcpay}
          disabled={code.length < numberOfChars}
        >
          {language === 'ar' ? 'إرسال' : 'Send'}
        </AwesomeButton>
      </>
    );
  }
);

const styles = StyleSheet.create({
  error: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
});

const phoneInputStyles = (scheme: 'light' | 'dark') =>
  StyleSheet.create({
    container: {
      backgroundColor: COLORS[scheme].bg,
      borderStyle: 'solid',
      borderColor: COLORS[scheme].border,
      borderBottomWidth: 1,
      borderTopWidth: 0,
      borderRightWidth: 0,
      borderLeftWidth: 0,
    },
    flagContainer: {
      borderTopLeftRadius: 7,
      borderBottomLeftRadius: 7,
      backgroundColor: COLORS[scheme].bg,
      justifyContent: 'center',
    },
    divider: {
      backgroundColor: COLORS[scheme].divider,
    },
    callingCode: {
      color: COLORS[scheme].text,
    },
    input: {
      color: COLORS[scheme].text,
    },
  });

const modalStyles = (scheme: 'light' | 'dark') =>
  StyleSheet.create({
    modal: {
      paddingTop: 20, // TODO
      backgroundColor: COLORS[scheme].divider,
    },
    searchInput: {
      borderRadius: 8,
      borderWidth: 0,
      color: COLORS[scheme].text,
      backgroundColor: COLORS[scheme].bg,
      paddingHorizontal: 12,
      height: 46,
    },
    countryButton: {
      borderWidth: 0,
      backgroundColor: COLORS[scheme].bg,
      marginVertical: 4,
      paddingVertical: 0,
    },
    callingCode: {
      color: COLORS[scheme].text,
    },
    countryName: {
      color: COLORS[scheme].text,
    },
  });

const codeInputFieldStyle = (scheme: 'light' | 'dark') => ({
  width: 50,
  height: 45,
  borderWidth: 0,
  borderBottomWidth: 1,
  fontSize: 18,
  color: COLORS[scheme].text,
  borderColor: COLORS[scheme].text,
  backgroundColor: '#fff',
  borderRadius: 5,
});
