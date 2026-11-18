import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii } from "../../src/theme";
import { SEMESTER_1_SUBJECTS } from "../../src/data/subjects";
import {
  API_BASE_URL,
  DailyCapsuleNote,
  fetchDailyCapsule,
  getSavedSession,
  MobileUserSession,
} from "../../src/api";

export default function HomeScreen() {
  const router = useRouter();
  const [session, setSession] = useState<MobileUserSession | null>(null);
  const [dailyNote, setDailyNote] = useState<DailyCapsuleNote | null>(null);

  useEffect(() => {
    getSavedSession().then(setSession);
    fetchDailyCapsule().then(setDailyNote);
  }, []);

  const openWebPath = (path: string, title: string) => {
    router.push({
      pathname: "/webview",
      params: { url: `${API_BASE_URL}${path}`, title },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Top Brand Bar */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>P</Text>
          </View>
          <Text style={styles.brandTitle}>
            PrepMeUp <Text style={{ color: colors.accent }}>AI</Text>
          </Text>
        </View>
        <TouchableOpacity
          style={styles.pillBadge}
          onPress={() => router.push("/(tabs)/profile")}
        >
          <View style={styles.statusDot} />
          <Text style={styles.pillBadgeText}>
            {session ? session.fullName || "Student" : "Sem 1 Free"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Welcome Card */}
        <View style={styles.heroCard}>
          <View style={styles.eyebrowPill}>
            <Text style={styles.eyebrowPillText}>
              B.Tech CSE AI/ML • Semester 1 is Free
            </Text>
          </View>
          <Text style={styles.heroTitle}>
            Welcome{session?.fullName ? `, ${session.fullName}` : " to PrepMeUp AI"}
          </Text>
          <Text style={styles.heroSubtitle}>
            LaTeX-typeset study notes across 6 core engineering subjects, 17 interactive simulations, Python coding lab, and 24/7 AI doubt solving.
          </Text>

          {/* Metrics Strip */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>6</Text>
              <Text style={styles.metricLabel}>Subjects</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>30</Text>
              <Text style={styles.metricLabel}>Modules</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>93</Text>
              <Text style={styles.metricLabel}>LaTeX Notes</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>17</Text>
              <Text style={styles.metricLabel}>Simulators</Text>
            </View>
          </View>
        </View>

        {/* Continue Where You Left Off */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Continue where you left off</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.metaLabel}>CSE1001 • SEMESTER 1 CORE</Text>
          <Text style={styles.cardTitle}>Applied Computational Mathematics</Text>
          <Text style={styles.cardDesc}>
            Resume your LaTeX derivations, rank & echelon matrices, and multivariable calculus practice.
          </Text>
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() =>
                router.push("/subject/applied-computational-mathematics")
              }
            >
              <Text style={styles.primaryBtnText}>Open subject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() =>
                openWebPath(
                  "/prepmeup/subjects/applied-computational-mathematics",
                  "Applied Computational Mathematics"
                )
              }
            >
              <Text style={styles.secondaryBtnText}>Read LaTeX notes</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Focus / Daily Revision Capsule */}
        {dailyNote && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today&apos;s revision capsule</Text>
              <Text style={styles.xpTag}>+{dailyNote.xpReward} XP</Text>
            </View>
            <View style={[styles.card, { backgroundColor: colors.surface2 }]}>
              <Text style={styles.metaLabel}>
                {dailyNote.subjectCode} • 10-MINUTE CONCEPT REVIEW
              </Text>
              <Text style={styles.cardTitle}>{dailyNote.topic}</Text>
              <Text style={styles.cardDesc}>{dailyNote.summary}</Text>
              {dailyNote.formulaOrKeyPoint ? (
                <View style={styles.formulaBox}>
                  <Text style={styles.formulaText}>
                    {dailyNote.formulaOrKeyPoint}
                  </Text>
                </View>
              ) : null}
            </View>
          </>
        )}

        {/* Quick Study Workbench */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Study workbench</Text>
        </View>
        <View style={styles.workbenchGrid}>
          <TouchableOpacity
            style={styles.workbenchCard}
            onPress={() => router.push("/(tabs)/tutor")}
          >
            <Ionicons name="sparkles-outline" size={22} color={colors.accent} />
            <Text style={styles.workbenchTitle}>AI Doubt Tutor</Text>
            <Text style={styles.workbenchSub}>24/7 syllabus step-by-step help</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.workbenchCard}
            onPress={() =>
              openWebPath("/prepmeup/coding", "Python 3.12 Coding Lab")
            }
          >
            <Ionicons name="code-slash-outline" size={22} color={colors.accent} />
            <Text style={styles.workbenchTitle}>Python Coding Lab</Text>
            <Text style={styles.workbenchSub}>Browser IDE & test cases</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.workbenchCard}
            onPress={() =>
              openWebPath("/prepmeup/simulations", "Interactive Simulators")
            }
          >
            <Ionicons name="hardware-chip-outline" size={22} color={colors.accent} />
            <Text style={styles.workbenchTitle}>17 Simulators</Text>
            <Text style={styles.workbenchSub}>BEE circuits, CPU & Python</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.workbenchCard}
            onPress={() =>
              openWebPath("/prepmeup/quizzes", "Topic Quiz Arena")
            }
          >
            <Ionicons name="checkbox-outline" size={22} color={colors.accent} />
            <Text style={styles.workbenchTitle}>Topic Quizzes</Text>
            <Text style={styles.workbenchSub}>Timed MCQs & explanations</Text>
          </TouchableOpacity>
        </View>

        {/* Under Construction Banner */}
        <View style={styles.constructionCard}>
          <View style={styles.constructionBadge}>
            <Text style={styles.constructionBadgeText}>
              Under construction • Coming soon
            </Text>
          </View>
          <Text style={styles.constructionTitle}>
            CyberSecurity & Cloud Computing (AWS) Tracks
          </Text>
          <Text style={styles.constructionDesc}>
            Both specialized career tracks are currently under construction and coming soon. Semester 1 B.Tech CSE AI/ML is live and free for everyone.
          </Text>
        </View>

        {/* Semester 1 Subjects Preview */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Semester 1 subjects</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/subjects")}>
            <Text style={styles.linkText}>View all 6 →</Text>
          </TouchableOpacity>
        </View>

        {SEMESTER_1_SUBJECTS.map((sub) => (
          <TouchableOpacity
            key={sub.code}
            style={styles.subjectRowCard}
            onPress={() => router.push(`/subject/${sub.slug}`)}
          >
            <View style={{ flex: 1 }}>
              <View style={styles.subjectMetaRow}>
                <Text style={styles.subjectCode}>{sub.code}</Text>
                <View style={styles.creditPill}>
                  <Text style={styles.creditPillText}>{sub.credits} credits</Text>
                </View>
              </View>
              <Text style={styles.subjectRowTitle}>{sub.title}</Text>
              <Text style={styles.subjectRowSub} numberOfLines={2}>
                {sub.description}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.muted}
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  brandMarkText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.2,
  },
  pillBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  pillBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.ink,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 36,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 20,
    marginBottom: 22,
  },
  eyebrowPill: {
    alignSelf: "flex-start",
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    marginBottom: 10,
  },
  eyebrowPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.accent,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: -0.4,
  },
  heroSubtitle: {
    marginTop: 6,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.muted,
  },
  metricsRow: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.ink,
  },
  metricLabel: {
    marginTop: 2,
    fontSize: 11,
    color: colors.muted,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.hairline,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.ink,
  },
  linkText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.accent,
  },
  xpTag: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.success,
    backgroundColor: colors.successSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 18,
    marginBottom: 20,
  },
  metaLabel: {
    fontSize: 10.5,
    fontWeight: "600",
    letterSpacing: 0.6,
    color: colors.muted,
    textTransform: "uppercase",
  },
  cardTitle: {
    marginTop: 4,
    fontSize: 17,
    fontWeight: "700",
    color: colors.ink,
  },
  cardDesc: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: colors.muted,
  },
  cardActions: {
    marginTop: 14,
    flexDirection: "row",
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radii.md,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  secondaryBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radii.md,
  },
  secondaryBtnText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "500",
  },
  formulaBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  formulaText: {
    fontFamily: "monospace",
    fontSize: 12,
    color: colors.ink,
  },
  workbenchGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 20,
  },
  workbenchCard: {
    width: "48%",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 14,
  },
  workbenchTitle: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
  },
  workbenchSub: {
    marginTop: 2,
    fontSize: 11.5,
    color: colors.muted,
  },
  constructionCard: {
    backgroundColor: colors.surface2,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 16,
    marginBottom: 22,
  },
  constructionBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  constructionBadgeText: {
    fontSize: 10.5,
    fontWeight: "600",
    color: colors.accent,
  },
  constructionTitle: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
  },
  constructionDesc: {
    marginTop: 4,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.muted,
  },
  subjectRowCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 15,
    marginBottom: 10,
  },
  subjectMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  subjectCode: {
    fontFamily: "monospace",
    fontSize: 11.5,
    fontWeight: "700",
    color: colors.muted,
  },
  creditPill: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  creditPillText: {
    fontSize: 10.5,
    fontWeight: "600",
    color: colors.accent,
  },
  subjectRowTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
  },
  subjectRowSub: {
    marginTop: 3,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.muted,
  },
});
