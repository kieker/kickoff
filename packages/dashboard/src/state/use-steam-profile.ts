import { useCallback, useEffect, useState } from "react";
import { browserStorage, steamBridge, type PlatformSteamResult } from "@kickoff/platform";

const STORAGE_KEY = "kickoff.steam.profile";

export function useSteamProfile() {
  const [profileInput, setProfileInputState] = useState(() => browserStorage.get(STORAGE_KEY, ""));
  const [result, setResult] = useState<PlatformSteamResult>();
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (forceRefresh = false, input = profileInput) => {
    if (!input.trim() || !steamBridge.isAvailable()) {
      return;
    }
    setLoading(true);
    const nextResult = await steamBridge.getProfile(input, forceRefresh);
    setResult(nextResult);
    setLoading(false);
  }, [profileInput]);

  useEffect(() => {
    load();
  }, [load]);

  function setProfileInput(value: string) {
    const normalized = value.trim();
    setProfileInputState(normalized);
    browserStorage.set(STORAGE_KEY, normalized);
  }

  return { profileInput, setProfileInput, result, loading, load };
}
