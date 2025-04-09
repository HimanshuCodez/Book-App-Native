import { View, Text } from "react-native";
import { Image } from "expo-image";
import React from "react";
import styles from "../../assets/styles/login.styles";
import { useState } from "react";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {};
  return (
    <View style={styles.container}>
      <View style={styles.topIllustration}>
        <Image source={require("../../assets/images/g-book.png")}
        style={styles.illustrationImage}
        resizeMode="contain"
        />
      </View>
    </View>
  );
}
