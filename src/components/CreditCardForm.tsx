import { AlertCircleIcon } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  CreditCardInput,
  type CreditCardFormData,
} from 'react-native-credit-card-input';
import AwesomeButton from 'react-native-really-awesome-button';
import { payInvoice } from '../ts/api';
import { COLORS } from '../ts/constants';
import type { AddInvoiceProps } from '../ts/types';
import { removeWhitespace } from '../ts/utils';

interface CreditCardFormProps {
  scheme: 'light' | 'dark';
  language: 'ar' | 'en';
  onError?: (error: string) => void;
  order: AddInvoiceProps;
  token: string;
}

export default function CreditCardForm({
  scheme,
  language,
  onError,
  order,
  token,
}: CreditCardFormProps) {
  const [showError, setShowError] = useState<undefined | string>();
  const [card, setCard] = useState({
    valid: false,
    expiry: {
      month: '',
      year: '',
    },
    number: '',
    securityCode: '',
  });

  function onCreditCardInfoChange(form: CreditCardFormData) {
    setCard({
      valid: form.valid,
      expiry: {
        month: form.values?.expiry?.split('/')?.[0] || '',
        year: form.values?.expiry?.split('/')?.[1] || '',
      },
      number: removeWhitespace(form.values?.number || ''),
      securityCode: form.values?.cvc || '',
    });
  }

  async function onSubmitCreditCard(next?: () => void) {
    if (!card.valid) {
      const err =
        language === 'ar'
          ? 'الرجاء تقديم بيانات بطاقة صالحة'
          : 'Please provide a valid card data';
      if (onError) {
        onError(err);
      }
      setShowError(err);
      return;
    }

    try {
      const payInvoiceResponse = await payInvoice(order, token);

      if (
        payInvoiceResponse.status === '406' ||
        payInvoiceResponse.detail?.includes('غير مفعل')
      ) {
        const err =
          language === 'ar' ? 'الحساب غير مفعل' : 'Account is not activated';
        if (onError) {
          onError(err);
        }
        setShowError(err);
        return;
      }

      // console.log(payInvoiceResponse);
    } catch (error) {
      console.log('ERR @ sendSMS -> AuthenticationContent:: ', error);

      const err =
        language === 'ar'
          ? 'الرجاء تقديم بيانات بطاقة صالحة'
          : 'Please provide a valid card data';
      if (onError) {
        onError(err);
      }
      setShowError(err);
    } finally {
      if (next) {
        next();
      }
    }
  }

  return (
    <>
      <CreditCardInput
        inputStyle={styles(scheme).creditCardInput}
        labels={{
          number: language === 'ar' ? 'رقم البطاقة' : 'Card Number',
          expiry: language === 'ar' ? 'تاريخ الانتهاء' : 'Expiry',
          cvc: language === 'ar' ? 'CVC' : 'CVC',
        }}
        placeholders={{
          number: '1234 5678 1234 5678',
          expiry: 'MM/YY',
          cvc: 'CVC',
        }}
        style={{ paddingHorizontal: 0 }}
        onChange={onCreditCardInfoChange}
      />

      {showError ? (
        <View style={styles(scheme).error}>
          <AlertCircleIcon color={COLORS[scheme].error} />
          <Text color={COLORS[scheme].error}>{showError}</Text>
        </View>
      ) : null}

      <View style={{ height: 15 }} />

      <AwesomeButton
        progress
        onPress={onSubmitCreditCard}
        height={45}
        width={'100%'}
        backgroundColor="#fff"
        textColor={COLORS[scheme].text}
      >
        {language === 'ar' ? 'إرسال' : 'Send'}
      </AwesomeButton>
    </>
  );
}

const styles = (scheme: 'light' | 'dark') =>
  StyleSheet.create({
    error: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    creditCardInput: {
      backgroundColor: COLORS[scheme].bg,
      borderWidth: 0,
      padding: 5,
      margin: 0,
      borderRadius: 5,
    },
  });
