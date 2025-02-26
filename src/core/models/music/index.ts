import { useDB } from "../../indexedDB";
import { LocalMusicAdapter } from "./local-adapter";
import { allRemoteMusic, RemoteMusicAdapter } from "./remote-adapter";
import { blobToBase64, cropAndResizeImage } from "./utils";

export interface MusicProperties {
    uuid: string,
    title: string,
    thumbnail: string,
    properties: {
        [key: string]: string | string[],
    }
    status: {
        local: boolean,
        remote: string[],
    }
}
export const DEFAULT_THUMBNAIL = "/default-album-pic.jfif";

export interface MusicActions {
    coverUrl(): Promise<string>,
    coverBlob(): Promise<File>,
    musicUrl(): Promise<string>,
    musicBlob(): Promise<File>,
}

export const MUSIC_METADATA = 'MusicMetadata'
export const MUSIC_COVER = 'MusicCover'
export const MUSIC_BLOB = 'MusicBlob'

export const objectStores = [MUSIC_METADATA, MUSIC_COVER, MUSIC_BLOB] as const;

export class Music implements MusicProperties {
    constructor(
        public uuid: string,
        public title: string,
        public thumbnail: string,
        public properties: { [key: string]: string | string[]; },
        public status: { local: boolean; remote: string[]; },
    ) { }

    static fromParams(params: MusicProperties) {
        return new Music(
            params.uuid,
            params.title,
            params.thumbnail,
            params.properties,
            params.status,
        );
    }

    static async fromUUID(uuid: string): Promise<Music | undefined> {
        const db = await useDB();
        let metadata = await db.create<MusicProperties>(MUSIC_METADATA).get(uuid);
        if (!metadata) {
            return undefined;
        }
        return Music.fromParams(metadata);
    }

    async dumpToDB() {
        const db = await useDB();
        await db.create(MUSIC_METADATA).put(this.uuid, {
            title: this.title,
            status: this.status,
            thumbnail: this.thumbnail,
            properties: this.properties
        } satisfies Omit<MusicProperties, 'uuid'>);
    }

    static async getAllLocalMusic(): Promise<Music[]> {
        const db = await useDB();
        const datas = await db.create<MusicProperties>(MUSIC_METADATA).getAll();

        return datas
            .filter(data => data.status.local)
            .map(data => {
                return Music.fromParams(data);
            })
    }

    static async getAllRemoteMusic(api: string): Promise<Music[]> {
        const datas = await allRemoteMusic(api)
        console.log(datas);
        return datas.map(data => {
            return Music.fromParams(data);
        })
    }

    adapter(): MusicActions {
        if (this.status.local) {
            return new LocalMusicAdapter(this.uuid);
        } else {
            const apiBaseUrl = this.status.remote[0];
            return new RemoteMusicAdapter(this.uuid, apiBaseUrl);
        }
    }
}

export async function importMusicTransaction(music: Music, blob: File, cover?: File) {
    const db = await useDB();
    // if this.params.thumbUrl is empty, then fill it with cover
    let thumbnail = music.thumbnail;
    if (cover) {
        const thumbnailBlob = await cropAndResizeImage(cover);
        thumbnail = await blobToBase64(thumbnailBlob);
    }
    await db.create(MUSIC_METADATA).put(music.uuid, {
        title: music.title,
        status: music.status,
        thumbnail: thumbnail,
        properties: music.properties
    } satisfies Omit<MusicProperties, 'uuid'>);
    await db.create(MUSIC_COVER).put(music.uuid, {
        ty: cover ? "blob" : "string",
        cover: cover ? cover : "/default-album-pic.jfif",
    });
    await db.create(MUSIC_BLOB).put(music.uuid, {
        blob: blob,
    });
}

