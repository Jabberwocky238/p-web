import { useDB } from "../indexedDB";

export interface MusicParams {
    readonly uuid: string,
    title: string,
    artist: string,
    album: string,
    readonly version: string,
}

function _MusicBuilder(data: MusicParams): Music {
    const { uuid, title, artist, album, version } = data;
    return new Music(uuid, title, artist, album, version);
}

const MUSIC_METADATA = 'MusicMetadata'
const MUSIC_COVER = 'MusicCover'
const MUSIC_BLOB = 'MusicBlob'

export const objectStores = [MUSIC_METADATA, MUSIC_COVER, MUSIC_BLOB] as const;

export class Music {
    constructor(
        public uuid: string,
        public title: string,
        public artist: string,
        public album: string,
        public version: string,
    ) { }

    static async fromUUID(uuid: string): Promise<Music | undefined> {
        const db = await useDB();
        const metadata = await db.create<MusicParams>(MUSIC_METADATA).getData(uuid);
        if (!metadata) {
            return undefined;
        }
        return _MusicBuilder(metadata);
    }

    static fromParams(params: MusicParams): Music {
        return _MusicBuilder(params);
    }

    static async getAllMusic(): Promise<Music[]> {
        const db = await useDB();
        const datas = await db.create(MUSIC_METADATA).getAllData() as MusicParams[];
        return datas.map(_MusicBuilder);
    }

    async dumpToDB(file: File, cover?: File | null) {
        const db = await useDB();
        await db.create(MUSIC_METADATA).putData(this.uuid, {
            title: this.title,
            artist: this.artist,
            album: this.album,
            version: this.version,
        });
        await db.create(MUSIC_COVER).putData(this.uuid, {
            ty: cover ? "blob" : "string",
            cover: cover ? cover : "/default-album-pic.jfif",
        });
        await db.create(MUSIC_BLOB).putData(this.uuid, {
            blob: file,
        });
    }

    async getSrc(): Promise<string> {
        const db = await useDB();
        const data = await db.create(MUSIC_BLOB).getData(this.uuid) as {
            blob: Blob,
        };
        return URL.createObjectURL(data.blob);
    }

    async getSrcFile(): Promise<File> {
        const db = await useDB();
        const data = await db.create(MUSIC_BLOB).getData(this.uuid) as {
            blob: File,
        };
        return data.blob;
    }

    async getCoverSrc(): Promise<string> {
        const db = await useDB();
        const blob = await db.create(MUSIC_COVER).getData(this.uuid) as {
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

    async getCoverFile(): Promise<File> {
        const db = await useDB();
        const blob = await db.create(MUSIC_COVER).getData(this.uuid) as {
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
}
