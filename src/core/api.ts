export async function getPlaylist(uuid: string) {
    const res = await fetch(`http://localhost:23891/music/playlist?uuid=${uuid}`, {
        method: 'GET',
    });
    let data: {
        uuid: string;
        title: string;
        accessTime: string;
        musics: {
            uuid: string;
            title: string;
            artist: string;
            uploader: string;
            coverUrl: string;
        }[];
    } = await res.json();

    return data;
}


export async function getMusicBlobUrl(uuid: string) {
    const res = await fetch(`http://localhost:23891/music/blob?uuid=${uuid}`)
    const data = await res.json();
    return data.url as string;
}

