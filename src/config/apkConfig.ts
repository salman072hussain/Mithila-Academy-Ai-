/**
 * Configuration for Real Android APK Downloads.
 *
 * - Do NOT use environment variables or secrets for this.
 * - If a real APK file is placed in public/downloads/mithila-academy.apk, it is automatically served.
 * - Or set a real, verified public APK download link here in downloadUrl.
 * - If no real APK file/link exists yet, leave downloadUrl as null.
 */
export interface ApkConfiguration {
  downloadUrl: string | null;
  fileName: string;
  packageName: string;
  versionName: string;
  versionCode: number;
}

export const APK_CONFIG: ApkConfiguration = {
  // Set to real APK URL when available, or null if not yet available
  downloadUrl: null,
  fileName: "mithila-academy.apk",
  packageName: "com.mithila.academy",
  versionName: "1.1.0",
  versionCode: 2,
};
