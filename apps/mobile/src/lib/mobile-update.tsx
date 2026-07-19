import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AppState, type AppStateStatus } from "react-native";
import * as Updates from "expo-updates";
import { Alert } from "../components/LocalizedText";
import { useMobileLocale } from "./mobile-locale";

const FOREGROUND_CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;

type MobileUpdateStatus = "idle" | "checking" | "downloading" | "ready";

type MobileUpdateContextValue = {
  checkForUpdate: () => Promise<void>;
  isSupported: boolean;
  status: MobileUpdateStatus;
};

const MobileUpdateContext = createContext<MobileUpdateContextValue>({
  checkForUpdate: async () => undefined,
  isSupported: false,
  status: "idle",
});

export const MobileUpdateProvider = ({ children }: { children: ReactNode }) => {
  const { resolvedLocale } = useMobileLocale();
  const [status, setStatus] = useState<MobileUpdateStatus>("idle");
  const activeCheckRef = useRef<Promise<void> | null>(null);
  const lastAutomaticCheckRef = useRef(0);
  const isSupported = !__DEV__ && Updates.isEnabled;
  const english = resolvedLocale === "en-US";

  const restart = useCallback(async () => {
    try {
      await Updates.reloadAsync();
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      Alert.alert(
        english ? "Unable to restart" : "重启失败",
        english ? `Close and reopen EdgeEver to apply the update.\n\n${detail}` : `请关闭并重新打开 EdgeEver 以应用更新。\n\n${detail}`
      );
    }
  }, [english]);

  const showRestartPrompt = useCallback(() => {
    Alert.alert(
      english ? "Update ready" : "更新已就绪",
      english
        ? "The update has been downloaded. Restart EdgeEver now to apply it?"
        : "新版本已下载完成。现在重启 EdgeEver 以应用更新吗？",
      [
        { text: english ? "Later" : "稍后", style: "cancel" },
        { text: english ? "Restart now" : "立即重启", onPress: () => void restart() },
      ]
    );
  }, [english, restart]);

  const runCheck = useCallback((userInitiated: boolean) => {
    if (activeCheckRef.current) {
      return activeCheckRef.current;
    }

    if (!isSupported) {
      if (userInitiated) {
        Alert.alert(
          english ? "Updates unavailable" : "暂无法检查更新",
          english
            ? "Update checks are available in installed release builds, not Expo Go or development builds."
            : "检查更新仅适用于已安装的正式版，Expo Go 和开发版暂不支持。"
        );
      }
      return Promise.resolve();
    }

    const check = (async () => {
      try {
        setStatus("checking");
        const result = await Updates.checkForUpdateAsync();

        if (!result.isAvailable) {
          setStatus("idle");
          if (userInitiated) {
            Alert.alert(
              english ? "You're up to date" : "已是最新版本",
              english ? "No new update is available for this version." : "当前版本暂无可用更新。"
            );
          }
          return;
        }

        setStatus("downloading");
        await Updates.fetchUpdateAsync();
        setStatus("ready");
        showRestartPrompt();
      } catch (error) {
        setStatus("idle");
        if (userInitiated) {
          const detail = error instanceof Error ? error.message : String(error);
          Alert.alert(
            english ? "Unable to check for updates" : "检查更新失败",
            english ? `Check your connection and try again.\n\n${detail}` : `请检查网络连接后重试。\n\n${detail}`
          );
        }
      }
    })();

    activeCheckRef.current = check;
    void check.finally(() => {
      activeCheckRef.current = null;
    });
    return check;
  }, [english, isSupported, showRestartPrompt]);

  useEffect(() => {
    const attemptAutomaticCheck = () => {
      if (Date.now() - lastAutomaticCheckRef.current < FOREGROUND_CHECK_INTERVAL_MS) {
        return;
      }
      lastAutomaticCheckRef.current = Date.now();
      void runCheck(false);
    };
    const timer = setTimeout(attemptAutomaticCheck, 1_500);
    const subscription = AppState.addEventListener("change", (nextState: AppStateStatus) => {
      if (nextState === "active") {
        attemptAutomaticCheck();
      }
    });

    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, [runCheck]);

  const value = useMemo<MobileUpdateContextValue>(
    () => ({
      checkForUpdate: () => {
        if (status === "ready") {
          showRestartPrompt();
          return Promise.resolve();
        }
        return runCheck(true);
      },
      isSupported,
      status,
    }),
    [isSupported, runCheck, showRestartPrompt, status]
  );

  return <MobileUpdateContext.Provider value={value}>{children}</MobileUpdateContext.Provider>;
};

export const useMobileUpdate = () => useContext(MobileUpdateContext);
