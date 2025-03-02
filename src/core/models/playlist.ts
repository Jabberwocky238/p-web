import { useDB } from "../indexedDB";
import { Music, MUSIC_METADATA, MusicProperties } from "./music";

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

    static async getAllPlaylist(): Promise<Playlist[]> {
        const db = await useDB();
        let metadata = await db.create<PlaylistParams>(PLAYLIST_METADATA).getAll();
        if (metadata.length <= 1) {
            await Playlist.initDefaults();
            metadata = await db.create<PlaylistParams>(PLAYLIST_METADATA).getAll();
        }
        return metadata.map(Playlist.fromParams);
    }

    static async initDefaults() {
        const db = await useDB();
        const l = await db.create<PlaylistParams>(PLAYLIST_METADATA).get(LOCAL_PLAYLIST.uuid)
        if (!l) {
            await LOCAL_PLAYLIST.update();
        }
        const h = await db.create<PlaylistParams>(PLAYLIST_METADATA).get(HEART_PLAYLIST.uuid)
        if (!h) {
            await HEART_PLAYLIST.update();
        }
        const t = await db.create<PlaylistParams>(PLAYLIST_METADATA).get(TEMP_PLAYLIST.uuid)
        if (!t) {
            await TEMP_PLAYLIST.update();
        }
    }

    async getAllMusic(): Promise<Music[]> {
        const db = await useDB();
        const datas = [];
        for (const uuid of this.contains) {
            const metadata = await db.create<MusicProperties>(MUSIC_METADATA).get(uuid);
            if (metadata) {
                datas.push(metadata);
            }
        }
        return datas.map(Music.fromParams);
    }

    async addMusic(uuid: string) {
        // check exist
        if (this.contains.includes(uuid)) {
            console.warn(`music ${uuid} already in playlist ${this.uuid}`);
            return;
        }
        const music = await Music.fromUUID(uuid);
        if (!music) {
            console.warn(`music ${uuid} not found`);
            return;
        }
        this.contains.push(uuid);
        console.log(`music ${uuid} add to playlist ${this.uuid} suceeded`);
        await this.update();
    }
    async addMusics(uuids: string[]) {
        // check exist
        // 查找不存在的部分
        const notExist = uuids.filter(uuid => !this.contains.includes(uuid));
        for (const uuid of notExist) {
            const music = await Music.fromUUID(uuid);
            if (!music) {
                console.warn(`music ${uuid} not found`);
                return;
            }
            this.contains.push(uuid);
        }
        console.log(`${notExist.length} musics add to playlist ${this.uuid} suceeded`);
        await this.update();
    }
    async setMusics(uuids: string[]) {
        this.contains = uuids;
        await this.update();
    }
    async delMusic(uuid: string) {
        const index = this.contains.indexOf(uuid);
        if (index === -1) {
            return;
        }
        this.contains.splice(index, 1);
        await this.update();
    }

    async update() {
        const db = await useDB();
        await db.create(PLAYLIST_METADATA).put(this.uuid, {
            uuid: this.uuid,
            title: this.title,
            contains: this.contains,
        });
    }
    async delete() {
        const db = await useDB();
        await db.create(PLAYLIST_METADATA).delete(this.uuid);
    }
}

export const LOCAL_PLAYLIST_UUID = '00000000-0000-0000-0000-000000000000';
const LOCAL_PLAYLIST = new Playlist(LOCAL_PLAYLIST_UUID, 'Local', []);

export const HEART_PLAYLIST_UUID = 'ffffffff-ffff-ffff-ffff-ffffffffffff';
const HEART_PLAYLIST = new Playlist(HEART_PLAYLIST_UUID, 'Heart', []);

export const TEMP_PLAYLIST_UUID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const TEMP_PLAYLIST = new Playlist(TEMP_PLAYLIST_UUID, 'Temp', []);
