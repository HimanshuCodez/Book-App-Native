import { Image, Text, View } from "react-native";
import { Link } from "expo-router";
export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>harsh is big too much big pig</Text>
      <Link href="/(auth)/signup">SignUp </Link>
      <Link href="/(auth)">Login</Link>
    </View>
  );
}
