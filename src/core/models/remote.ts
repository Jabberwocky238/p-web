import { useDB } from "../indexedDB";

const REMOTE_METADATA = 'Remote'
export const objectStores = [REMOTE_METADATA] as const;

export type RemoteParams = {
    uuid: string;
    name: string;
    remoteUrl: string;
}

export class Remote {
    constructor(
        public uuid: string,
        public name: string,
        public remoteUrl: string,
    ) { }

    static fromParams(params: RemoteParams): Remote {
        const { uuid, name, remoteUrl } = params;
        return new Remote(uuid, name, remoteUrl);
    }

    static async fromUUID(_uuid: string): Promise<Remote | undefined> {
        const db = await useDB();
        const metadata = await db.create<RemoteParams>(REMOTE_METADATA).get(_uuid);
        if (!metadata) {
            return undefined;
        }
        return Remote.fromParams(metadata);
    }

    static async getAll(): Promise<Remote[]> {
        const db = await useDB();
        let metadata = await db.create<RemoteParams>(REMOTE_METADATA).getAll();

        if (metadata.length <= 1) {
            await DEFAULT_REMOTE.update();
            metadata = await db.create<RemoteParams>(REMOTE_METADATA).getAll();
        }

        return metadata.map(Remote.fromParams);
    }

    async update() {
        const db = await useDB();
        await db.create(REMOTE_METADATA).put(this.uuid, {
            uuid: this.uuid,
            name: this.name,
            remoteUrl: this.remoteUrl,
        });
    }

    async delete() {
        const db = await useDB();
        await db.create(REMOTE_METADATA).delete(this.uuid);
    }
}
export const DEFAULT_REMOTE_UUID = '00000000-0000-0000-0000-000000000000';
const DEFAULT_REMOTE = new Remote(DEFAULT_REMOTE_UUID, 'Default', process.env.BACKEND_API!);
