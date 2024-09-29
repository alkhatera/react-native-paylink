import { Text, View } from 'react-native';

export interface ReactNativePaylinkProps {}

export default function ReactNativePaylink({}: ReactNativePaylinkProps) {
  return (
    <View>
      <Text>ReactNativePaylink</Text>
    </View>
  );
}
/*

import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, View, ScrollView, useWindowDimensions, Image, Button as RNButton } from 'react-native';
import Video, { VideoRef } from 'react-native-video';
import Authentication from '../../components/Bottom Sheets/auth/Authentication';
import { error, textPrimary, white } from '../../constants/Colors';
import { useDictionary } from '../../hooks/useDictionary';
import BottomSheet, { BottomSheetMethods } from '@devvie/bottom-sheet';
import { ApplePayButton, PaymentSummaryItem, startPaymentAsync } from 'expo-apple-pay-button';
import STCPayLogo from '../../assets/Icons/stcpay';
import { CreditCardInput, LiteCreditCardInput } from 'react-native-credit-card-input';
import AwesomeButton, { ThemedButton } from 'react-native-really-awesome-button';
import { AlertCircleIcon, ArrowLeft } from 'lucide-react-native';
import PhoneInput, { ICountry, IPhoneInputRef } from 'react-native-international-phone-number';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isEmpty, isValidPhoneNumber, toEnglishNumber } from '../../ts/utils';
import Otp from '../../components/Bottom Sheets/auth/Otp';
import moment from 'moment';
import OTPInputView from '@twotalltotems/react-native-otp-input';

	const { width: tab_size } = useWindowDimensions();
	const { top } = useSafeAreaInsets();
	const sheetRef = useRef<BottomSheetMethods>(null);
	const scroll = useRef<ScrollView>(null);
	const language = 'ar';
	const [formType, setFormType] = useState<'stcpay' | 'creditcard' | null>(null);
	const [due, setDue] = useState(moment().add(90, 'seconds').toDate());
	const [code, setCode] = useState('');
	const [showError, setShowError] = useState<undefined | string>();
	const [isLoading, setIsLoading] = useState(false);
	const [transactionNo, setTransactionNo] = useState('');
	const [stcPayObj, setStcPayObj] = useState({
		paymentSessionId: '',
		signature: '',
		signedBase64Data: '',
	});
	const [card, setCard] = useState({
		valid: false,
		expiry: {
			month: '',
			year: '',
		},
		number: '',
		securityCode: '',
	});

	const handleScroll = useCallback(
		(_tab: number) => {
			scroll.current?.scrollTo({ x: _tab * tab_size });
		},
		[tab_size]
	);

	const phoneInputRef = useRef<IPhoneInputRef>(null);

<BottomSheet ref={sheetRef} animationType="spring" height="80%">
				<ScrollView
					ref={scroll}
					showsHorizontalScrollIndicator={false}
					horizontal={true}
					scrollEnabled={false}
					snapToInterval={tab_size}
					scrollEventThrottle={8}
					decelerationRate="fast"
				>
					// {/* TAB ONE 
					<View style={{ width: tab_size, paddingHorizontal: 20 }}>
						<ScrollView contentContainerStyle={{ height: '100%' }}>
							<Text style={{ textAlign: 'left' }}>{language === 'ar' ? 'اختر طريقة الدفع' : 'Choose payment method'}</Text>

							<View style={{ height: 10 }} />
							<ApplePayButton
								buttonStyle="black"
								buttonLabel="plain"
								style={{
									height: 45,
									width: '100%',
								}}
								onPress={async () => {
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
											merchantName: 'Sahab', // this is the name that will appear on the payment sheet
											merchantId: 'merchant.com.sahab', // this is the merchant id you have to create on the apple developer portal
											items,
										});

										if (!payment) {
											Alert.alert('Payment Failed');
										}
									} catch (error) {
										Alert.alert('Payment Failed', error.message);
									}
								}}
							/>

							<View style={{ height: 10 }} />

							<AwesomeButton
								onPress={() => {
									setFormType('stcpay');
									handleScroll(1);
								}}
								height={45}
								width="100%"
								backgroundColor="#4f008c"
							>
								<STCPayLogo />
							</AwesomeButton>

							<View style={{ height: 15 }} />

							<AwesomeButton
								// name="bruce"
								// type="secondary"
								onPress={() => {
									setFormType('creditcard');
									handleScroll(1);
								}}
								height={45}
								width="100%"
								backgroundColor="#FFF"
							>
								<Image source={require('../../assets/img/alaamada.png')} resizeMode="contain" style={{ width: 80, height: 80 }} />
								<Image source={require('../../assets/img/alaavisa.png')} resizeMode="contain" style={{ width: 40, height: 40 }} />
								<Image source={require('../../assets/img/alaamastercard.png')} resizeMode="contain" style={{ width: 50, height: 50 }} />
								<Image source={require('../../assets/img/alaaamex.png')} resizeMode="contain" style={{ width: 45, height: 45 }} />
							</AwesomeButton>
						</ScrollView>
					</View>

					{/* TAB TWO *
					<View style={{ width: tab_size, paddingHorizontal: 20 }}>
						<AwesomeButton
							onPress={() => {
								handleScroll(0);
							}}
							height={50}
							width={50}
							borderRadius={50 / 2}
							backgroundColor={formType === 'stcpay' ? '#4f008c' : '#FFF'}
						>
							<ArrowLeft size={24} color={formType === 'stcpay' ? '#FFF' : '#000'} />
						</AwesomeButton>

						<View style={{ height: 15 }} />

						{formType === 'stcpay' ? (
							<>
								<PhoneInput
									ref={phoneInputRef}
									placeholder={language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
									modalSearchInputPlaceholder={language === 'ar' ? 'بحث...' : 'Search...'}
									modalNotFoundCountryMessage={language === 'ar' ? 'لم يتم العثور على البلد' : 'Country not found'}
									language={language}
									defaultCountry="SA"
									popularCountries={['BH', 'SA']}
									modalHeight="100%"
									phoneInputStyles={{
										container: {
											backgroundColor: '#fff',
											borderStyle: 'solid',
											borderColor: '#a3a4a4',
											borderBottomWidth: 1,
											borderTopWidth: 0,
											borderRightWidth: 0,
											borderLeftWidth: 0,
										},
										flagContainer: {
											borderTopLeftRadius: 7,
											borderBottomLeftRadius: 7,
											backgroundColor: '#fff',
											justifyContent: 'center',
										},
										divider: {
											backgroundColor: '#F3F3F3',
										},
										callingCode: {
											color: textPrimary,
										},
										input: {
											color: textPrimary,
										},
									}}
									modalStyles={{
										modal: {
											paddingTop: top,
											backgroundColor: '#f3f3f3',
										},
										searchInput: {
											borderRadius: 8,
											borderWidth: 0,
											color: textPrimary,
											backgroundColor: '#fff',
											paddingHorizontal: 12,
											height: 46,
										},
										countryButton: {
											borderWidth: 0,
											backgroundColor: '#fff',
											marginVertical: 4,
											paddingVertical: 0,
										},
										callingCode: {
											color: textPrimary,
										},
										countryName: {
											color: textPrimary,
										},
									}}
								/>

								<View style={{ height: 15 }} />

								{showError ? (
									<HStack alignItems="center" space="xs" gap={5}>
										<AlertCircleIcon color={error} />
										<Text color={error}>{showError}</Text>
									</HStack>
								) : null}

								<View style={{ height: 15 }} />

								<AwesomeButton
									progress={isLoading}
									onPress={async () => {
										const isPhoneNumberValid = isEmpty(phoneInputRef.current?.fullPhoneNumber)
											? false
											: isValidPhoneNumber(phoneInputRef.current?.selectedCountry?.callingCode ?? '+966', phoneInputRef.current?.value || '');

										if (!isPhoneNumberValid) {
											return setShowError(language === 'ar' ? 'الرجاء تقديم رقم هاتف صالح' : 'Please provide a valid phone number');
										} else {
											setShowError(undefined);
										}

										setIsLoading(true);
										const stcpayMobileCountryCode = phoneInputRef.current?.selectedCountry?.callingCode?.startsWith('+')
											? phoneInputRef.current?.selectedCountry?.callingCode?.split('+')[1]
											: phoneInputRef.current?.selectedCountry?.callingCode;
										const stcpayMobile = removeWhitespace(phoneInputRef.current?.value || '');

										try {
											const requestBody = {
												apiId: PAYLINK_KEYS['test'].apiId,
												secretKey: PAYLINK_KEYS['test'].secretKey,
												persistToken: false,
											};

											const jsonResponse1 = await fetch(`${PAYLINK_KEYS['test'].PAYLINK_URL}/api/auth`, {
												method: 'post',
												headers: {
													'content-type': 'application/json',
												},
												body: JSON.stringify(requestBody),
											});

											const { id_token } = await jsonResponse1.json();

											console.log('authToken:: ', id_token);

											const requestBody2 = {
												amount: 10,
												callBackUrl: `https://${PAYLINK_KEYS['test'].APP_ENV}.lazywait.com/menu?storeUrl`,
												clientEmail: 'payment@lazywait.com',
												clientMobile: `+${stcpayMobileCountryCode}${stcpayMobile}`,
												currency: 'SAR',
												clientName: `${'Hungry'} ${'Customer'}`,
												note: `Order from LazyWait App`,
												orderNumber: '1234',
												products: [],
											};

											const jsonResponse = await fetch(`${PAYLINK_KEYS['test'].PAYLINK_URL}/api/addInvoice`, {
												method: 'post',
												headers: {
													'Content-Type': 'application/json',
													Authorization: 'Bearer ' + id_token,
												},
												body: JSON.stringify(requestBody2),
											});

											const addInvoiceResponse = await jsonResponse.json();

											if (addInvoiceResponse.status === '406' || addInvoiceResponse.detail?.includes('غير مفعل')) {
												setShowError(language === 'ar' ? 'الحساب غير مفعل' : 'Account is not activated');
												return;
											}

											setTransactionNo(addInvoiceResponse.transactionNo);
											console.log('addInvoiceResponse:: ', addInvoiceResponse.transactionNo);

											// /rest/pay/stcpay/sendOtp
											const requestBody3 = {
												stcpayMobileCountryCode,
												stcpayMobile,
												orderNumber: addInvoiceResponse.transactionNo,
												total: 10,
											};
											const jsonResponse3 = await fetch(`${PAYLINK_KEYS['test'].ORDER_URL}/rest/pay/stcpay/sendOtp`, {
												method: 'post',
												headers: {
													'content-type': 'application/json',
												},
												body: JSON.stringify(requestBody3),
											});

											const stcPayResponse = await jsonResponse3.json();
											console.log('stcPayResponse:: ', stcPayResponse);

											setStcPayObj({
												paymentSessionId: stcPayResponse.paymentSessionId,
												signature: stcPayResponse.signature,
												signedBase64Data: stcPayResponse.signedBase64Data,
											});

											handleScroll(2);
										} catch (error) {
											console.log('ERR @ sendSMS -> AuthenticationContent:: ', error);
											setShowError(language === 'ar' ? 'الرجاء تقديم رقم هاتف صالح' : 'Please provide a valid phone number');
										} finally {
											setIsLoading(false);
										}
									}}
									height={45}
									width="100%"
									backgroundColor="#4f008c"
								>
									{language === 'ar' ? 'ارسل الرمز القصير' : 'Send STC Pay OTP'}
								</AwesomeButton>
							</>
						) : (
							<>
								<CreditCardInput
									inputStyle={{ backgroundColor: '#fff', borderWidth: 0, padding: 5, margin: 0, borderRadius: 5 }}
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
									onChange={(form) => {
										setCard({
											valid: form.valid,
											expiry: {
												month: form.values?.expiry?.split('/')?.[0] || '',
												year: form.values?.expiry?.split('/')?.[1] || '',
											},
											number: removeWhitespace(form.values?.number || ''),
											securityCode: form.values?.cvc || '',
										});
									}}
								/>

								{showError ? (
									<HStack alignItems="center" space="xs" gap={5}>
										<AlertCircleIcon color={error} />
										<Text color={error}>{showError}</Text>
									</HStack>
								) : null}

								<View style={{ height: 15 }} />

								<AwesomeButton
									onPress={async () => {
										if (!card.valid) {
											setShowError(language === 'ar' ? 'الرجاء تقديم بيانات بطاقة صالحة' : 'Please provide a valid card data');
											return;
										}

										setIsLoading(true);
										const stcpayMobileCountryCode = phoneInputRef.current?.selectedCountry?.callingCode?.startsWith('+')
											? phoneInputRef.current?.selectedCountry?.callingCode?.split('+')[1]
											: phoneInputRef.current?.selectedCountry?.callingCode;
										const stcpayMobile = removeWhitespace(phoneInputRef.current?.value || '');
										try {
											const requestBody = {
												apiId: PAYLINK_KEYS['test'].apiId,
												secretKey: PAYLINK_KEYS['test'].secretKey,
												persistToken: false,
											};

											const jsonResponse1 = await fetch(`${PAYLINK_KEYS['test'].PAYLINK_URL}/api/auth`, {
												method: 'post',
												headers: {
													'content-type': 'application/json',
												},
												body: JSON.stringify(requestBody),
											});

											const { id_token } = await jsonResponse1.json();

											console.log('authToken:: ', id_token);

											const requestBody2 = {
												amount: 10,
												callBackUrl: `https://${PAYLINK_KEYS['test'].APP_ENV}.lazywait.com/menu?storeUrl`,
												clientEmail: 'payment@lazywait.com',
												clientMobile: `+${stcpayMobileCountryCode}${stcpayMobile}`,
												currency: 'SAR',
												clientName: `${'Hungry'} ${'Customer'}`,
												note: `Order from LazyWait App`,
												orderNumber: '12334',
												products: [],
												card,
											};

											const jsonResponse = await fetch(`${PAYLINK_KEYS['test'].PAYLINK_URL}/api/payInvoice`, {
												method: 'post',
												headers: {
													'Content-Type': 'application/json',
													Authorization: 'Bearer ' + id_token,
												},
												body: JSON.stringify(requestBody2),
											});

											const payInvoiceResponse = await jsonResponse.json();

											if (payInvoiceResponse.status === '406' || payInvoiceResponse.detail?.includes('غير مفعل')) {
												setShowError(language === 'ar' ? 'الحساب غير مفعل' : 'Account is not activated');
												return;
											}

											console.log(payInvoiceResponse);
										} catch (error) {
											console.log('ERR @ sendSMS -> AuthenticationContent:: ', error);
											setShowError(language === 'ar' ? 'الرجاء تقديم رقم هاتف صالح' : 'Please provide a valid phone number');
										} finally {
											setIsLoading(false);
										}
									}}
									height={45}
									width="100%"
									backgroundColor="#fff"
									textColor={textPrimary}
								>
									{language === 'ar' ? 'إرسال' : 'Send'}
								</AwesomeButton>
							</>
						)}
					</View>

					{/* TAB THREE *
					<View style={{ width: tab_size, paddingHorizontal: 20 }}>
						<AwesomeButton
							onPress={() => {
								handleScroll(1);
							}}
							height={50}
							width={50}
							borderRadius={50 / 2}
							backgroundColor={'#4f008c'}
						>
							<ArrowLeft size={24} color={'#FFF'} />
						</AwesomeButton>

						<View style={{ height: 15 }} />

						<OTPInputView
							style={{ width: '100%', height: 50 }}
							pinCount={6}
							code={code || ''}
							onCodeChanged={(_code: string) => setCode(toEnglishNumber(_code))}
							codeInputFieldStyle={{
								width: 50,
								height: 45,
								borderWidth: 0,
								borderBottomWidth: 1,
								fontSize: 18,
								color: textPrimary,
								borderColor: textPrimary,
								backgroundColor: '#fff',
								borderRadius: 5,
							}}
							codeInputHighlightStyle={
								{
									// borderColor: primary,
									// color: primary,
								}
							}
							// selectionColor={primary}
							onCodeFilled={async (_code) => {
								console.log(toEnglishNumber(_code));

								const stcpayMobileCountryCode = phoneInputRef.current?.selectedCountry?.callingCode?.startsWith('+')
									? phoneInputRef.current?.selectedCountry?.callingCode?.split('+')[1]
									: phoneInputRef.current?.selectedCountry?.callingCode;
								const stcpayMobile = removeWhitespace(phoneInputRef.current?.value || '');

								if (!stcPayObj.paymentSessionId || !stcPayObj.signature || !stcPayObj.signedBase64Data) {
									setShowError(language === 'ar' ? 'الرجاء تقديم رقم هاتف صالح' : 'Please provide a valid phone number');
									return;
								}

								setIsLoading(true);
								const requestBody = {
									stcpayMobileCountryCode,
									stcpayMobile,
									orderNumber: transactionNo,
									total: 10,
									stcpayPaymentOTP: toEnglishNumber(_code),
									paymentSessionId: stcPayObj.paymentSessionId,
									signature: stcPayObj.signature,
									signedBase64Data: stcPayObj.signedBase64Data,
								};

								const jsonResponse = await fetch(`${PAYLINK_KEYS['test'].ORDER_URL}/rest/pay/stcpay/processPayment`, {
									method: 'post',
									headers: {
										'content-type': 'application/json',
									},
									body: JSON.stringify(requestBody),
								});

								const stcPayResponse = await jsonResponse.json();

								console.log('stcPayResponse:: ', stcPayResponse);

								if (stcPayResponse.statusCode === 200) {
									// TODO: SUCCESS OPERATION
								}
							}}
							autoFocusOnLoad={false}
						/>

						{showError ? (
							<HStack alignItems="center" space="xs" gap={5}>
								<AlertCircleIcon color={error} />
								<Text color={error}>{showError}</Text>
							</HStack>
						) : null}
					</View>
				</ScrollView>
			</BottomSheet>
      */
