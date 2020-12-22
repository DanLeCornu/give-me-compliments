import React from "react"
import {
  Text,
  AppState,
  View,
  Platform,
  TouchableOpacity,
  AppStateStatus,
  Alert,
  StyleSheet,
} from "react-native"
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
import { LOCALES } from "./lib/locales"

const NOTIFICATION_TASK = "background-notification-task"

TaskManager.defineTask(NOTIFICATION_TASK, () => {
  try {
    Notifications.scheduleNotificationAsync({
      content: {
        sound: "default",
        title: "Hey!",
        body: "You have a new complement!",
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
  minimumInterval: 60 * 60, // testing 1 hour interval
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

type Locale = "en" | "de" | "pl"

export default function App() {
  const isLoadingComplete = useCachedResources()
  const [compliment, setCompliment] = React.useState("")
  const [checkingUpdates, setCheckingUpdates] = React.useState(false)
  const [ready, setReady] = React.useState(false)
  const [locale, setLocale] = React.useState<Locale>("en")

  const generateCompliment = () => {
    let index = Math.round(Math.random() * COMPLIMENTS[locale].length) - 1
    if (index < 0) index = 0
    setCompliment(COMPLIMENTS[locale][index])
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

  React.useEffect(() => {
    generateCompliment()
  }, [locale])

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
    if (nextAppState === "active") {
      await checkForUpdates()
      generateCompliment()
    }
  }

  const handleRefresh = () => {
    Alert.alert(LOCALES[locale].refreshMessage)
  }

  const handlePrivacyPress = () => {
    Alert.alert(
      "Privacy Policy",
      `No Quarter built the Give Me Compliments app as an Open Source app. This SERVICE is provided by No Quarter at no cost and is intended for use as is.
    This page is used to inform visitors regarding our policies with the collection, use, and disclosure of Personal Information if anyone decided to use our Service.
    If you choose to use our Service, then you agree to the collection and use of information in relation to this policy. The Personal Information that we collect is used for providing and improving the Service. We will not use or share your information with anyone except as described in this Privacy Policy.
    The terms used in this Privacy Policy have the same meanings as in our Terms and Conditions, which is accessible at Give Me Compliments unless otherwise defined in this Privacy Policy.
    Information Collection and Use
    For a better experience, while using our Service, we may require you to provide us with certain personally identifiable information. The information that we request will be retained by us and used as described in this privacy policy.
    The app does use third party services that may collect information used to identify you.
    Link to privacy policy of third party service providers used by the app
    Google Play Services
    Log Data
    We want to inform you that whenever you use our Service, in a case of an error in the app we collect data and information (through third party products) on your phone called Log Data. This Log Data may include information such as your device Internet Protocol (“IP”) address, device name, operating system version, the configuration of the app when utilizing our Service, the time and date of your use of the Service, and other statistics.
    Cookies
    Cookies are files with a small amount of data that are commonly used as anonymous unique identifiers. These are sent to your browser from the websites that you visit and are stored on your device's internal memory.
    This Service does not use these “cookies” explicitly. However, the app may use third party code and libraries that use “cookies” to collect information and improve their services. You have the option to either accept or refuse these cookies and know when a cookie is being sent to your device. If you choose to refuse our cookies, you may not be able to use some portions of this Service.
    Service Providers
    We may employ third-party companies and individuals due to the following reasons:
    To facilitate our Service;
    To provide the Service on our behalf;
    To perform Service-related services; or
    To assist us in analyzing how our Service is used.
    We want to inform users of this Service that these third parties have access to your Personal Information. The reason is to perform the tasks assigned to them on our behalf. However, they are obligated not to disclose or use the information for any other purpose.
    Security
    We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.
    Links to Other Sites
    This Service may contain links to other sites. If you click on a third-party link, you will be directed to that site. Note that these external sites are not operated by us. Therefore, we strongly advise you to review the Privacy Policy of these websites. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
    Children’s Privacy
    These Services do not address anyone under the age of 13. We do not knowingly collect personally identifiable information from children under 13. In the case we discover that a child under 13 has provided us with personal information, we immediately delete this from our servers. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us so that we will be able to do necessary actions.
    Changes to This Privacy Policy
    We may update our Privacy Policy from time to time. Thus, you are advised to review this page periodically for any changes. We will notify you of any changes by posting the new Privacy Policy on this page.
    This policy is effective as of 2020-12-12
    Contact Us
    If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us at dan@noquarter.co.`,
    )
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
        <TouchableOpacity
          onPress={() => setLocale("en")}
          style={{ position: "absolute", bottom: 20, right: 160 }}
        >
          <View style={locale === "en" && styles.flagActive}>
            <Text style={styles.flag}>🇬🇧</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setLocale("pl")}
          style={{ position: "absolute", bottom: 20, right: 200 }}
        >
          <View style={locale === "pl" && styles.flagActive}>
            <Text style={styles.flag}>🇵🇱</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setLocale("de")}
          style={{ position: "absolute", bottom: 20, right: 240 }}
        >
          <View style={locale === "de" && styles.flagActive}>
            <Text style={styles.flag}>🇩🇪</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handlePrivacyPress}
          style={{ position: "absolute", bottom: 20, right: 70 }}
        >
          <Text style={{ color: "#444444", textDecorationLine: "underline" }}>{LOCALES[locale].privacy}</Text>
        </TouchableOpacity>
        <Text style={{ position: "absolute", bottom: 20, right: 20, color: "#444444" }}>v1.0.1</Text>
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
    // alert("Must use physical device for Push Notifications")
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

const styles = StyleSheet.create({
  flag: {
    fontSize: 20,
    paddingHorizontal: 7,
    paddingBottom: 2,
  },
  flagActive: {
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "#444444",
  },
})
