import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

export async function ensureNotificationPermission() {
  const settings = await Notifications.getPermissionsAsync();

  if (settings.granted) {
    return true;
  }

  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

export async function scheduleWeeklySummaryReminder() {
  const allowed = await ensureNotificationPermission();

  if (!allowed) {
    return false;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "FamilyFlow",
      body: "Pensez a verifier vos taches et vos economies de la semaine."
    },
    trigger: null
  });

  return true;
}

