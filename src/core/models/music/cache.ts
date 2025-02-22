import { useDB } from "@/core/indexedDB";
import { Music, MUSIC_BLOB, MUSIC_COVER } from ".";
import { checkRemoteExist, uploadMusic } from "./api";

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
    }
    async cache() {
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

        this.music.status.local = true;
        await this.music.dumpToDB();
    }

    async upload(api: string) {
        const { uuid, exist } = await checkRemoteExist(api, this.music.uuid);
        const data = await uploadMusic(api, this.music, exist ? true : false);
        if (!exist) {
            this.music.status.remote.push(api);
            await this.music.dumpToDB();
        }
        return data;
    }
}

