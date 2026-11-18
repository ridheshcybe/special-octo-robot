import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
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
import { API_BASE_URL, askAiDoubtTutor } from "../../src/api";

interface ChatMessage {
  id: string;
  role: "student" | "ai";
  subjectCode: string;
  text: string;
}

const SAMPLE_PROMPTS = [
  "Explain Cayley-Hamilton theorem with a 2x2 matrix example",
  "Difference between Von Neumann and Harvard architecture",
  "How does a full-wave bridge rectifier work?",
  "Explain Python list comprehension vs generator expression",
];

export default function TutorScreen() {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState("CSE1001");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "ai",
      subjectCode: "CSE1001",
      text: "Hello! Select your Semester 1 subject above and ask any doubt on mathematical proofs, circuit theorems, RISC pipelining, or Python code.",
    },
  ]);

  const handleSend = async (promptText?: string) => {
    const q = (promptText ?? question).trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: "student",
      subjectCode: selectedSubject,
      text: q,
    };
    setMessages((prev) => [...prev, userMsg]);
    if (!promptText) setQuestion("");
    setLoading(true);

    const res = await askAiDoubtTutor({
      subjectCode: selectedSubject,
      question: q,
    });

    const aiMsg: ChatMessage = {
      id: `a_${Date.now()}`,
      role: "ai",
      subjectCode: selectedSubject,
      text: res.answer,
    };
    setMessages((prev) => [...prev, aiMsg]);
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>24/7 ACADEMIC COPILOT</Text>
            <Text style={styles.title}>Syllabus AI doubt tutor</Text>
          </View>
          <TouchableOpacity
            style={styles.webBtn}
            onPress={() =>
              router.push({
                pathname: "/webview",
                params: {
                  url: `${API_BASE_URL}/prepmeup/doubts`,
                  title: "AI Doubt Workbench",
                },
              })
            }
          >
            <Text style={styles.webBtnText}>LaTeX View ↗</Text>
          </TouchableOpacity>
        </View>

        {/* Subject Selector Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.subjectChipScroll}
          contentContainerStyle={{ gap: 8 }}
        >
          {SEMESTER_1_SUBJECTS.map((sub) => {
            const active = selectedSubject === sub.code;
            return (
              <TouchableOpacity
                key={sub.code}
                style={[styles.subjectChip, active && styles.subjectChipActive]}
                onPress={() => setSelectedSubject(sub.code)}
              >
                <Text
                  style={[
                    styles.subjectChipText,
                    active && styles.subjectChipTextActive,
                  ]}
                >
                  {sub.code} • {sub.shortTitle}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          style={styles.chatScroll}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Quick Prompts */}
          <Text style={styles.promptHeading}>Quick syllabus questions:</Text>
          <View style={styles.promptWrap}>
            {SAMPLE_PROMPTS.map((p) => (
              <TouchableOpacity
                key={p}
                style={styles.promptChip}
                onPress={() => handleSend(p)}
              >
                <Text style={styles.promptChipText}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Messages */}
          {messages.map((m) => (
            <View
              key={m.id}
              style={[
                styles.msgBubble,
                m.role === "student" ? styles.userBubble : styles.aiBubble,
              ]}
            >
              <View style={styles.msgHeader}>
                <Text
                  style={[
                    styles.msgRole,
                    m.role === "student" && { color: "#FFFFFF" },
                  ]}
                >
                  {m.role === "student" ? "You" : "PrepMeUp AI"} • {m.subjectCode}
                </Text>
              </View>
              <Text
                style={[
                  styles.msgText,
                  m.role === "student" && { color: "#FFFFFF" },
                ]}
              >
                {m.text}
              </Text>
            </View>
          ))}

          {loading && (
            <View style={[styles.msgBubble, styles.aiBubble, styles.loadingRow]}>
              <ActivityIndicator size="small" color={colors.accent} />
              <Text style={styles.loadingText}>
                Deriving syllabus-aligned explanation…
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            value={question}
            onChangeText={setQuestion}
            placeholder={`Ask a ${selectedSubject} question…`}
            placeholderTextColor={colors.muted}
            style={styles.input}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!question.trim() || loading) && { opacity: 0.5 },
            ]}
            disabled={!question.trim() || loading}
            onPress={() => handleSend()}
          >
            <Ionicons name="send" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingBottom: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eyebrow: {
    fontSize: 10.5,
    fontWeight: "600",
    letterSpacing: 0.7,
    color: colors.muted,
  },
  title: {
    marginTop: 2,
    fontSize: 20,
    fontWeight: "700",
    color: colors.ink,
  },
  webBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.surface2,
  },
  webBtnText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: colors.accent,
  },
  subjectChipScroll: {
    marginTop: 12,
  },
  subjectChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.bg,
  },
  subjectChipActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
  },
  subjectChipText: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.muted,
  },
  subjectChipTextActive: {
    color: colors.accent,
    fontWeight: "700",
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    padding: 18,
    paddingBottom: 28,
  },
  promptHeading: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.muted,
    marginBottom: 8,
  },
  promptWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },
  promptChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radii.md,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  promptChipText: {
    fontSize: 12,
    color: colors.ink,
  },
  msgBubble: {
    borderRadius: radii.lg,
    padding: 14,
    marginBottom: 12,
    maxWidth: "92%",
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: colors.accent,
  },
  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  msgHeader: {
    marginBottom: 4,
  },
  msgRole: {
    fontSize: 10.5,
    fontWeight: "700",
    color: colors.accent,
    textTransform: "uppercase",
  },
  msgText: {
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.ink,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  loadingText: {
    fontSize: 12.5,
    color: colors.muted,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13.5,
    color: colors.ink,
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
});
