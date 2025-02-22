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

export class MusicBuilder {
    params: Partial<MusicProperties>;
    blob?: File;
    cover?: File;

    private constructor(uuid: string) {
        this.params = {
            uuid: uuid,
            properties: {},
        }
    }

    static async make(uuid: string) {
        const db = await useDB();
        const metadata = await db.create<MusicProperties>(MUSIC_METADATA).get(uuid);
        const builder = new MusicBuilder(uuid);
        if (!metadata) {
            return builder
        }
        const blob = await db.create(MUSIC_BLOB).get(uuid) as {
            blob: File;
        };
        const cover = await db.create(MUSIC_COVER).get(uuid) as {
            ty: "blob" | "string",
            cover: File | string,
        }
        return builder
            .setTitle(metadata.title)
            .setThumbnail(metadata.thumbnail!)
            .setStatus(metadata.status)
            .setProperties(metadata.properties)
            .setBlob(blob.blob)
            .setCover(cover.ty === "blob" ? cover.cover as File : undefined);
    }
    static load(params: MusicProperties) {
        const builder = new MusicBuilder(params.uuid);
        return builder
            .setTitle(params.title)
            .setThumbnail(params.thumbnail)
            .setStatus(params.status)
            .setProperties(params.properties);
    }

    setTitle(title: string) {
        this.params.title = title;
        return this;
    }
    setThumbnail(thumbnail: string) {
        this.params.thumbnail = thumbnail;
        return this;
    }
    setStatus(status: { local: boolean; remote: string[]; }) {
        this.params.status = status;
        return this;
    }
    setBlob(blob: File) {
        this.blob = blob;
        return this;
    }
    setCover(cover?: File) {
        this.cover = cover;
        return this;
    }

    addProperty(key: string, value: string | string[]) {
        if (!this.params.properties) {
            this.params.properties = {};
        }
        this.params.properties[key] = value;
        return this;
    }
    delProperty(key: string) {
        if (!this.params.properties) {
            return this;
        }
        delete this.params.properties[key];
        return this;
    }
    setProperties(properties: { [key: string]: string | string[] }) {
        this.params.properties = properties;
        return this;
    }

    validate() {
        console.log(this);
        if (!this.params.uuid) {
            throw new Error("uuid is required");
        }
        if (!this.params.title) {
            throw new Error("title is required");
        }
        if (!this.params.status) {
            throw new Error("status is required");
        }
    }
    build() {
        this.validate();
        const music = new Music(
            this.params.uuid!,
            this.params.title!,
            this.params.thumbnail!,
            this.params.properties!,
            this.params.status!,
        );
        return { music, blob: this.blob, cover: this.cover };
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

