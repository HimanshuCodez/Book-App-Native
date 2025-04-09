import { Text, View } from "react-native";
import { Image } from "expo-image";
export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text  >dog</Text>
      <Image source={{uri:"https://i.pinimg.com/474x/a2/f8/91/a2f891e650ea46937e090b6d160769cc.jpg"}}/>
    </View>
  );
}
