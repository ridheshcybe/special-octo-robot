import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, radii } from "../../src/theme";
import { LEARNING_TRACKS } from "../../src/data/subjects";
import { API_BASE_URL } from "../../src/api";

export default function TracksScreen() {
  const router = useRouter();

  const openWebPath = (path: string, title: string) => {
    router.push({
      pathname: "/webview",
      params: { url: `${API_BASE_URL}${path}`, title },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>MULTI-TRACK CATALOG</Text>
        <Text style={styles.title}>Learning tracks & passes</Text>
        <Text style={styles.subtitle}>
          Semester 1 B.Tech CSE AI/ML is live and free. CyberSecurity and Cloud Computing (AWS) are currently under construction.
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Learning Tracks */}
        <Text style={styles.sectionTitle}>Learning tracks</Text>

        {LEARNING_TRACKS.map((track) => {
          const isLive = track.status === "live";
          return (
            <View
              key={track.slug}
              style={[
                styles.trackCard,
                isLive && { borderColor: colors.accent, borderWidth: 1.5 },
              ]}
            >
              <View style={styles.topRow}>
                <View
                  style={[
                    styles.statusBadge,
                    isLive ? styles.liveBadge : styles.comingBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      isLive ? styles.liveBadgeText : styles.comingBadgeText,
                    ]}
                  >
                    {track.badge}
                  </Text>
                </View>
                <Text style={styles.courseCountText}>
                  {track.courseCount}{" "}
                  {track.courseCount === 1 ? "course" : "subjects"}
                </Text>
              </View>

              <Text style={styles.trackTitle}>{track.title}</Text>
              <Text style={styles.trackDesc}>{track.description}</Text>

              <View style={styles.highlightBox}>
                <Text style={styles.highlightText}>{track.highlight}</Text>
              </View>

              {isLive ? (
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => router.push("/(tabs)/subjects")}
                >
                  <Text style={styles.primaryBtnText}>
                    Explore Semester 1 subjects →
                  </Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.disabledBtn}>
                  <Text style={styles.disabledBtnText}>
                    Under construction • Coming soon
                  </Text>
                </View>
              )}
            </View>
          );
        })}

        {/* Semester Mentorship & AI Tiers */}
        <Text style={[styles.sectionTitle, { marginTop: 14 }]}>
          Optional AI & 1:1 mentorship upgrades
        </Text>

        <View style={styles.tierCard}>
          <View style={styles.topRow}>
            <Text style={styles.tierLabel}>Tier 2: AI + Career Pass</Text>
            <View style={styles.liveBadge}>
              <Text style={styles.liveBadgeText}>Popular</Text>
            </View>
          </View>
          <Text style={styles.priceText}>
            ₹199 <Text style={styles.priceSub}>/ semester</Text>
          </Text>
          <Text style={styles.trackDesc}>
            Unlimited 24/7 AI doubt copilot, Python lab debugger, 1 included 1:1 live video mentorship session, and resume/GitHub portfolio review.
          </Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() =>
              openWebPath("/prepmeup/checkout?tier=tier2", "Tier 2 Upgrade")
            }
          >
            <Text style={styles.primaryBtnText}>Upgrade to Tier 2 (₹199)</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tierCard}>
          <View style={styles.topRow}>
            <Text style={styles.tierLabel}>Tier 3: 1:1 VIP Mentorship</Text>
            <View style={styles.comingBadge}>
              <Text style={styles.comingBadgeText}>Mentorship</Text>
            </View>
          </View>
          <Text style={styles.priceText}>
            ₹499 <Text style={styles.priceSub}>/ semester</Text>
          </Text>
          <Text style={styles.trackDesc}>
            Unlimited 1:1 Google Meet video mentorship sessions with priority calendar booking across Maths, BEE, Python, and COA.
          </Text>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() =>
              openWebPath("/prepmeup/checkout?tier=tier3", "Tier 3 VIP Pass")
            }
          >
            <Text style={styles.secondaryBtnText}>Select Tier 3 (₹499)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  eyebrow: {
    fontSize: 10.5,
    fontWeight: "600",
    letterSpacing: 0.7,
    color: colors.muted,
  },
  title: {
    marginTop: 2,
    fontSize: 22,
    fontWeight: "700",
    color: colors.ink,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 18,
    paddingBottom: 36,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink,
    marginBottom: 10,
  },
  trackCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 18,
    marginBottom: 14,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  liveBadge: {
    backgroundColor: colors.accentSoft,
  },
  comingBadge: {
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: "600",
  },
  liveBadgeText: {
    color: colors.accent,
    fontSize: 10.5,
    fontWeight: "600",
  },
  comingBadgeText: {
    color: colors.muted,
    fontSize: 10.5,
    fontWeight: "600",
  },
  courseCountText: {
    fontFamily: "monospace",
    fontSize: 11.5,
    color: colors.muted,
  },
  trackTitle: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: "700",
    color: colors.ink,
  },
  trackDesc: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: colors.muted,
  },
  highlightBox: {
    marginTop: 12,
    padding: 10,
    backgroundColor: colors.surface2,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  highlightText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.ink,
  },
  primaryBtn: {
    marginTop: 14,
    backgroundColor: colors.accent,
    paddingVertical: 11,
    borderRadius: radii.md,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  secondaryBtn: {
    marginTop: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingVertical: 11,
    borderRadius: radii.md,
    alignItems: "center",
  },
  secondaryBtnText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "600",
  },
  disabledBtn: {
    marginTop: 14,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingVertical: 11,
    borderRadius: radii.md,
    alignItems: "center",
  },
  disabledBtnText: {
    color: colors.muted,
    fontSize: 12.5,
    fontWeight: "600",
  },
  tierCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 18,
    marginBottom: 14,
  },
  tierLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
  },
  priceText: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: "700",
    color: colors.ink,
  },
  priceSub: {
    fontSize: 13,
    fontWeight: "400",
    color: colors.muted,
  },
});
