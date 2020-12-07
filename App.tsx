import React from "react"
import { Text, View, Button, Platform } from "react-native"
import Constants from "expo-constants"
import * as Notifications from "expo-notifications"
import * as Permissions from "expo-permissions"
import dayjs from "dayjs"

import { COMPLIMENTS } from "./lib/compliments"

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

export default function App() {
  const [compliment, setCompliment] = React.useState(
    COMPLIMENTS[Math.round(Math.random() * COMPLIMENTS.length)],
  )
  const [countdown, setCountdown] = React.useState<dayjs.Dayjs>()

  const generateCompliment = () => {
    let index = Math.round(Math.random() * COMPLIMENTS.length) - 1
    if (index < 0) index = 0
    setCompliment(COMPLIMENTS[index])
    setCountdown(dayjs().add(10, "second"))
    Notifications.scheduleNotificationAsync({
      content: {
        sound: "default",
        title: "Hey Dorida!",
        body: "You have a new compliment!",
      },
      trigger: null,
    })
  }

  React.useEffect(() => {
    registerForPushNotificationsAsync()
    generateCompliment()
  }, [])

  React.useEffect(() => {
    if (!countdown) return
    const timeout = setTimeout(() => {
      if (countdown.diff(dayjs(), "second") > 0) {
        // TODO: FIX THIS SHIT this works most of the time ... wierd bug with dayjs, or i'm using it wrong ?? also sometimes it subtracts 2 seconds instead of one
        setCountdown(countdown.subtract(0, "second"))
      } else {
        generateCompliment()
      }
    }, 1000)
    return () => clearTimeout(timeout)
  }, [countdown])

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
        {countdown && (
          <Text>
            Next compliment in {countdown.diff(dayjs(), "hour")} hours,{" "}
            {countdown.diff(dayjs(), "minute") - countdown.diff(dayjs(), "hour") * 60} minutes, and{" "}
            {countdown.diff(dayjs(), "second") - countdown.diff(dayjs(), "minute") * 60} seconds
          </Text>
        )}
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
