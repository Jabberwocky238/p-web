import { IDBPDatabase, openDB } from 'idb';
export async function initDB() {
    const db = await openDB('myDatabase', 1, {
        upgrade(db) {
            db.createObjectStore('myStore', { keyPath: 'uuid' });
        },
    });
    return db;
}

export async function addData(db: IDBPDatabase, data: any) {
    await db.add('myStore', data);
}

export async function getData(db: IDBPDatabase, id: any) {
    return await db.get('myStore', id);
}

export async function deleteData(db: IDBPDatabase, id: any) {
    await db.delete('myStore', id);
}

export async function getAllData(db: IDBPDatabase) {
    return await db.getAll('myStore');
}