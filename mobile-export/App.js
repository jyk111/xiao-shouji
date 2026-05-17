import React from 'react';
import { ActivityIndicator, Linking, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';
import { WEB_HTML } from './web-content';

const MOBILE_PATCH = `
(function () {
  window.__SMALL_PHONE_NATIVE__ = true;
  function applyPatch() {
    var style = document.createElement('style');
    style.textContent = [
      'html,body,#root{margin:0!important;width:100%!important;height:100%!important;min-height:100%!important;overflow:hidden!important;background:#101010!important;}',
      '.phone-stage{width:100vw!important;height:var(--app-vvh,100dvh)!important;min-height:var(--app-vvh,100dvh)!important;padding:0!important;align-items:center!important;justify-content:center!important;background:#101010!important;}',
      '.phone-shell{width:100vw!important;max-width:100vw!important;height:var(--app-vvh,100dvh)!important;max-height:var(--app-vvh,100dvh)!important;border-width:0!important;border-radius:0!important;}',
      '.phone-shell,.phone-shell *{-ms-overflow-style:none!important;scrollbar-width:none!important;}',
      '.phone-shell::-webkit-scrollbar,.phone-shell *::-webkit-scrollbar{display:none!important;width:0!important;height:0!important;}',
      '.circle-button,.save-button,.fetch-button,.hand-input,button,input,textarea,select{-webkit-tap-highlight-color:transparent;}'
    ].join('\\n');
    document.head.appendChild(style);
    setTimeout(function () {
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage('small-phone-ready');
    }, 250);
  }
  if (document.head) applyPatch();
  else document.addEventListener('DOMContentLoaded', applyPatch);
})();
true;
`;

export default function App() {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState('');
  const webViewRef = React.useRef(null);

  const sendDiscordCallbackToWeb = React.useCallback((url) => {
    const payload = JSON.stringify(String(url || ''));
    webViewRef.current?.injectJavaScript(`
      window.dispatchEvent(new CustomEvent('small-phone-discord-callback', { detail: ${payload} }));
      true;
    `);
  }, []);

  const openExternalUrl = React.useCallback((url) => {
    if (!url || typeof url !== 'string') return;
    Linking.openURL(url).catch((reason) => {
      const message = reason?.message || '无法打开外部链接';
      setError(message);
    });
  }, []);

  React.useEffect(() => {
    const subscription = Linking.addEventListener('url', (event) => {
      if (event.url?.startsWith('smallphone://discord-callback')) {
        sendDiscordCallbackToWeb(event.url);
      }
    });
    Linking.getInitialURL().then((url) => {
      if (url?.startsWith('smallphone://discord-callback')) {
        sendDiscordCallbackToWeb(url);
      }
    });
    return () => subscription.remove();
  }, [sendDiscordCallbackToWeb]);

  const handleShouldStartLoad = React.useCallback((request) => {
    const url = request?.url || '';
    if (url.startsWith('smallphone://discord-callback')) {
      sendDiscordCallbackToWeb(url);
      return false;
    }
    return true;
  }, [sendDiscordCallbackToWeb]);

  const handleMessage = React.useCallback((event) => {
    setLoaded(true);
    const data = event?.nativeEvent?.data;
    if (!data || data === 'small-phone-ready') return;
    try {
      const message = JSON.parse(data);
      if (message?.type === 'open-url' && typeof message.url === 'string') {
        openExternalUrl(message.url);
      }
    } catch {
      // Ignore non-JSON messages from the WebView.
    }
  }, [openExternalUrl]);

  return (
    <View style={styles.root}>
      <StatusBar style="light" backgroundColor="#101010" />
      <SafeAreaView style={styles.safe}>
        <WebView
          ref={webViewRef}
          source={{ html: WEB_HTML, baseUrl: 'https://small-phone.local/' }}
          style={styles.webview}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          allowFileAccess
          allowUniversalAccessFromFileURLs
          mixedContentMode="always"
          thirdPartyCookiesEnabled
          mediaPlaybackRequiresUserAction={false}
          setSupportMultipleWindows={false}
          bounces={false}
          injectedJavaScriptBeforeContentLoaded={MOBILE_PATCH}
          injectedJavaScript={MOBILE_PATCH}
          onShouldStartLoadWithRequest={handleShouldStartLoad}
          onLoadEnd={() => setLoaded(true)}
          onMessage={handleMessage}
          onError={(event) => {
            setLoaded(true);
            setError(event.nativeEvent.description || 'WebView 加载失败');
          }}
        />
        {!loaded && (
          <View style={styles.overlay}>
            <ActivityIndicator color="#dceecd" size="large" />
            <Text style={styles.overlayText}>正在打开小手机...</Text>
          </View>
        )}
        {error ? (
          <View style={styles.overlay}>
            <Text style={styles.errorTitle}>小手机加载失败</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#101010',
  },
  safe: {
    flex: 1,
    backgroundColor: '#101010',
  },
  webview: {
    flex: 1,
    backgroundColor: '#101010',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#101010',
    padding: 24,
  },
  overlayText: {
    marginTop: 14,
    color: '#dceecd',
    fontSize: 16,
    fontWeight: '700',
  },
  errorTitle: {
    color: '#ffd6d6',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 10,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
