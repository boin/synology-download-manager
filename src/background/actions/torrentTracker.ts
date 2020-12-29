import Axios from "axios";
import bencodec from "bencodec";
import { startsWithAnyProtocol, MAGNET_PROTOCOL } from "../../common/apis/protocols";

export type CachedTrackers = string[];

export async function updateRemoteTrackers(url: string): Promise<CachedTrackers> {
  let response, cachedTrackers;

  try {
    response = await Axios.get(url, { timeout: 10000 });
  } catch (e) {
    console.log("Axios Error caught when updating public trackers:", e);
    return [];
  }

  const trackerText: string = response?.data?.toString();

  if (trackerText !== "") {
    if (trackerText.includes(",")) {
      cachedTrackers = trackerText.split(",");
    } else if (trackerText.includes("\n\n")) {
      cachedTrackers = trackerText.split("\n\n");
    } else {
      cachedTrackers = trackerText.split("\n");
    }
    console.log(`successfully updated ${cachedTrackers.length} public trackers`);
    return cachedTrackers;
  }

  return [];
}

export function addTrackersToURL(url: string, trackers: CachedTrackers): string {
  if (startsWithAnyProtocol(url, MAGNET_PROTOCOL)) {
    trackers.some((t, i) => {
      if (i >= 50) return true; // make sure uri is not too large
      url += "&tr=" + encodeURIComponent(t);
      return false;
    });
  }
  return url;
}

export function addTrackersToMetaData(metaData: Buffer, trackers: CachedTrackers) {
  const torrent: any = bencodec.decode(metaData);
  trackers.forEach((t) => {
    torrent["announce-list"].push([Buffer.from(t, "utf8")]);
  });
  return bencodec.encode(torrent);
}
