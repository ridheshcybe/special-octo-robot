import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";
import { colors } from "../src/theme";
import { API_BASE_URL } from "../src/api";

export default function WebViewScreen() {
  const { url, title } = useLocalSearchParams<{
    url?: string;
    title?: string;
  }>();
  const [loading, setLoading] = useState(true);

  const targetUrl = url || `${API_BASE_URL}/prepmeup`;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: title || "PrepMeUp AI",
        }}
      />
      <WebView
        source={{ uri: targetUrl }}
        style={styles.webview}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        startInLoadingState
      />
      {loading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  webview: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  loaderOverlay: {
    position: "absolute",
    top: 12,
    right: 16,
  },
});
