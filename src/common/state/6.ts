import type {
  State as State_5,
  CachedTasks as CachedTasks_5,
  Logging as Logging_5,
  Settings as Settings_5,
} from "./5";

export {
  Protocol,
  VisibleTaskSettings,
  TaskSortType,
  CachedTasks,
  NotificationSettings,
  ConnectionSettings,
  Logging,
  BadgeDisplayType,
} from "./5";

export interface StateVersion {
  stateVersion: 6;
}

export interface TorrentTrackerSettings {
  enablePublicTrackers: boolean;
  publicTrackerURL: string;
}

export interface Settings extends Settings_5 {
  torrentTrackers: TorrentTrackerSettings;
}

export interface State extends CachedTasks_5, Logging_5, StateVersion {
  settings: Settings;
}

export function transition(state: State_5): State {
  return {
    ...state,
    settings: {
      ...state.settings,
      torrentTrackers: {
        enablePublicTrackers: false,
        publicTrackerURL: ""
      }
    },
    stateVersion: 6,
  };
}
