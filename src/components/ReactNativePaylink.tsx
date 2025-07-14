import BottomSheet, { BottomSheetMethods } from '@devvie/bottom-sheet';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { IPhoneInputRef } from 'react-native-international-phone-number';
import type { AddInvoiceProps } from '../ts/types';
import Form from './Form';
import SelectPaymentMethod from './SelectPaymentMethod';
import { STCPayOtp } from './STCPayForm';
import { addInvoice } from '../ts/api';

export interface ReactNativePaylinkProps {
  language?: 'ar' | 'en';
  scheme?: 'light' | 'dark';
  token: string; // Merchant/Submerchant token
  order: AddInvoiceProps; // Order details
  onError?: (error: string) => void;
  onSuccess: (orderNumber: string, transactionNo?: string) => void;
  height?: number;
}

const ReactNativePaylink = forwardRef(
  (
    {
      language = 'en',
      scheme = 'light',
      token,
      order,
      onError,
      onSuccess,
      height = 80,
    }: ReactNativePaylinkProps,
    sheetRef: React.ForwardedRef<BottomSheetMethods>
  ) => {
    const { width: tab_size } = useWindowDimensions();

    const styles = useStyles(tab_size);
    const scroll = useRef<ScrollView>(null);
    const phoneInputRef = useRef<IPhoneInputRef>(null);

    const [sheetHeight, setSheetHeight] = useState(height);
    const [formType, setFormType] = useState<
      'stcpay' | 'creditcard' | 'online'
    >('stcpay');
    const [transactionNo, setTransactionNo] = useState('');
    const [stcPayObj, setStcPayObj] = useState({
      paymentSessionId: '',
      signature: '',
      signedBase64Data: '',
    });
    const [paymentUrl, setPaymentUrl] = useState('');

    const handleScroll = useCallback(
      async (_tab: number) => {
        if (_tab === 1) {
          setSheetHeight(100);
          const result = await addInvoice(
            {
              ...order,
            },
            token
          );
          console.log('Add Invoice Result:', result);
          setPaymentUrl(result.url);
        } else {
          setSheetHeight(height);
        }
        scroll.current?.scrollTo({ x: _tab * tab_size });
      },
      [height, order, tab_size, token]
    );

    useEffect(() => {
      handleScroll(0);
    }, []);

    return (
      <BottomSheet
        ref={sheetRef}
        animationType="spring"
        height={sheetHeight + '%'}
        disableBodyPanning={true}
      >
        <ScrollView
          ref={scroll}
          showsHorizontalScrollIndicator={false}
          horizontal={true}
          scrollEnabled={false}
          snapToInterval={tab_size}
          scrollEventThrottle={8}
          decelerationRate="fast"
        >
          {/* TAB ONE  */}
          <View style={styles.tab}>
            <SelectPaymentMethod
              language={language}
              token={token}
              order={order}
              tab_size={tab_size}
              setFormType={setFormType}
              handleScroll={handleScroll}
              scheme={scheme}
              onSuccess={onSuccess}
            />
          </View>

          {/* TAB TWO */}
          <View style={styles.tab}>
            <Form
              handleScroll={handleScroll}
              formType={formType}
              scheme={scheme}
              language={language}
              token={token}
              order={order}
              onError={onError}
              setTransactionNo={setTransactionNo}
              setStcPayObj={setStcPayObj}
              ref={phoneInputRef}
              paymentUrl={paymentUrl}
            />
          </View>

          {/* TAB THREE */}
          <View style={styles.tab}>
            <STCPayOtp
              handleScroll={handleScroll}
              scheme={scheme}
              stcPayObj={stcPayObj}
              language={language}
              transactionNo={transactionNo}
              onError={onError}
              order={order}
            />
          </View>
        </ScrollView>
      </BottomSheet>
    );
  }
);

const useStyles = (tab_size: number) =>
  StyleSheet.create({
    tab: { width: tab_size, paddingHorizontal: 20 },
  });

export default ReactNativePaylink;
