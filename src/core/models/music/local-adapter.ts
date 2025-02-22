import { useDB } from "@/core/indexedDB";
import { Music, MUSIC_BLOB, MUSIC_COVER, MUSIC_METADATA, MusicActions, MusicProperties } from ".";

export class LocalMusicAdapter implements MusicActions {
    constructor(public uuid: string) { }

    async coverUrl() {
        const db = await useDB();
        const blob = await db.create(MUSIC_COVER).get(this.uuid) as {
            ty: string,
            cover: File | string,
        };
        if (blob.ty === "string") {
            return blob.cover as string;
        } else if (blob.ty === "blob") {
            return URL.createObjectURL(blob.cover as Blob);
        } else {
            return "/default-album-pic.jfif";
        }
    }

    async coverBlob() {
        const db = await useDB();
        const blob = await db.create(MUSIC_COVER).get(this.uuid) as {
            ty: string,
            cover: File | string,
        };
        if (blob.ty === "string") {
            const coverBlob = await fetch(blob.cover as string).then(res => res.blob());
            return coverBlob as File;
        } else if (blob.ty === "blob") {
            return blob.cover as File;
        } else {
            const coverBlob = await fetch("/default-album-pic.jfif").then(res => res.blob());
            return coverBlob as File;
        }
    }

    async musicUrl() {
        const db = await useDB();
        const data = await db.create(MUSIC_BLOB).get(this.uuid) as {
            blob: Blob,
        };
        return URL.createObjectURL(data.blob);
    }

    async musicBlob() {
        const db = await useDB();
        const data = await db.create(MUSIC_BLOB).get(this.uuid) as {
            blob: File,
        };
        return data.blob;
    }


    static async deleteCache(uuid: string) {
        const db = await useDB();
        const music = await db.create(MUSIC_METADATA).get(uuid) as MusicProperties;
        if (!music) {
            return;
        }
        const music_ = Music.fromParams(music);
        music_.status.local = false;
        await music_.dumpToDB();

        await db.create(MUSIC_BLOB).delete(uuid);
        await db.create(MUSIC_COVER).delete(uuid);
    }
}

