import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import {
  API_BASE_URL,
  clearSession,
  getSavedSession,
  MobileUserSession,
  sendOtpRequest,
  verifyOtpRequest,
} from "../../src/api";

export default function ProfileScreen() {
  const router = useRouter();
  const [session, setSession] = useState<MobileUserSession | null>(null);
  const [identifier, setIdentifier] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"input" | "otp">("input");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  useEffect(() => {
    getSavedSession().then(setSession);
  }, []);

  const handleSendOtp = async () => {
    setError(null);
    if (!identifier.trim()) {
      setError("Please enter your student email or mobile number.");
      return;
    }
    setLoading(true);
    const res = await sendOtpRequest(identifier);
    setLoading(false);
    if (!res.ok) {
      setError(res.error || "Failed to send verification code.");
      return;
    }
    if (res.devMockCode) setDevOtpHint(res.devMockCode);
    setStep("otp");
  };

  const handleVerifyOtp = async () => {
    setError(null);
    if (otpCode.trim().length < 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }
    setLoading(true);
    const res = await verifyOtpRequest(identifier, otpCode);
    setLoading(false);
    if (!res.ok || !res.session) {
      setError(res.error || "Incorrect verification code.");
      return;
    }
    setSession(res.session);
    setStep("input");
    setOtpCode("");
  };

  const handleLogout = async () => {
    await clearSession();
    setSession(null);
    setStep("input");
  };

  const openWebPath = (path: string, title: string) => {
    router.push({
      pathname: "/webview",
      params: { url: `${API_BASE_URL}${path}`, title },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>STUDENT PORTAL</Text>
        <Text style={styles.title}>Account & progress</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {session ? (
          <View style={styles.card}>
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(session.fullName || "ST").slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.studentName}>
                  {session.fullName || "Engineering Student"}
                </Text>
                <Text style={styles.studentSub}>{session.identifier}</Text>
                <View style={styles.tierBadge}>
                  <Text style={styles.tierBadgeText}>
                    {session.tier || "Semester 1 Free Access"}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() =>
                openWebPath("/prepmeup/progress", "Academic Progress")
              }
            >
              <Ionicons
                name="stats-chart-outline"
                size={18}
                color={colors.ink}
              />
              <Text style={styles.menuText}>Detailed topic progress</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.muted}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() =>
                openWebPath("/prepmeup/sessions", "1:1 Mentorship Sessions")
              }
            >
              <Ionicons name="videocam-outline" size={18} color={colors.ink} />
              <Text style={styles.menuText}>1:1 mentorship bookings</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.muted}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryBtn, { marginTop: 14 }]}
              onPress={handleLogout}
            >
              <Text style={styles.secondaryBtnText}>Sign out</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Student sign-in</Text>
            <Text style={styles.cardDesc}>
              Sign in with your student email or mobile number to sync quiz scores, AI doubts, and mentorship bookings across web and mobile.
            </Text>

            {step === "input" ? (
              <View style={{ marginTop: 14 }}>
                <Text style={styles.inputLabel}>
                  Student email or mobile number
                </Text>
                <TextInput
                  value={identifier}
                  onChangeText={setIdentifier}
                  placeholder="student@example.ac.in or 9876543210"
                  placeholderTextColor={colors.muted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                />

                {error && <Text style={styles.errorText}>{error}</Text>}

                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={handleSendOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryBtnText}>
                      Send 6-digit verification code
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ marginTop: 14 }}>
                <Text style={styles.inputLabel}>
                  Enter 6-digit code sent to {identifier}
                </Text>
                {devOtpHint && (
                  <Text style={styles.devHint}>
                    Dev OTP Code: {devOtpHint}
                  </Text>
                )}
                <TextInput
                  value={otpCode}
                  onChangeText={(t) => setOtpCode(t.replace(/\D/g, ""))}
                  placeholder="123456"
                  placeholderTextColor={colors.muted}
                  keyboardType="number-pad"
                  maxLength={6}
                  style={[styles.input, styles.otpInput]}
                />

                {error && <Text style={styles.errorText}>{error}</Text>}

                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={handleVerifyOtp}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryBtnText}>
                      Verify & continue
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.secondaryBtn, { marginTop: 8 }]}
                  onPress={() => setStep("input")}
                >
                  <Text style={styles.secondaryBtnText}>
                    Change email / phone
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Quick Links & Legal */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Platform & policies</Text>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() =>
              openWebPath("/prepmeup/dashboard", "Web Student Portal")
            }
          >
            <Ionicons name="globe-outline" size={18} color={colors.ink} />
            <Text style={styles.menuText}>Open full web student portal</Text>
            <Ionicons name="open-outline" size={16} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => openWebPath("/prepmeup/terms", "Terms of Service")}
          >
            <Ionicons
              name="document-text-outline"
              size={18}
              color={colors.ink}
            />
            <Text style={styles.menuText}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => openWebPath("/prepmeup/privacy", "Privacy Policy")}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color={colors.ink}
            />
            <Text style={styles.menuText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => openWebPath("/prepmeup/contact", "Merchant Contact")}
          >
            <Ionicons name="mail-outline" size={18} color={colors.ink} />
            <Text style={styles.menuText}>Contact & support</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.muted} />
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
  scroll: {
    flex: 1,
  },
  content: {
    padding: 18,
    paddingBottom: 36,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 18,
    marginBottom: 16,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.accent,
  },
  studentName: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.ink,
  },
  studentSub: {
    marginTop: 2,
    fontSize: 12.5,
    color: colors.muted,
  },
  tierBadge: {
    marginTop: 6,
    alignSelf: "flex-start",
    backgroundColor: colors.surface2,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  tierBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.accent,
  },
  divider: {
    height: 1,
    backgroundColor: colors.hairline,
    marginVertical: 14,
  },
  cardTitle: {
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
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.ink,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.ink,
  },
  otpInput: {
    textAlign: "center",
    fontFamily: "monospace",
    fontSize: 20,
    letterSpacing: 6,
  },
  devHint: {
    fontSize: 12,
    color: colors.accent,
    marginBottom: 6,
    fontWeight: "600",
  },
  errorText: {
    marginTop: 8,
    fontSize: 12.5,
    color: colors.accent,
  },
  primaryBtn: {
    marginTop: 12,
    backgroundColor: colors.accent,
    paddingVertical: 12,
    borderRadius: radii.md,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "600",
  },
  secondaryBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingVertical: 10,
    borderRadius: radii.md,
    alignItems: "center",
  },
  secondaryBtnText: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "600",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    gap: 12,
  },
  menuText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: colors.ink,
  },
});
