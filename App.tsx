import React from "react"
import { Text, View, Button, Platform, AppState, AppStateStatus } from "react-native"
import Constants from "expo-constants"
import * as Notifications from "expo-notifications"
import * as Permissions from "expo-permissions"

import { compliments } from "./lib/compliments"

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

export default function App() {
  const [compliment, setCompliment] = React.useState(
    compliments[Math.round(Math.random() * compliments.length)],
  )
  const [appState, setAppState] = React.useState(AppState.currentState)

  const generateCompliment = () => {
    let index = Math.round(Math.random() * compliments.length) - 1
    if (index < 0) index = 0
    setCompliment(compliments[index])
  }

  React.useEffect(() => {
    AppState.addEventListener("change", handleAppStateChange)
    registerForPushNotificationsAsync()

    Notifications.scheduleNotificationAsync({
      content: {
        sound: "default",
        title: "Hey Dorida!",
        body: "You have a new compliment! Tap to read it.",
        data: { data: "data here" },
      },
      trigger: {
        seconds: 10,
        repeats: true,
      },
    })
  }, [])

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    // For some reason when bringing back to foreground, the current state is "active" instead of "background"
    if (appState.match(/inactive|background/) && nextAppState === "active") {
      console.log("App has come to the foreground!")
      generateCompliment()
    }
    setAppState(nextAppState)
  }

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "space-around",
      }}
    >
      <View>
        <Text>{compliment}</Text>
        <Button title="Generate" onPress={generateCompliment} />
        <Button title="Stop notifications" onPress={Notifications.cancelAllScheduledNotificationsAsync} />
      </View>
    </View>
  )
}

async function registerForPushNotificationsAsync() {
  let token
  if (Constants.isDevice) {
    const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS)
    let finalStatus = existingStatus
    if (existingStatus !== "granted") {
      const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS)
      finalStatus = status
    }
    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!")
      return
    }
    token = (await Notifications.getExpoPushTokenAsync()).data
    console.log(token)
  } else {
    alert("Must use physical device for Push Notifications")
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    })
  }

  return token
}
