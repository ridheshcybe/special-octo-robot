import React, { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";
import { colors, radii } from "../src/theme";
import { API_BASE_URL } from "../src/api";

export default function WebViewScreen() {
  const { url, title } = useLocalSearchParams<{
    url?: string;
    title?: string;
  }>();
  const [loading, setLoading] = useState(true);

  const targetUrl = url || `${API_BASE_URL}/prepmeup`;

  // Universal Web support: render an iframe + direct open button when running on React Native Web
  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            title: title || "PrepMeUp AI Workbench",
          }}
        />
        <View style={styles.webToolbar}>
          <Text style={styles.webUrlText} numberOfLines={1}>
            {targetUrl}
          </Text>
          <TouchableOpacity
            style={styles.openExternalBtn}
            onPress={() => Linking.openURL(targetUrl)}
          >
            <Text style={styles.openExternalText}>Open in full tab ↗</Text>
          </TouchableOpacity>
        </View>
        {React.createElement("iframe", {
          src: targetUrl,
          title: title || "PrepMeUp AI Workbench",
          style: {
            flex: 1,
            width: "100%",
            height: "100%",
            border: "none",
            backgroundColor: colors.bg,
          },
        })}
      </View>
    );
  }

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
  webToolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    gap: 12,
  },
  webUrlText: {
    flex: 1,
    fontFamily: "monospace",
    fontSize: 12,
    color: colors.muted,
  },
  openExternalBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.md,
  },
  openExternalText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
});
