const appJson = require("./app.json");

const config = appJson.expo;
const useProductionGoogleServices =
  process.env.GOOGLE_SERVICES_JSON === "production";

module.exports = {
  expo: {
    ...config,
    android: {
      ...config.android,
      googleServicesFile: useProductionGoogleServices
        ? "./firebase/android/firebase-android-release.json"
        : "./firebase/android/firebase-android-debug.json",
    },
  },
};
