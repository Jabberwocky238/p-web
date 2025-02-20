import { Music, MusicActions, MusicParams } from ".";

export class RemoteMusicAdapter implements MusicActions {
    constructor(
        public uuid: string,
        // private apiBaseUrl: string
    ) { }

    async coverUrl() {
        // request to backend
        const data = await musicCover(this.uuid);
        return URL.createObjectURL(data);
    }

    async coverBlob() {
        // request to backend
        const data = await musicCover(this.uuid);
        return data;
    }

    async musicUrl() {
        // request to backend
        const data = await musicBlob(this.uuid);
        return URL.createObjectURL(data);
    }

    async musicBlob() {
        // request to backend
        const data = await musicBlob(this.uuid);
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
        location: "Remote",
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
            location: "Remote",
        } as MusicParams;
    });
}

async function musicCover(uuid: string) {
    const url = `${API_BASE_URL}/music/cover?uuid=${uuid}`;
    const res = await fetch(url, {
        method: 'GET',
    });
    const blob = await res.blob();
    return blob as File;
}

async function musicBlob(uuid: string) {
    const url = `${API_BASE_URL}/music/blob?uuid=${uuid}`;
    const res = await fetch(url, {
        method: 'GET',
    });
    const blob = await res.blob();
    return blob as File;
}

const API_BASE_URL = process.env.BACKEND_API;

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
