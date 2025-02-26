import { useDB } from "@/core/indexedDB";
import { Music, MUSIC_BLOB, MUSIC_COVER, MUSIC_METADATA } from ".";
import { checkRemoteExist, uploadMusic } from "./api";
import { blobToBase64, cropAndResizeImage } from "./utils";
import { LOCAL_PLAYLIST_UUID, Playlist } from "../playlist";

export class CacheControl {
    constructor(
        public music: Music,
    ) { }

    async clear() {
        const db = await useDB();
        await db.create(MUSIC_BLOB).delete(this.music.uuid);
        await db.create(MUSIC_COVER).delete(this.music.uuid);

        this.music.status.local = false;
        await this.music.dumpToDB();

        // 清理出local playlist
        const LOCAL_PLAYLIST = await Playlist.fromUUID(LOCAL_PLAYLIST_UUID);
        await LOCAL_PLAYLIST!.delMusic(this.music.uuid);
        await LOCAL_PLAYLIST!.update();
    }
    async cache() {
        // console.log("cache start")
        const db = await useDB();
        const musicBlob = await this.music.adapter().musicBlob();
        const coverBlob = await this.music.adapter().coverBlob();
        await db.create(MUSIC_BLOB).put(this.music.uuid, {
            blob: musicBlob
        });
        await db.create(MUSIC_COVER).put(this.music.uuid, {
            ty: "blob",
            cover: coverBlob,
        });
        // console.log("cache start")
        const thumbnailFile = await cropAndResizeImage(coverBlob);
        // console.log("cache start")
        const thumbnail = await blobToBase64(thumbnailFile);
        // console.log("cache 333")
        this.music.thumbnail = thumbnail;
        this.music.status.local = true;
        await this.music.dumpToDB();
        // console.log("cache 2222")
        // 加入local playlist
        // console.log("LOCAL_PLAYLIST")
        const LOCAL_PLAYLIST = await Playlist.fromUUID(LOCAL_PLAYLIST_UUID);
        await LOCAL_PLAYLIST!.addMusic(this.music.uuid);
        await LOCAL_PLAYLIST!.update();
        // console.log("cache end")
    }

    async upload(api: string) {
        const { status: exist } = await checkRemoteExist(api, this.music.uuid);
        const data = await uploadMusic(api, this.music, exist);
        if (!exist) {
            this.music.status.remote.push(api);
            await this.music.dumpToDB();
        }
        return data;
    }
}

