import { useDB } from "../indexedDB";
import { allRemoteMusic, downloadMusic, RemoteMusicAdapter } from "./musicAdapters/remoteMusicAdapter";

export type MusicLocation = "Local" | "Remote";

export interface MusicParams {
    uuid: string,
    title: string,
    artist: string,
    album: string,
    version: string,
    thumbUrl: string,
    location: MusicLocation,
}

export interface MusicActions {
    coverUrl(): Promise<string>,
    coverBlob(): Promise<File>,
    musicUrl(): Promise<string>,
    musicBlob(): Promise<File>,
}

// async function fillEmptyMusicParams(params: Partial<MusicParams>, adapter?: MusicActions) {
//     let missing = false;
//     if (!params.thumbUrl) {
//         missing = true;
//         let localadapter: LocalMusicAdapter;
//         if (adapter) {
//             localadapter = adapter as LocalMusicAdapter;
//         } else {
//             localadapter = new LocalMusicAdapter(params.uuid || "");
//         }
//         const coverBlob = await localadapter.coverBlob();
//         const cover = await cropAndResizeImage(coverBlob);
//         const thumbUrl = await blobToBase64(cover);
//         params.thumbUrl = thumbUrl;
//     }
//     if (!params.location) {
//         missing = true;
//         params.location = "Local";
//     }
//     const res = {
//         uuid: params.uuid || "",
//         title: params.title || "",
//         artist: params.artist || "",
//         album: params.album || "",
//         version: params.version || "",
//         thumbUrl: params.thumbUrl,
//         location: params.location,
//     } as MusicParams;
//     return {
//         metadata_filled: res,
//         missing,
//     }
// }

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

    static async fromLocalUUID(uuid: string): Promise<Music | undefined> {
        const db = await useDB();
        let metadata = await db.create<MusicParams>(MUSIC_METADATA).getData(uuid);
        if (!metadata) {
            return undefined;
        }
        // let { metadata_filled: metadata, missing } = await fillEmptyMusicParams(metadata);
        const adapter = new LocalMusicAdapter(uuid);
        const music = new Music(metadata, adapter);
        // if (missing) {
        //     await music.dumpToDB(await music.musicBlob(), await music.coverBlob());
        // }
        return music;
    }

    static async fromParams(params: MusicParams): Promise<Music> {
        // console.log(params);
        switch (params.location) {
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
        const datas = await db.create(MUSIC_METADATA).getAllData() as any[];
        return datas.map(data => {
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

    async dumpToDB(file: File, cover?: File | null) {
        const db = await useDB();
        // if this.params.thumbUrl is empty, then fill it with cover
        let thumbUrl;
        if (!this.params.thumbUrl) {
            thumbUrl = cover ? await blobToBase64(await cropAndResizeImage(cover)) : "/default-album-pic.jfif";
        } else {
            thumbUrl = this.params.thumbUrl;
        }
        await db.create(MUSIC_METADATA).putData(this.params.uuid, {
            title: this.params.title,
            artist: this.params.artist,
            album: this.params.album,
            version: this.params.version,
            thumbUrl: thumbUrl,
            location: 'Local',
        });
        await db.create(MUSIC_COVER).putData(this.params.uuid, {
            ty: cover ? "blob" : "string",
            cover: cover ? cover : "/default-album-pic.jfif",
        });
        await db.create(MUSIC_BLOB).putData(this.params.uuid, {
            blob: file,
        });
    }

    async upload() {
        const { uuid, exist } = await checkRemoteExist(this.uuid);
        if (exist) {
            return {
                status: 204,
            }
        }
        const data = await uploadMusic(this);
        return data;
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



class LocalMusicAdapter implements MusicActions {
    constructor(public uuid: string) { }

    async coverUrl() {
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

    async coverBlob() {
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

    async musicUrl() {
        const db = await useDB();
        const data = await db.create(MUSIC_BLOB).getData(this.uuid) as {
            blob: Blob,
        };
        return URL.createObjectURL(data.blob);
    }

    async musicBlob() {
        const db = await useDB();
        const data = await db.create(MUSIC_BLOB).getData(this.uuid) as {
            blob: File,
        };
        return data.blob;
    }
}



async function cropAndResizeImage(file: File): Promise<File> {
    // 创建图片对象
    const img = new Image();
    img.src = URL.createObjectURL(file);

    await new Promise((resolve) => (img.onload = resolve));

    // 计算裁剪区域
    const size = Math.min(img.width, img.height);
    const x = (img.width - size) / 2;
    const y = (img.height - size) / 2;

    // 创建 Canvas 并绘制
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;

    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(
        img,
        x, y,         // 源图像裁剪起始点
        size, size,   // 源图像裁剪区域
        0, 0,         // Canvas 绘制起始点
        400, 400      // Canvas 绘制尺寸
    );

    // 转为 Blob（可上传或展示）
    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            const f = new File([blob!], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
            });
            resolve(f);
        }, 'image/jpeg', 0.9);
    });
}

async function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}
const API_BASE_URL = process.env.BACKEND_API;

async function checkRemoteExist(uuid: string) {
    const url = `${API_BASE_URL}/music/exists?uuid=${uuid}`;
    const res = await fetch(url, {
        method: 'GET',
    });
    const data: {
        uuid: string,
        exist: boolean,
    } = await res.json();
    return data
}

async function uploadMusic(music: Music) {
    const formData = new FormData();

    const musicBlob = await music.musicBlob();
    const coverBlob = await music.coverBlob();

    formData.append('uuid', music.uuid);
    formData.append('title', music.title);
    formData.append('artist', music.artist);
    formData.append('album', music.album);
    formData.append('thumbUrl', music.thumbUrl);
    formData.append('version', music.version);
    formData.append('musicBlob', musicBlob);
    formData.append('coverBlob', coverBlob);

    const url = `${API_BASE_URL}/music/upload`;
    const res = await fetch(url, {
        method: 'POST',
        body: formData,
    });
    const data = await res.json();
    return {
        uuid: data.uuid,
        status: res.status,
    }
}
