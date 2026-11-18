import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii } from "../../src/theme";
import { SEMESTER_1_SUBJECTS } from "../../src/data/subjects";
import { API_BASE_URL } from "../../src/api";

export default function SubjectsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = SEMESTER_1_SUBJECTS.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>CURRICULUM EXPLORER</Text>
        <Text style={styles.title}>Semester 1 subjects</Text>
        <Text style={styles.subtitle}>
          All 6 B.Tech CSE AI/ML subjects with 30 modules, 93 LaTeX notes, and 17 interactive simulators.
        </Text>

        {/* Search Input */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color={colors.muted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by subject name or code (e.g. CSE1001)…"
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={16} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map((sub) => (
          <View key={sub.code} style={styles.card}>
            <View style={styles.topRow}>
              <Text style={styles.code}>{sub.code}</Text>
              <View style={styles.badgeRow}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{sub.badge}</Text>
                </View>
                <View style={styles.creditBadge}>
                  <Text style={styles.creditBadgeText}>
                    {sub.credits} credits
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.cardTitle}>{sub.title}</Text>
            <Text style={styles.cardDesc}>{sub.description}</Text>

            <View style={styles.statsStrip}>
              <Text style={styles.statsText}>
                {sub.moduleCount} modules • {sub.topicCount} topic notes •{" "}
                {sub.simulators.length} simulators
              </Text>
            </View>

            <View style={styles.footerRow}>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => router.push(`/subject/${sub.slug}`)}
              >
                <Text style={styles.primaryBtnText}>View syllabus & topics</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() =>
                  router.push({
                    pathname: "/webview",
                    params: {
                      url: `${API_BASE_URL}/prepmeup/subjects/${sub.slug}`,
                      title: sub.shortTitle,
                    },
                  })
                }
              >
                <Text style={styles.secondaryBtnText}>LaTeX reader →</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  searchBar: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bg,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.ink,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 36,
  },
  card: {
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
  code: {
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: "700",
    color: colors.muted,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badge: {
    backgroundColor: colors.surface2,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: "600",
    color: colors.muted,
  },
  creditBadge: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  creditBadgeText: {
    fontSize: 10.5,
    fontWeight: "600",
    color: colors.accent,
  },
  cardTitle: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: "700",
    color: colors.ink,
  },
  cardDesc: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: colors.muted,
  },
  statsStrip: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
  },
  statsText: {
    fontSize: 12,
    color: colors.muted,
  },
  footerRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 10,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: colors.accent,
    paddingVertical: 10,
    borderRadius: radii.md,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  secondaryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "600",
  },
});
