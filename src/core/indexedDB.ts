import { IDBPDatabase, openDB } from 'idb';

import { objectStores as music_objectStores } from './models/music';

var instance: IDBwarpper;

export async function useDB() {
    if (instance) {
        // console.log('instance', instance);
        return instance;
    }
    var objectStoreConstructors = [] as string[];
    objectStoreConstructors.push(...music_objectStores);
    // console.log('objectStoreConstructors', objectStoreConstructors);

    const db = await openDB('myDatabase', 1.01, {
        upgrade(db) {
            for (const store of objectStoreConstructors) {
                // console.log('upgrade', store);
                db.createObjectStore(store, { keyPath: 'uuid' });
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
        return await this.db.getAll(this.objectStore);
    }
}
