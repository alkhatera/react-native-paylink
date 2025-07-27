import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ApplePayButtonWebView from './ApplePayButtonWebView';
import AwesomeButton from 'react-native-really-awesome-button';
import STCPayLogo from '../assets/stcpay';
import { COLORS } from '../ts/constants';
import { useState } from 'react';

interface SelectPaymentMethodProps {
  language: 'ar' | 'en';
  token: string;
  order: any;
  tab_size: number;
  setFormType: (type: 'stcpay' | 'creditcard' | 'online') => void;
  handleScroll: (index: number) => void;
  scheme: 'light' | 'dark';
  onSuccess: (orderNumber: string, transactionNo?: string) => void;
}

export default function SelectPaymentMethod({
  language,
  token,
  order,
  tab_size,
  setFormType,
  handleScroll,
  scheme,
  onSuccess,
}: SelectPaymentMethodProps) {
  const [applePayLoaded, setApplePayLoaded] = useState<boolean>(false);

  function onLoaded(isLoaded: boolean) {
    setApplePayLoaded(isLoaded);
  }

  function onButtonPress(button: 'stcpay' | 'creditcard' | 'online') {
    setFormType(button);
    handleScroll(1);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.text, { color: COLORS[scheme].text }]}>
        {language === 'ar' ? 'اختر طريقة الدفع' : 'Choose payment method'}
      </Text>

      {Platform.OS === 'ios' ? (
        <>
          <View style={styles.divider} />
          <View
            style={{
              width: '100%',
              display: applePayLoaded ? 'flex' : 'none',
            }}
          >
            <ApplePayButtonWebView
              token={token}
              order={order}
              onLoaded={onLoaded}
              height={46}
              width={tab_size - 40}
              language={language}
              onSuccess={onSuccess}
            />
          </View>

          <View
            style={{
              width: '100%',
              display: applePayLoaded ? 'none' : 'flex',
            }}
          >
            {/* @ts-ignore */}
            <AwesomeButton disabled height={45} width={'100%'} />
          </View>
        </>
      ) : null}

      <View style={styles.divider} />

      <AwesomeButton
        onPress={() => onButtonPress('stcpay')}
        height={45}
        // @ts-ignore
        width={'100%'}
        backgroundColor={COLORS[scheme].stcpay}
      >
        <STCPayLogo />
      </AwesomeButton>

      <View style={styles.lgDivider} />

      <AwesomeButton
        onPress={() => onButtonPress('creditcard')}
        height={45}
        // @ts-ignore
        width={'100%'}
        backgroundColor={COLORS[scheme].bg}
      >
        <Image
          source={require('../assets/alaamada.png')}
          resizeMode="contain"
          style={styles.img1}
        />
        <Image
          source={require('../assets/alaavisa.png')}
          resizeMode="contain"
          style={styles.img2}
        />
        <Image
          source={require('../assets/alaamastercard.png')}
          resizeMode="contain"
          style={styles.img3}
        />
        <Image
          source={require('../assets/alaaamex.png')}
          resizeMode="contain"
          style={styles.img4}
        />
      </AwesomeButton>

      <View style={styles.lgDivider} />

      <AwesomeButton
        onPress={() => onButtonPress('online')}
        height={45}
        // @ts-ignore
        width={'100%'}
        backgroundColor={COLORS[scheme].text}
      >
        {language === 'ar' ? 'الدفع عبر الإنترنت' : 'Online Payment'}
      </AwesomeButton>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { height: '100%' },
  text: { textAlign: 'left', fontSize: 18, fontWeight: 'bold' },
  divider: { height: 10 },
  lgDivider: { height: 15 },
  img1: { width: 80, height: 80 },
  img2: { width: 40, height: 40 },
  img3: { width: 50, height: 50 },
  img4: { width: 45, height: 45 },
});
