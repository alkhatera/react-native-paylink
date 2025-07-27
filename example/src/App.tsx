import { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  BottomSheetMethods,
  fetchMerchantToken,
  ReactNativePaylink,
  type AddInvoiceProps,
} from 'react-native-paylink';
import { fetchPayment, fetchSubMerchantKeys } from '../../src/ts/api';
import { useFonts } from 'expo-font';

export default function App() {
  const sheetRef = useRef<BottomSheetMethods>(null);

  const [fontsLoaded, _error] = useFonts({
    SaudiRiyal: require('../assets/saudi_riyal.ttf'),
  });

  const [apiId, setApiId] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [isProd, setIsProd] = useState(false);
  const [isMerchant, setIsMerchant] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [profileNo, setProfileNo] = useState<string | null>(null);

  const order = useMemo(
    () =>
      ({
        orderNumber: '123456789',
        amount: 5,
        callBackUrl: 'https://example.com',
        cancelUrl: 'https://example.com',
        clientName: 'Alaa Alkhater',
        clientEmail: 'alaa@lazywait.com',
        clientMobile: '0512345678',
        currency: 'SAR',
        products: [
          {
            title: 'Book',
            price: 5,
            qty: 2,
            description: 'Book Description',
            isDigital: false,
            imageSrc: 'https://example.com/book.png',
            specificVat: 15,
            productCost: 2.3,
          },
        ],
        smsMessage: 'URL: [SHORT_URL], Amount: [AMOUNT]',
        supportedCardBrands: [
          'mada',
          'visaMastercard',
          'amex',
          'tabby',
          'tamara',
          'stcpay',
          'urpay',
        ],
        displayPending: true,
        note: 'Example invoice',
        env: 'prod',
      }) as AddInvoiceProps,
    []
  );

  const onPressPay = async () => {
    try {
      if (!apiId || !secretKey) {
        Alert.alert('Error', 'Please enter apiId and secretKey');
        return;
      }

      if (isMerchant) {
        const { id_token } = await fetchMerchantToken({
          apiId, // prod
          secretKey,
          env: isProd ? 'prod' : 'test', // prod
        });
        setToken(id_token);
        sheetRef.current?.open();
      } else {
        const { id_token } = await fetchMerchantToken({
          apiId, // prod
          secretKey,
          env: isProd ? 'prod' : 'test', // prod
        });

        const merchantKeys = await fetchSubMerchantKeys(
          {
            email: email ?? '',
            profileNo: profileNo ?? '',
            env: isProd ? 'prod' : 'test',
          },
          id_token
        );

        const { id_token: submerchantToken } = await fetchMerchantToken({
          apiId: merchantKeys.apiId,
          secretKey: merchantKeys.secretKey,
          env: isProd ? 'prod' : 'test',
        });

        setToken(submerchantToken);
        sheetRef.current?.open();
      }
    } catch (error) {
      console.error('Error fetching token:', error);
      Alert.alert('Error', 'Error fetching token');
    }
  };

  if (!fontsLoaded) {
    return <Text>Loading...</Text>; // Show a loading text while the font loads
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.inputCont}>
          <Text
            style={{
              fontFamily: 'SaudiRiyal',
              height: 30,
              textAlign: 'center',
            }}
          >
            &#xE900;5
          </Text>

          <TextInput
            style={styles.input}
            onChangeText={(text) => setApiId(text)}
            value={apiId}
            placeholder="apiId"
          />

          <TextInput
            style={styles.input}
            onChangeText={(text) => setSecretKey(text)}
            value={secretKey}
            placeholder="secretKey"
          />

          <View style={styles.switch}>
            <Text>Is Production?</Text>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isProd ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={(value) => setIsProd(value)}
              value={isProd}
            />
          </View>

          <View style={{ height: 10 }} />

          <View style={styles.switch}>
            <Text>Is Merchant Token?</Text>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isMerchant ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={(value) => setIsMerchant(value)}
              value={isMerchant}
            />
          </View>

          {!isMerchant ? (
            <>
              <TextInput
                style={styles.input}
                onChangeText={(text) => setEmail(text)}
                value={email ?? ''}
                placeholder="email"
              />

              <TextInput
                style={styles.input}
                onChangeText={(text) => setProfileNo(text)}
                value={profileNo ?? ''}
                placeholder="profileNo"
              />
            </>
          ) : null}
        </View>

        <Button title="Press to Pay" onPress={onPressPay} />
      </ScrollView>

      <ReactNativePaylink
        ref={sheetRef}
        language="ar"
        scheme="light"
        order={order}
        token={token ?? ''}
        onSuccess={async (orderNumber, transactionNo) => {
          console.log('SUCCESS PAYMENT: ', orderNumber, transactionNo);
          if (!transactionNo || !token) return;
          await fetchPayment({ transactionNo, env: order.env }, token);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
  input: {
    height: 44,
    margin: 12,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 20,
  },
  inputCont: { width: '100%' },
  switch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
  },
});
