import { useDB } from "../../indexedDB";
import { LocalMusicAdapter } from "./local-adapter";
import { allRemoteMusic, checkRemoteExist, downloadMusic, RemoteMusicAdapter, uploadMusic } from "./remote-adapter";
import { blobToBase64, cropAndResizeImage } from "./utils";

export type MusicLocation = {
    ty: "Local" | "Remote",
    apiBaseUrl?: string
}

export interface MusicParams {
    uuid: string,
    title: string,
    artist: string,
    album: string,
    version: string,
    thumbUrl: string,
    location: MusicLocation,
    properties: {
        [key: string]: string,
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

export class Music implements MusicActions, MusicParams {
    uuid: string;
    title: string;
    artist: string;
    album: string;
    version: string;
    thumbUrl: string;
    location: MusicLocation;
    properties: {
        [key: string]: string;
    } = {};

    constructor(
        private params: MusicParams,
        private adapter: MusicActions
    ) {
        this.uuid = params.uuid;
        this.title = params.title;
        this.artist = params.artist;
        this.album = params.album;
        this.version = params.version;
        this.thumbUrl = params.thumbUrl;
        this.location = params.location;
    }

    static async fromUUID(uuid: string): Promise<Music | undefined> {
        const db = await useDB();
        let metadata = await db.create<MusicParams>(MUSIC_METADATA).getData(uuid);
        if (!metadata) {
            return undefined;
        }
        // let { metadata_filled: metadata, missing } = await fillEmptyMusicParams(metadata);
        let adapter: MusicActions;
        if (metadata.location.ty === 'Local') {
            adapter = new LocalMusicAdapter(uuid);
        } else if (metadata.location.ty === 'Remote') {
            adapter = new RemoteMusicAdapter(uuid, metadata.location.apiBaseUrl ?? process.env.BACKEND_API);
        } else {
            throw new Error("Unknown location");
        }
        return new Music(metadata, adapter);
    }

    static async fromParams(params: MusicParams): Promise<Music> {
        // console.log(params);
        switch (params.location.ty) {
            case "Local": {
                const adapter = new LocalMusicAdapter(params.uuid);
                // let { metadata_filled: params, missing } = await fillEmptyMusicParams(params, adapter);
                const music = new Music(params, adapter);
                // if (missing) {
                //     await music.dumpToDB(await music.musicBlob(), await music.coverBlob());
                // }
                return music;
            }
            case "Remote": {
                const adapter = new RemoteMusicAdapter(params.uuid);
                return new Music(params, adapter);
            }
            default:
                throw new Error("Unknown location");
        }
    }

    static async getAllLocalMusic(): Promise<Music[]> {
        const db = await useDB();
        const datas = await db.create(MUSIC_METADATA).getAllData() as MusicParams[];

        // 对所有data.location为字符串的进行二次清洗
        datas.forEach(data => {
            if (typeof data.location === 'string') {
                data.location = {
                    ty: data.location,
                }
                Music.fromParams(data).then(music => {
                    music.register();
                })
            }
        })

        return datas.filter(data => {
            return data.location.ty === 'Local'
        })
            .map(data => {
                const adapter = new LocalMusicAdapter(data.uuid);
                return new Music(data, adapter)
            });
    }

    static async getAllRemoteMusic(): Promise<Music[]> {
        const params = await allRemoteMusic();
        return params.map(param => {
            const adapter = new RemoteMusicAdapter(param.uuid);
            return new Music(param, adapter);
        });
    }

    async register(ty: "Remote" | "Local" = "Local") {
        const db = await useDB();
        await db.create(MUSIC_METADATA).putData(this.params.uuid, {
            title: this.params.title,
            artist: this.params.artist,
            album: this.params.album,
            version: this.params.version,
            thumbUrl: this.params.thumbUrl,
            location: {
                ty: this.params.location.ty ?? ty,
            },
            properties: {}
        } satisfies Omit<MusicParams, 'uuid'>);
    }

    async dumpToDB(file: File, cover?: File | null) {
        const db = await useDB();
        // if this.params.thumbUrl is empty, then fill it with cover
        await db.create(MUSIC_METADATA).putData(this.params.uuid, {
            title: this.params.title,
            artist: this.params.artist,
            album: this.params.album,
            version: this.params.version,
            thumbUrl: this.params.thumbUrl,
            location: {
                ty: 'Local',
            },
            properties: {}
        } satisfies Omit<MusicParams, 'uuid'>);
        await db.create(MUSIC_COVER).putData(this.params.uuid, {
            ty: cover ? "blob" : "string",
            cover: cover ? cover : "/default-album-pic.jfif",
        });
        await db.create(MUSIC_BLOB).putData(this.params.uuid, {
            blob: file,
        });
    }

    async musicUrl(): Promise<string> {
        return this.adapter.musicUrl();
    }
    async musicBlob(): Promise<File> {
        return this.adapter.musicBlob();
    }
    async coverUrl(): Promise<string> {
        return this.adapter.coverUrl();
    }
    async coverBlob(): Promise<File> {
        return this.adapter.coverBlob();
    }
}

