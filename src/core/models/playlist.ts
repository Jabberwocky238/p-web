import { useDB } from "../indexedDB";
import { Music, MUSIC_METADATA, MusicParams } from "./music";

export interface PlaylistParams {
    readonly uuid: string,
    name: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly version: string,
    contains: string[],
}

function _PlaylistBuilder(data: PlaylistParams): Playlist {
    const { uuid, name, createdAt, updatedAt, version, contains } = data;
    return new Playlist(uuid, name, createdAt, updatedAt, version, contains);
}

const PLAYLIST_METADATA = 'PlaylistMetadata'

export const objectStores = [PLAYLIST_METADATA] as const;

export class Playlist {
    constructor(
        public uuid: string,
        public name: string,
        public createdAt: Date,
        public updatedAt: Date,
        public version: string,
        public contains: string[],
    ) { }

    static async fromUUID(uuid: string): Promise<Playlist | undefined> {
        const db = await useDB();
        const metadata = await db.create<PlaylistParams>(PLAYLIST_METADATA).get(uuid);
        if (!metadata) {
            return undefined;
        }
        return _PlaylistBuilder(metadata);
    }

    static async loadLocal(): Promise<Music[]> {
        const db = await useDB();
        const metadata = await db.create<MusicParams>(MUSIC_METADATA).getAll();
        const musicList = [];
        for (const data of metadata) {
            const music = await Music.fromParams(data);
            musicList.push(music);
        }
        return musicList;
    }

    static fromParams(params: PlaylistParams): Playlist {
        return _PlaylistBuilder(params);
    }

    static async getAll(): Promise<Playlist[]> {
        const db = await useDB();
        const metadata = await db.create<PlaylistParams>(PLAYLIST_METADATA).getAll();
        return metadata.map(_PlaylistBuilder);
    }

    async dumpToDB() {
        const db = await useDB();
        await db.create(PLAYLIST_METADATA).put(this.uuid, {
            name: this.name,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            version: this.version,
            contains: this.contains,
        });
    }
}
