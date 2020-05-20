import { SynologyResponse, ConnectionFailure, isConnectionFailure } from "synology-typescript-api";
import {
  errorMessageFromCode,
  errorMessageFromConnectionFailure,
  ErrorDomain,
} from "../common/apis/errors";
import { Response, Message, Result, DiscriminateUnion } from "../common/apis/messages";
import { addDownloadTasksAndPoll, pollTasks } from "./actions";
import { BackgroundState, getMutableStateSingleton } from "./backgroundState";

type MessageHandler<T extends Message, U extends Result[keyof Result]> = (
  m: T,
  state: BackgroundState,
) => Promise<U>;

type MessageHandlers = {
  [T in Message["type"]]: MessageHandler<DiscriminateUnion<Message, "type", T>, Result[T]>;
};

function convertResponse<T, U>(
  response: SynologyResponse<T> | ConnectionFailure,
  convert: (payload: T) => U,
  domain: ErrorDomain,
): Response<U> {
  if (isConnectionFailure(response)) {
    return {
      success: false,
      reason: errorMessageFromConnectionFailure(response),
    };
  } else if (!response.success) {
    return {
      success: false,
      reason: errorMessageFromCode(response.error.code, domain),
    };
  } else {
    return { success: true, value: convert(response.data) };
  }
}

const MESSAGE_HANDLERS: MessageHandlers = {
  "add-tasks": (m, state) => {
    return addDownloadTasksAndPoll(state.api, state.showNonErrorNotifications, m.urls, m.path);
  },
  "poll-tasks": (_m, state) => {
    return pollTasks(state.api);
  },
  "pause-task": async (m, state) => {
    const response = convertResponse(
      await state.api.DownloadStation.Task.Pause({ id: [m.taskId] }),
      () => undefined,
      "DownloadStation.Task",
    );
    if (response.success) {
      await pollTasks(state.api);
    }
    return response;
  },
  "resume-task": async (m, state) => {
    const response = convertResponse(
      await state.api.DownloadStation.Task.Resume({ id: [m.taskId] }),
      () => undefined,
      "DownloadStation.Task",
    );
    if (response.success) {
      await pollTasks(state.api);
    }
    return response;
  },
  "delete-tasks": async (m, state) => {
    const response = convertResponse(
      await state.api.DownloadStation.Task.Delete({ id: m.taskIds, force_complete: false }),
      () => undefined,
      "DownloadStation.Task",
    );
    if (response.success) {
      await pollTasks(state.api);
    }
    return response;
  },
  "list-directories": async (m, state) => {
    if (m.path) {
      return convertResponse(
        await state.api.FileStation.List.list({
          folder_path: m.path,
          sort_by: "name",
          filetype: "dir",
        }),
        (r) => r.files,
        "FileStation",
      );
    } else {
      return convertResponse(
        await state.api.FileStation.List.list_share({ sort_by: "name" }),
        (r) => r.shares,
        "FileStation",
      );
    }
  },
};

export function initializeMessageHandler() {
  browser.runtime.onMessage.addListener((m) => {
    if (Message.is(m)) {
      return MESSAGE_HANDLERS[m.type](m as any, getMutableStateSingleton());
    } else {
      console.error("received unhandleable message", m);
      return undefined;
    }
  });
}
