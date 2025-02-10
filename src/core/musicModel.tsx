
interface MusicBuilderParams {
    uuid: string,
    title: string,
    artist: string,
    album: string,
    version: string,
    file: File,
    cover: File | string,
}

export function MusicBuilder(data: MusicBuilderParams): Music {
    const { uuid, title, artist, album, version, file, cover } = data;
    return new Music(uuid, title, artist, album, version, file, cover);
}

export class Music {
    constructor(
        public uuid: string,
        public title: string,
        public artist: string,
        public album: string,
        public version: string,
        public file: File,
        public cover: File | string,
    ) { }
}
