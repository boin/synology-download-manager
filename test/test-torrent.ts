import "mocha";
import bencodec from "bencodec";
import { expect } from "chai";
import * as fs from "fs";
import * as path from "path";
import {
  addTrackersToURL,
  addTrackersToMetaData,
  CachedTrackers,
} from "../src/background/actions/torrentTracker";
import { decode } from "magnet-uri";

const magUri =
  "magnet:?xt=urn:btih:36c67464c37a83478ceff54932b5a9bddea636f3&dn=ubuntu-20.04.1-live-server-amd64.iso&tr=https%3A%2F%2Ftorrent.ubuntu.com%2Fannounce&tr=https%3A%2F%2Fipv6.torrent.ubuntu.com%2Fannounce";

const newTrackers: CachedTrackers = ["http://1.2.3.4:1337/announce", "udp://4.3.2.1:2710/announce"];

describe("torrent metadata tracker modification", () => {
  const torrentRaw = fs.readFileSync(path.join(__dirname, "./test.torrent"));
  const torrent: any = bencodec.decode(torrentRaw);
  const oldTrackers = torrent["announce-list"].toString("utf8");

  const tmpFile = path.join(__dirname, "./tmp.torrent");
  fs.writeFileSync(tmpFile, addTrackersToMetaData(torrentRaw, newTrackers));
  const tmpTorrent: any = bencodec.decode(fs.readFileSync(tmpFile));

  it("modified torrent should contain old tracker", () => {
    expect(tmpTorrent["announce-list"].toString("utf8")).to.contains(oldTrackers);
  });

  it("modified torrent should contain new tracker", () => {
    expect(tmpTorrent["announce-list"].toString("utf8")).to.contains(newTrackers.join(","));
  });

  fs.unlinkSync(tmpFile);
});

describe("torrent magnet tracker modification", () => {
  const torrent = decode(magUri);
  const oldTrackers = torrent.announce || [];

  const tmpTorrent = decode(addTrackersToURL(magUri, newTrackers));
  const tmpTrackers = tmpTorrent.announce || [];

  it("modified magnet should contain old tracker", () => {
    expect(tmpTrackers.join(",")).to.contains(oldTrackers.join(","));
  });

  it("modified magnet should contain new tracker", () => {
    expect(tmpTrackers.join(",")).to.contains(newTrackers.join(","));
  });
});
