import { useState, useEffect, useCallback } from "react";
import { APK_CONFIG } from "../config/apkConfig";

export interface ApkConfig {
  apkDownloadUrl: string | null;
  hasApk: boolean;
  packageId?: string;
  versionName?: string;
  versionCode?: number;
}

export function useApkDownload() {
  const initialUrl =
    APK_CONFIG.downloadUrl && APK_CONFIG.downloadUrl.trim().length > 0
      ? APK_CONFIG.downloadUrl.trim()
      : null;

  const [apkDownloadUrl, setApkDownloadUrl] = useState<string | null>(initialUrl);
  const [isLoading, setIsLoading] = useState(true);
  const [packageId, setPackageId] = useState(APK_CONFIG.packageName);
  const [versionName, setVersionName] = useState(APK_CONFIG.versionName);

  useEffect(() => {
    let isMounted = true;

    async function fetchApkConfig() {
      // If already set directly in APK_CONFIG, use it
      if (APK_CONFIG.downloadUrl && APK_CONFIG.downloadUrl.trim().length > 0) {
        if (isMounted) {
          setApkDownloadUrl(APK_CONFIG.downloadUrl.trim());
          setIsLoading(false);
        }
        return;
      }

      try {
        const res = await fetch("/api/config");
        if (res.ok) {
          const data: ApkConfig = await res.json();
          if (isMounted) {
            if (data.apkDownloadUrl && data.apkDownloadUrl.trim().length > 0) {
              setApkDownloadUrl(data.apkDownloadUrl.trim());
            } else {
              setApkDownloadUrl(null);
            }
            if (data.packageId) setPackageId(data.packageId);
            if (data.versionName) setVersionName(data.versionName);
          }
        }
      } catch (err) {
        console.warn("Could not check APK config:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchApkConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  const isConfigured = Boolean(apkDownloadUrl && apkDownloadUrl.length > 0);

  // Trigger real Android / browser file download
  const downloadApk = useCallback(() => {
    if (!apkDownloadUrl) {
      console.warn("APK download is not available yet.");
      return;
    }

    // Real Android browser download trigger
    const link = document.createElement("a");
    link.href = apkDownloadUrl;
    link.setAttribute("download", APK_CONFIG.fileName || "mithila-academy.apk");
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [apkDownloadUrl]);

  return {
    apkDownloadUrl,
    isConfigured,
    isLoading,
    packageId,
    versionName,
    downloadApk,
  };
}

