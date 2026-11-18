import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, radii } from "../../src/theme";
import { SEMESTER_1_SUBJECTS } from "../../src/data/subjects";
import { API_BASE_URL } from "../../src/api";

export default function SubjectDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const subject =
    SEMESTER_1_SUBJECTS.find((s) => s.slug === slug) || SEMESTER_1_SUBJECTS[0];

  const [expandedModule, setExpandedModule] = useState<number>(1);

  const openWebView = (path: string, title: string) => {
    router.push({
      pathname: "/webview",
      params: {
        url: `${API_BASE_URL}${path}`,
        title,
      },
    });
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Subject Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.metaRow}>
          <Text style={styles.codeBadge}>{subject.code}</Text>
          <View style={styles.creditPill}>
            <Text style={styles.creditPillText}>
              {subject.credits} credits • {subject.moduleCount} modules
            </Text>
          </View>
        </View>

        <Text style={styles.title}>{subject.title}</Text>
        <Text style={styles.description}>{subject.description}</Text>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() =>
              openWebView(
                `/prepmeup/subjects/${subject.slug}`,
                `${subject.code} LaTeX Notes`
              )
            }
          >
            <Ionicons name="document-text-outline" size={16} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>Open Full LaTeX Notes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push("/(tabs)/tutor")}
          >
            <Text style={styles.secondaryBtnText}>Ask AI Tutor</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Interactive Simulators for this Subject */}
      <Text style={styles.sectionHeading}>Interactive visual laboratories</Text>
      {subject.simulators.map((sim) => (
        <TouchableOpacity
          key={sim.slug}
          style={styles.simCard}
          onPress={() =>
            openWebView(`/prepmeup/simulations`, sim.title)
          }
        >
          <View style={styles.simIconBox}>
            <Ionicons name="pulse-outline" size={20} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.simTitle}>{sim.title}</Text>
            <Text style={styles.simSub}>
              Tap to launch interactive browser simulator
            </Text>
          </View>
          <Ionicons name="open-outline" size={18} color={colors.accent} />
        </TouchableOpacity>
      ))}

      {/* 5 Modules Accordion */}
      <Text style={[styles.sectionHeading, { marginTop: 18 }]}>
        Syllabus modules & topics ({subject.topicCount} notes)
      </Text>

      {subject.modules.map((mod) => {
        const isOpen = expandedModule === mod.number;
        return (
          <View key={mod.number} style={styles.moduleCard}>
            <TouchableOpacity
              style={styles.moduleHeader}
              onPress={() =>
                setExpandedModule(isOpen ? 0 : mod.number)
              }
            >
              <View style={styles.moduleNumBadge}>
                <Text style={styles.moduleNumText}>M{mod.number}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.moduleTitle}>{mod.title}</Text>
                <Text style={styles.moduleCount}>
                  {mod.topics.length} core topics
                </Text>
              </View>
              <Ionicons
                name={isOpen ? "chevron-up" : "chevron-down"}
                size={18}
                color={colors.muted}
              />
            </TouchableOpacity>

            {isOpen && (
              <View style={styles.topicList}>
                {mod.topics.map((topic, idx) => (
                  <TouchableOpacity
                    key={topic}
                    style={styles.topicRow}
                    onPress={() =>
                      openWebView(
                        `/prepmeup/subjects/${subject.slug}`,
                        topic
                      )
                    }
                  >
                    <Text style={styles.topicIndex}>
                      {mod.number}.{idx + 1}
                    </Text>
                    <Text style={styles.topicText}>{topic}</Text>
                    <Text style={styles.readLink}>Read →</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 18,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 18,
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  codeBadge: {
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: "700",
    color: colors.ink,
    backgroundColor: colors.surface2,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  creditPill: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  creditPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.accent,
  },
  title: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: "700",
    color: colors.ink,
  },
  description: {
    marginTop: 6,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.muted,
  },
  actionRow: {
    marginTop: 16,
    flexDirection: "row",
    gap: 10,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: colors.accent,
    paddingVertical: 11,
    borderRadius: radii.md,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  secondaryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface,
    justifyContent: "center",
  },
  secondaryBtnText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "600",
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
    marginBottom: 10,
  },
  simCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  simIconBox: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  simTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
  },
  simSub: {
    marginTop: 2,
    fontSize: 12,
    color: colors.muted,
  },
  moduleCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    marginBottom: 10,
    overflow: "hidden",
  },
  moduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
  },
  moduleNumBadge: {
    width: 34,
    height: 34,
    borderRadius: radii.sm,
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.hairline,
    alignItems: "center",
    justifyContent: "center",
  },
  moduleNumText: {
    fontFamily: "monospace",
    fontSize: 12,
    fontWeight: "700",
    color: colors.accent,
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.ink,
  },
  moduleCount: {
    marginTop: 2,
    fontSize: 11.5,
    color: colors.muted,
  },
  topicList: {
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    backgroundColor: colors.surface2,
    paddingVertical: 6,
  },
  topicRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  topicIndex: {
    fontFamily: "monospace",
    fontSize: 11.5,
    color: colors.muted,
    width: 28,
  },
  topicText: {
    flex: 1,
    fontSize: 13,
    color: colors.ink,
    fontWeight: "500",
  },
  readLink: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.accent,
  },
});
