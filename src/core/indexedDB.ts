import { IDBPDatabase, openDB } from 'idb';

var instance: IDBwarpper;

export async function useDB() {
    if (instance) {
        return instance;
    }
    const db = await openDB('myDatabase', 1, {
        upgrade(db) {
            db.createObjectStore('myStore', { keyPath: 'uuid' });
        },
    });
    instance = new IDBwarpper(db);
    return instance;
}

export class IDBwarpper {
    private db: IDBPDatabase;
    constructor(db: IDBPDatabase) {
        this.db = db;
    }

    async addData(data: any) {
        await this.db.add('myStore', data);
    }

    async getData(id: any) {
        return await this.db.get('myStore', id);
    }

    async deleteData(id: any) {
        await this.db.delete('myStore', id);
    }

    async getAllData() {
        return await this.db.getAll('myStore');
    }
}
