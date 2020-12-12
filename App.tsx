import React from "react"
import { Text, AppState, View, Platform, TouchableOpacity, AppStateStatus, Alert } from "react-native"
import Constants from "expo-constants"
import * as Notifications from "expo-notifications"
import * as Permissions from "expo-permissions"
import * as TaskManager from "expo-task-manager"
import * as BackgroundFetch from "expo-background-fetch"

import { COMPLIMENTS } from "./lib/compliments"
import { QuoteEnd, QuoteStart, Refresh } from "./components/icons"
import useCachedResources from "./hooks/useCachedResources"
import { IS_PRODUCTION } from "./lib/config"
import { Updates } from "expo"

const NOTIFICATION_TASK = "background-notification-task"

TaskManager.defineTask(NOTIFICATION_TASK, () => {
  try {
    Notifications.scheduleNotificationAsync({
      content: {
        sound: "default",
        title: "Hej Dorida!",
        body: "Czeka na Ciebie nowy komplement!",
      },
      trigger: null,
    })
    return BackgroundFetch.Result.NoData
  } catch (error) {
    console.log(error)
    return BackgroundFetch.Result.Failed
  }
})

BackgroundFetch.registerTaskAsync(NOTIFICATION_TASK, {
  minimumInterval: 60 * 60 * 24,
  stopOnTerminate: false,
  startOnBoot: true,
})

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
})

export default function App() {
  const isLoadingComplete = useCachedResources()
  const [compliment, setCompliment] = React.useState("")
  const [checkingUpdates, setCheckingUpdates] = React.useState(false)
  const [ready, setReady] = React.useState(false)

  const generateCompliment = () => {
    let index = Math.round(Math.random() * COMPLIMENTS.length) - 1
    if (index < 0) index = 0
    setCompliment(COMPLIMENTS[index])
  }

  React.useEffect(() => {
    checkForUpdates()
    AppState.addEventListener("change", handleAppStateChange)
    registerForPushNotificationsAsync()
    generateCompliment()
    return () => {
      AppState.removeEventListener("change", handleAppStateChange)
    }
  }, [])

  const checkForUpdates = async () => {
    try {
      if (IS_PRODUCTION && !checkingUpdates) {
        setCheckingUpdates(true)
        const update = await Updates.checkForUpdateAsync()
        if (update.isAvailable) await Updates.reloadAsync()
        setCheckingUpdates(false)
      }
      setReady(true)
    } catch (error) {
      console.log(error)
      setReady(true)
    }
  }

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (AppState.currentState !== "active" && nextAppState === "active") {
      await checkForUpdates()
      generateCompliment()
    }
  }

  const handleRefresh = () => {
    Alert.alert("Nie bądź taka chciwa!")
  }

  if (!isLoadingComplete || !ready) {
    return null
  } else {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "space-around",
          padding: 50,
          backgroundColor: "#FCF2E8",
        }}
      >
        <View>
          <QuoteStart style={{ marginLeft: 15 }} fill="#444444" />
          <View
            style={{
              paddingLeft: 30,
              paddingRight: 30,
              paddingBottom: 20,
              paddingTop: 20,
              borderRadius: 15,
              backgroundColor: "#2C97A5",
            }}
          >
            <Text style={{ fontFamily: "amatic-SC", fontSize: 40, color: "#FCF2E8" }}>{compliment}</Text>
          </View>
          <View style={{ alignItems: "flex-end", marginTop: 15 }}>
            <QuoteEnd fill="#444444" />
          </View>
        </View>
        <TouchableOpacity onPress={handleRefresh} style={{ position: "absolute", bottom: 20, left: 20 }}>
          <Refresh fill="#444444" />
        </TouchableOpacity>
        <Text style={{ position: "absolute", bottom: 20, right: 20, color: "#444444" }}>v1.0.0</Text>
      </View>
    )
  }
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
