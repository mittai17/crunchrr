import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { useSignIn, useSignUp, useAuth } from "@clerk/clerk-expo";
import { Redirect, router } from "expo-router";
import { useStyles } from "../src/screens";
export default function SignIn() {
  const styles = useStyles();
  const { signIn, setActive, isLoaded } = useSignIn();
  const { signUp } = useSignUp();
  const { isSignedIn } = useAuth();
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [signup, setSignup] = useState(false),
    [code, setCode] = useState(""),
    [verify, setVerify] = useState(false),
    [secondFactor, setSecondFactor] = useState<
      "email_code" | "phone_code" | "totp" | null
    >(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  if (isSignedIn) return <Redirect href="/" />;
  async function submit() {
    if (!isLoaded) return;
    setBusy(true);
    setError("");
    try {
      if (signup && signUp) {
        if (!verify) {
          await signUp.create({ emailAddress: email, password });
          await signUp.prepareEmailAddressVerification({
            strategy: "email_code",
          });
          setVerify(true);
        } else {
          const result = await signUp.attemptEmailAddressVerification({ code });
          if (result.status === "complete")
            await setActive({ session: result.createdSessionId });
          else
            setError(
              "Additional verification is needed. Complete it in the web workspace.",
            );
        }
      } else {
        if (secondFactor && verify) {
          const result = await signIn.attemptSecondFactor({
            strategy: secondFactor,
            code,
          });
          if (result.status === "complete")
            await setActive({ session: result.createdSessionId });
          else
            setError(
              "Verification is not complete. Check your code and try again.",
            );
        } else {
          const result = await signIn.create({ identifier: email, password });
          if (result.status === "complete")
            await setActive({ session: result.createdSessionId });
          else {
            const emailFactor = result.supportedSecondFactors?.find(
              (f) => f.strategy === "email_code",
            );
            const phoneFactor = result.supportedSecondFactors?.find(
              (f) => f.strategy === "phone_code",
            );
            const totp = result.supportedSecondFactors?.find(
              (f) => f.strategy === "totp",
            );
            if (emailFactor) {
              await signIn.prepareSecondFactor({
                strategy: "email_code",
                emailAddressId: emailFactor.emailAddressId,
              });
              setSecondFactor("email_code");
              setVerify(true);
            } else if (phoneFactor) {
              await signIn.prepareSecondFactor({
                strategy: "phone_code",
                phoneNumberId: phoneFactor.phoneNumberId,
              });
              setSecondFactor("phone_code");
              setVerify(true);
            } else if (totp) {
              setSecondFactor("totp");
              setVerify(true);
            } else
              setError(
                "Use the web workspace to complete your configured authentication method.",
              );
          }
        }
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Sign in failed. Check your details.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: 100 }]}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets
    >
      <Text style={[styles.title, { fontSize: 38, color: "#6d3df5" }]}>
        crunchrr
      </Text>
      <Text style={styles.title}>
        {signup ? "Make yourself at home." : "Welcome back."}
      </Text>
      <Text style={styles.muted}>Everything important, in one place.</Text>
      <View style={[styles.card, { marginTop: 25 }]}>
        {verify ? (
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder={
              secondFactor === "totp"
                ? "Authenticator code"
                : "Verification code"
            }
            keyboardType="number-pad"
          />
        ) : (
          <>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              textContentType="emailAddress"
            />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry
              textContentType="password"
            />
          </>
        )}
        {error && <Text style={styles.error}>{error}</Text>}
        <Pressable
          style={styles.button}
          disabled={busy}
          onPress={() => void submit()}
        >
          <Text style={styles.buttonText}>
            {busy
              ? "Please wait…"
              : verify
                ? "Verify email"
                : signup
                  ? "Create account"
                  : "Sign in"}
          </Text>
        </Pressable>
        <Pressable
          style={styles.row}
          onPress={() => {
            setSignup(!signup);
            setVerify(false);
            setSecondFactor(null);
            setError("");
          }}
        >
          <Text style={{ color: "#6d3df5" }}>
            {signup
              ? "Already have a space? Sign in"
              : "New here? Create your space"}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
