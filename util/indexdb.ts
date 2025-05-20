// utils/IndexedDBService.ts

export class IndexedDBService<T = any> {
    private dbName: string
        private storeName: string
            private dbVersion: number
                private db?: IDBDatabase

                    constructor(dbName: string, storeName: string, dbVersion = 1) {
                        this.dbName = dbName
                        this.storeName = storeName
                        this.dbVersion = dbVersion
                    }

                    async init(): Promise<void> {
                        if (this.db) return

                            this.db = await new Promise<IDBDatabase>((resolve, reject) => {
                                const request = indexedDB.open(this.dbName, this.dbVersion)

                                request.onupgradeneeded = (event) => {
                                    const db = (event.target as IDBOpenDBRequest).result
                                    if (!db.objectStoreNames.contains(this.storeName)) {
                                        db.createObjectStore(this.storeName)
                                    }
                                }

                                request.onsuccess = () => resolve(request.result)
                                request.onerror = () => reject(request.error)
                            })
                    }

                    private getStore(mode: IDBTransactionMode): IDBObjectStore {
                        if (!this.db) throw new Error("Database not initialized")
                            const tx = this.db.transaction(this.storeName, mode)
                            return tx.objectStore(this.storeName)
                    }

                    async setItem(key: IDBValidKey, value: T): Promise<void> {
                        await this.init()
                        await new Promise<void>((resolve, reject) => {
                            const store = this.getStore("readwrite")
                            const request = store.put(value, key)
                            request.onsuccess = () => resolve()
                            request.onerror = () => reject(request.error)
                        })
                    }

                    async getItem(key: IDBValidKey): Promise<T | undefined> {
                        await this.init()
                        return new Promise<T | undefined>((resolve, reject) => {
                            const store = this.getStore("readonly")
                            const request = store.get(key)
                            request.onsuccess = () => resolve(request.result)
                            request.onerror = () => reject(request.error)
                        })
                    }

                    async removeItem(key: IDBValidKey): Promise<void> {
                        await this.init()
                        await new Promise<void>((resolve, reject) => {
                            const store = this.getStore("readwrite")
                            const request = store.delete(key)
                            request.onsuccess = () => resolve()
                            request.onerror = () => reject(request.error)
                        })
                    }

                    async clear(): Promise<void> {
                        await this.init()
                        await new Promise<void>((resolve, reject) => {
                            const store = this.getStore("readwrite")
                            const request = store.clear()
                            request.onsuccess = () => resolve()
                            request.onerror = () => reject(request.error)
                        })
                    }
}
