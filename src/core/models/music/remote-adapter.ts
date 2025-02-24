import { useDB } from "@/core/indexedDB";
import { Music, MUSIC_BLOB, MUSIC_COVER, MusicActions, MusicProperties } from ".";

const API_BASE_URL = process.env.BACKEND_API!;

export class RemoteMusicAdapter implements MusicActions {
    constructor(
        public uuid: string,
        public apiBaseUrl: string = API_BASE_URL
    ) { }

    async coverUrl() {
        // request to backend
        return await musicCoverUrl(this.apiBaseUrl, this.uuid);
    }

    async coverBlob() {
        // request to backend
        return await musicCover(this.apiBaseUrl, this.uuid);
    }

    async musicUrl() {
        // request to backend
        return await musicBlobUrl(this.apiBaseUrl, this.uuid);
    }

    async musicBlob() {
        // request to backend
        return await musicBlob(this.apiBaseUrl, this.uuid);
    }
}

export async function downloadMusic(uuid: string) {
    const url = `${API_BASE_URL}/music/metadata?uuid=${uuid}`;
    const res = await fetch(url, {
        method: 'GET',
    });
    const data = await res.json() as {
        uuid: string,
        title: string,
        thumbnail: string,
        properties: {
            [key: string]: string | string[];
        },
    }
    return {
        ...data,
        status: {
            local: false,
            remote: [API_BASE_URL],
        }
    } as MusicProperties;
}

export async function allRemoteMusic(api: string) {
    const url = `${api}/music/all`;
    const res = await fetch(url, {
        method: 'GET',
    })
    const data = await res.json() as {
        uuid: string,
        title: string,
        thumbnail: string,
        properties: string
    }[]
    const data2 = data.map(item => {
        item.properties = item.properties.replace(/\\/g, "")
        try {
            return {
                ...item,
                properties: JSON.parse(item.properties),
            }
        } catch (e) {
            return {
                ...item,
                properties: {},
            }
        }
    })
    return data2.map(item => {
        return {
            ...item,
            status: {
                local: false,
                remote: [api],
            }
        } as MusicProperties;
    });
}

async function musicCoverUrl(api: string, uuid: string) {
    return `${api}/music/cover?uuid=${uuid}`
}

async function musicCover(api: string, uuid: string) {
    const url = `${api}/music/cover?uuid=${uuid}`;
    const res = await fetch(url, {
        method: 'GET',
    });
    const blob = await res.blob();
    return blob as File;
}

async function musicBlobUrl(api: string, uuid: string) {
    return `${api}/music/blob?uuid=${uuid}`
}

async function musicBlob(api: string, uuid: string) {
    const url = `${api}/music/blob?uuid=${uuid}`;
    const res = await fetch(url, {
        method: 'GET',
    } as RequestInit);
    const blob = await res.blob();
    return blob as File;
}


