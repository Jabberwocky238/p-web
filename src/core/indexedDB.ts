import { IDBPDatabase, IDBPTransaction, openDB } from 'idb';

import { objectStores as music_objectStores } from './models/music';
import { objectStores as playlist_objectStores } from './models/playlist';
import { objectStores as remote_objectStores } from './models/remote';

var instance: IDBwarpper;

const upgradeTasks = [
    (db: IDBPDatabase) => {
        for (const store of music_objectStores) {
            db.createObjectStore(store, { keyPath: 'uuid' });
        }
        for (const store of playlist_objectStores) {
            db.createObjectStore(store, { keyPath: 'uuid' });
        }
        for (const store of remote_objectStores) {
            db.createObjectStore(store, { keyPath: 'uuid' });
        }
    },
];

export async function criticalRemoveEverything() {

    function clearOtherThings() {
        localStorage.clear();
        sessionStorage.clear();
    }

    return await new Promise((resolve, reject) => {
        const req = indexedDB.deleteDatabase('myDatabase');
        req.onsuccess = () => {
            alert('indexedDB removed');
            clearOtherThings();
            resolve(undefined);
        };
        req.onerror = () => {
            alert('indexedDB remove failed');
            reject(undefined);
        };
        req.onblocked = () => {
            alert('indexedDB removed');
            clearOtherThings();
            resolve(undefined);
        };
    })
}

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
    constructor(
        private db: IDBPDatabase
    ) { }

    create<T>(objectStore: string) {
        return new _IDBwarpper<T>(this.db, objectStore);
    }
}

class _IDBwarpper<T> {
    constructor(
        private db: IDBPDatabase,
        private objectStore: string
    ) { }

    async add(data: T) {
        return await this.db.add(this.objectStore, data);
    }

    async get(id: string) {
        return await this.db.get(this.objectStore, id) as T | undefined;
    }

    async put(id: string, data: T) {
        return await this.db.put(this.objectStore, {
            ...data,
            uuid: id,
        });
    }

    async delete(id: string) {
        return await this.db.delete(this.objectStore, id);
    }

    async getAll() {
        return await this.db.getAll(this.objectStore) as T[];
    }
}
