import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { APP_DESCRIPTION, APP_NAME } from "@solo-agents/config";
import { colors, spacing } from "@/constants/theme";
import { useSession } from "@/providers/session-provider";
import { ErrorBanner, InputField, PrimaryButton, Screen, SecondaryButton, SectionCard } from "@/components/ui";

export function AuthScreen() {
  const { signIn, signUp, isLoading } = useSession();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    setIsSubmitting(true);
    setMessage(null);
    setInfo(null);

    const result =
      mode === "login" ? await signIn(email, password) : await signUp(email, password);

    setIsSubmitting(false);

    if (result.error) {
      setMessage(result.error);
      return;
    }

    setInfo(
      result.info ??
        (mode === "login"
          ? "Signed in successfully."
          : "Account created. You can continue in the app."),
    );
  }

  return (
    <Screen scroll>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Mobile preview</Text>
        <Text style={styles.title}>{APP_NAME}</Text>
        <Text style={styles.description}>{APP_DESCRIPTION}</Text>
      </View>

      <SectionCard
        title={mode === "login" ? "Welcome back" : "Create your account"}
        subtitle="Use the same Supabase auth flow and account you already use on the web app."
      >
        {message ? <ErrorBanner message={message} /> : null}
        {info ? <Text style={styles.info}>{info}</Text> : null}
        <InputField label="Email" value={email} onChangeText={setEmail} placeholder="name@example.com" />
        <InputField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Your password"
          secureTextEntry
        />
        <PrimaryButton
          label={mode === "login" ? "Sign in" : "Create account"}
          onPress={handleSubmit}
          loading={isSubmitting || isLoading}
        />
        <SecondaryButton
          label={mode === "login" ? "Need an account? Sign up" : "Already have an account? Sign in"}
          onPress={() => {
            setMode((current) => (current === "login" ? "signup" : "login"));
            setMessage(null);
            setInfo(null);
          }}
        />
      </SectionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingTop: spacing.xxl,
    gap: spacing.sm,
  },
  eyebrow: {
    color: colors.accent,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    color: colors.text,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "800",
  },
  description: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  info: {
    color: "#d8b4fe",
    fontSize: 14,
    lineHeight: 20,
  },
});
