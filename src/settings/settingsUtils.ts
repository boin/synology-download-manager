import {
  SessionName,
  ApiClient,
  ConnectionFailure,
  isConnectionFailure,
} from "synology-typescript-api";
import { Settings, getHostUrl, ConnectionSettings, State } from "../common/state";
import { onUnhandledError } from "../common/errorHandlers";

export async function saveSettings(settings: Settings): Promise<boolean> {
  console.log("persisting settings...");
  try {
    await browser.storage.local.set<Partial<State>>({ settings });
    console.log("done persisting settings");
    return true;
  } catch (e) {
    onUnhandledError(e);
    return false;
  }
}

export type ConnectionTestResult =
  | ConnectionFailure
  | { code: number }
  | "good-and-modern"
  | "good-and-legacy";

export function isErrorCodeResult(result: ConnectionTestResult): result is { code: number } {
  return (result as { code: number }).code != null;
}

export async function testConnection(settings: ConnectionSettings): Promise<ConnectionTestResult> {
  const api = new ApiClient({
    baseUrl: getHostUrl(settings),
    account: settings.username,
    passwd: settings.password,
    session: SessionName.DownloadStation,
  });

  const loginResponse = await api.Auth.Login({ timeout: 30000 });
  if (isConnectionFailure(loginResponse)) {
    return loginResponse;
  } else if (!loginResponse.success) {
    return { code: loginResponse.error.code };
  } else {
    // Note that this is fire-and-forget.
    api.Auth.Logout({ timeout: 10000 }).then((logoutResponse) => {
      if (logoutResponse === "not-logged-in") {
        // Typescript demands we handle this case, which is correct, but also, it's pretty wat
        console.error(`wtf: not logged in immediately after successfully logging in`);
      } else if (isConnectionFailure(logoutResponse) || !logoutResponse.success) {
        console.error(
          "ignoring unexpected failure while logging out after successful connection test",
          logoutResponse,
        );
      }
    });
    return loginResponse.data.extra.isLegacyLogin ? "good-and-legacy" : "good-and-modern";
  }
}
