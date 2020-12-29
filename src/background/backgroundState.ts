import { ApiClient } from "synology-typescript-api";
import type { NotificationSettings } from "../common/state";
import type { CachedTrackers } from "./actions";
import { RequestManager } from "./requestManager";

export interface BackgroundState {
  api: ApiClient;
  // This starts undefined, which means we haven't fetched the list of tasks yet.
  finishedTaskIds: Set<string> | undefined;
  pollRequestManager: RequestManager;
  lastNotificationSettings: NotificationSettings | undefined;
  notificationInterval: number | undefined;
  didInitializeSettings: boolean;
  showNonErrorNotifications: boolean;
  // BackgroundState holds trackers, State holds tracker settings
  trackerList: CachedTrackers;
  lastTrackerURL: string | undefined;
}

const state: BackgroundState = {
  api: new ApiClient({}),
  finishedTaskIds: undefined,
  pollRequestManager: new RequestManager(),
  lastNotificationSettings: undefined,
  notificationInterval: undefined,
  didInitializeSettings: false,
  showNonErrorNotifications: true,
  trackerList: [],
  lastTrackerURL: undefined,
};

export function getMutableStateSingleton() {
  return state;
}
