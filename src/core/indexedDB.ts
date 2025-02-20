import { IDBPDatabase, openDB } from 'idb';

import { objectStores as music_objectStores } from './models/music';
import { objectStores as playlist_objectStores } from './models/playlist';

var instance: IDBwarpper;

const upgradeTasks = [
    (db: IDBPDatabase) => {
        for (const store of music_objectStores) {
            db.createObjectStore(store, { keyPath: 'uuid' });
        }
        for (const store of playlist_objectStores) {
            db.createObjectStore(store, { keyPath: 'uuid' });
        }
    },
];

export async function useDB() {
    if (instance) {
        // console.log('instance', instance);
        return instance;
    }
    const db = await openDB('myDatabase', 1, {
        upgrade(db, oldVersion, newVersion, transaction) {
            console.log('upgrade', oldVersion, newVersion);
            if (!newVersion) {
                return;
            }
            console.log('upgrade', oldVersion, newVersion);
            for (let i = oldVersion; i < newVersion; i++) {
                try {
                    upgradeTasks[i](db);
                } catch (e) {
                    alert(`indexedDB upgrade error: ${e}, from ${oldVersion} to ${newVersion}`);
                }
            }
        },
        blocked() {
            console.log('blocked');
        },
        blocking() {
            console.log('blocking');
        },
        terminated() {
            console.log('terminated');
        }
    });
    instance = new IDBwarpper(db);
    return instance;
}

export class IDBwarpper {
    private db: IDBPDatabase;
    constructor(db: IDBPDatabase) {
        this.db = db;
    }

    create<T>(objectStore: string) {
        return new _IDBwarpper<T>(this.db, objectStore);
    }
}

class _IDBwarpper<T> {
    private db: IDBPDatabase;
    private objectStore: string;
    constructor(db: IDBPDatabase, objectStore: string) {
        this.db = db;
        this.objectStore = objectStore
    }

    async addData(data: T) {
        return await this.db.add(this.objectStore, data);
    }

    async getData(id: string): Promise<T | undefined> {
        return await this.db.get(this.objectStore, id);
    }

    async putData(id: string, data: T) {
        return await this.db.put(this.objectStore, {
            ...data,
            uuid: id,
        });
    }

    async deleteData(id: string) {
        return await this.db.delete(this.objectStore, id);
    }

    async getAllData() {
        return await this.db.getAll(this.objectStore) as T[];
    }
}

