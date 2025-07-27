import { ArrowLeft } from 'lucide-react-native';
import { Text, View } from 'react-native';
import AwesomeButton from 'react-native-really-awesome-button';
import { COLORS } from '../ts/constants';
import type { AddInvoiceProps } from '../ts/types';
import CreditCardForm from './CreditCardForm';
import { STCPayInput } from './STCPayForm';
import { forwardRef, type ForwardedRef } from 'react';
import { IPhoneInputRef } from 'react-native-international-phone-number';
import WebView from 'react-native-webview';

interface FormProps {
  handleScroll: (index: number) => void;
  formType: 'stcpay' | 'creditcard' | 'online';
  scheme: 'light' | 'dark';
  language: 'ar' | 'en';
  token: string;
  order: AddInvoiceProps;
  setTransactionNo: (transactionNo: string) => void;
  setStcPayObj: (stcPayObj: {
    paymentSessionId: string;
    signature: string;
    signedBase64Data: string;
  }) => void;
  paymentUrl?: string;
  onError?: (error: string) => void;
}

const Form = forwardRef(
  (
    {
      handleScroll,
      formType,
      scheme,
      language,
      setTransactionNo,
      setStcPayObj,
      token,
      order,
      onError,
      paymentUrl,
    }: FormProps,
    phoneInputRef?: ForwardedRef<IPhoneInputRef>
  ) => {
    return (
      <>
        {/* Back Button */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 }}>
          <AwesomeButton
            onPress={() => {
              handleScroll(0);
              // reset

              // @ts-ignore
              phoneInputRef?.current?.clear?.();
              setTransactionNo('');
              setStcPayObj({
                paymentSessionId: '',
                signature: '',
                signedBase64Data: '',
              });
            }}
            height={50}
            width={50}
            borderRadius={50 / 2}
            backgroundColor={
              formType === 'stcpay' ? COLORS[scheme].stcpay : COLORS[scheme].bg
            }
          >
            <ArrowLeft
              size={24}
              color={
                formType === 'stcpay'
                  ? COLORS[scheme].stcpayText
                  : COLORS[scheme].text
              }
            />
          </AwesomeButton>

          <Text
            style={{
              fontWeight: 'bold',
              fontSize: 18,
              color: COLORS[scheme].text,
            }}
          >
            {formType === 'stcpay'
              ? language === 'ar'
                ? 'أدخل رقم هاتفك'
                : 'Enter your phone number'
              : language === 'ar'
                ? 'أدخل بيانات بطاقتك'
                : 'Enter your card details'}
          </Text>
        </View>

        <View style={{ height: 15 }} />

        {formType === 'stcpay' ? (
          <STCPayInput
            language={language}
            scheme={scheme}
            token={token}
            order={order}
            setTransactionNo={setTransactionNo}
            setStcPayObj={setStcPayObj}
            onError={onError}
            handleScroll={handleScroll}
            ref={phoneInputRef}
          />
        ) : formType === 'creditcard' ? (
          <CreditCardForm
            language={language}
            scheme={scheme}
            onError={onError}
            token={token}
            order={order}
          />
        ) : (
          <WebView
            source={{ uri: paymentUrl || '' }}
            onNavigationStateChange={() => {}}
          />
        )}
      </>
    );
  }
);

export default Form;
