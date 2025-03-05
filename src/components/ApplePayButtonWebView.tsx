import { useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { AddInvoiceProps } from '../ts/types';

interface ApplePayButtonWebViewProps {
  token: string;
  order: AddInvoiceProps;
  onLoaded: (isLoaded: boolean) => void;
  height?: number;
  width?: number;
  language?: 'ar' | 'en';
  onSuccess: (orderNumber: string, transactionNo?: string) => void;
}

const ApplePayButtonWebView = ({
  token,
  order,
  onLoaded,
  height = 46,
  width = 200,
  language = 'en',
  onSuccess,
}: ApplePayButtonWebViewProps) => {
  const webViewRef = useRef<WebView>(null);

  // Injected HTML to load the Apple Pay button
  const injectedHTML = useMemo(
    () => `
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://paylink.sa/assets/js/paylink.js"></script>
    </head>
		<script>
		try {
			let payment = new PaylinkPayments({ mode: '${order.env}', defaultLang: '${language}', backgroundColor: '#FFF' });
      
			window.addEventListener('load', (event) => {
				payment.openApplePay('${token}', ${JSON.stringify(order)}, (e) => {
					alert('Apple Pay Loaded: ', e);
				});
		});
		} catch (error) {
		 		console.log('ERR @ Apple Pay: ', error.message);
		}
		</script>
    <body>
    </body>
    </html>
  `,
    [order, language, token]
  );

  // This script waits for the button to load and modifies it
  const injectedJS = `
    function waitForButton() {
      const button = document.querySelector('.btn');
      if (button) {
        button.className = 'btn btn-light';
        button.style.width = '${width}px';
				button.style.height = '${height}px';

        const innerDiv = button.querySelector('div');
        if (innerDiv) {
          innerDiv.className = '';
        }

        document.body.innerHTML = '';
        document.body.appendChild(button);
      } else {
        setTimeout(waitForButton, 500);
      }
    }

    waitForButton();
    true;
  `;

  const onLoadEnd = () => {
    webViewRef.current?.injectJavaScript(injectedJS);
  };

  if (!token || !order) {
    return null;
  }

  return (
    <View
      style={{
        height,
        width,
        borderRadius: 5,
      }}
    >
      <WebView
        ref={webViewRef}
        style={styles.webview}
        originWhitelist={['*']}
        source={{ html: injectedHTML }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scalesPageToFit={false}
        scrollEnabled={false}
        // enableApplePay
        onNavigationStateChange={(e) => {
          // console.log(e.url);
          if (
            e.url?.includes('paymentpilot.paylink') ||
            e.url?.includes('payment.paylink')
          ) {
            setTimeout(() => {
              onLoaded(true);
            }, 1500);
          } else {
            const url = new URL(e.url);
            const params = new URLSearchParams(url.search);
            const orderNumber = params.get('orderNumber');
            const transactionNo = params.get('transactionNo');

            if (orderNumber && transactionNo) {
              onSuccess(orderNumber, transactionNo);
            } else {
              onLoaded(false);
            }
          }
        }}
        onLoadEnd={onLoadEnd}
        onError={(e) => {
          console.log('ERR @ onError:: ', e);
        }}
        onHttpError={(e) => {
          console.log('ERR @ onHttpError:: ', e);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  webview: {
    borderRadius: 5,
  },
});

export default ApplePayButtonWebView;
