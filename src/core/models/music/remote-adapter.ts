import { Music, MusicActions, MusicParams } from ".";

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

    static async upload(music: Music) {
        const { uuid, exist } = await checkRemoteExist(music.uuid);
        if (exist) {
            return {
                status: 204,
            }
        }
        const data = await uploadMusic(music);
        return data;
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
        artist: string,
        album: string,
        thumbUrl: string,
    }
    return {
        ...data,
        version: "1.0.0",
        location: {
            ty: "Remote",
            apiBaseUrl: API_BASE_URL,
        },
    } as MusicParams;
}

export async function allRemoteMusic() {
    const url = `${API_BASE_URL}/music/all`;
    const res = await fetch(url, {
        method: 'GET',
    });
    const data = await res.json() as {
        uuid: string,
        title: string,
        artist: string,
        album: string,
        thumbUrl: string,
    }[]
    return data.map(item => {
        return {
            ...item,
            version: "1.0.0",
            location: {
                ty: "Remote",
                apiBaseUrl: API_BASE_URL,
            }
        } as MusicParams;
    });
}

async function musicCoverUrl(api: string, uuid: string) {
    return `${api}/music/cover?uuid=${uuid}`
}

async function musicCover(api: string, uuid: string) {
    const url = `${api}/music/cover?uuid=${uuid}`;
    const res = await fetch(url, {
        method: 'GET',
        mode: "cors",
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
        mode: "cors",
    } as RequestInit);
    const blob = await res.blob();
    return blob as File;
}



export async function checkRemoteExist(uuid: string) {
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

export async function uploadMusic(music: Music) {
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
