import { Music } from ".";

export async function uploadMusic(api: string, music: Music, onlyMetadata: boolean = false) {
    const formData = new FormData();

    formData.append('uuid', music.uuid);
    formData.append('title', music.title);
    formData.append('thumbnail', music.thumbnail);
    const stringifyProperties = JSON.stringify({
        ...music.properties
    });
    console.log(music.properties, stringifyProperties.replace(/"/g, "\""));
    formData.append('properties', stringifyProperties.replace(/"/g, "\""));

    if (!onlyMetadata) {
        const adapter = music.adapter()
        const musicBlob = await adapter.musicBlob();
        const coverBlob = await adapter.coverBlob();
        formData.append('musicBlob', musicBlob);
        formData.append('coverBlob', coverBlob);
    }

    const url = `${api}/music/upload`;
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

export async function checkRemoteExist(api: string, uuid: string) {
    const url = `${api}/music/exists?uuid=${uuid}`;
    const res = await fetch(url, {
        method: 'GET',
    });
    const data: {
        status: boolean,
    } = await res.json();
    return data
}


