import { useDB } from "../indexedDB";

export type PlaylistParams = {
    uuid: string;
    title: string;
    contains: string[];
}

const PLAYLIST_METADATA = 'PlaylistMetadata'
export const objectStores = [PLAYLIST_METADATA] as const;

export class Playlist {
    constructor(
        public uuid: string,
        public title: string,
        public contains: string[],
    ) { }

    static fromParams(params: PlaylistParams): Playlist {
        const { uuid, title, contains } = params;
        return new Playlist(uuid, title, contains);
    }

    static async fromUUID(_uuid: string): Promise<Playlist | undefined> {
        const db = await useDB();
        const metadata = await db.create<PlaylistParams>(PLAYLIST_METADATA).get(_uuid);
        if (!metadata) {
            return undefined;
        }
        return Playlist.fromParams(metadata);
    }

    static async getAll(): Promise<Playlist[]> {
        const db = await useDB();
        const metadata = await db.create<PlaylistParams>(PLAYLIST_METADATA).getAll();
        return metadata.map(Playlist.fromParams);
    }

    async dumpToDB() {
        const db = await useDB();
        await db.create(PLAYLIST_METADATA).put(this.uuid, {
            uuid: this.uuid,
            title: this.title,
            contains: this.contains,
        });
    }
}
