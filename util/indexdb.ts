// src/services/KeyValueIndexedDB.ts

/**
 * A service class to interact with IndexedDB as a simple key-value store.
 * Keys must be provided explicitly (out-of-line keys).
 */
export class KeyValueIndexedDB<T = any> {
  private dbName: string;
  private storeName: string;
  private dbVersion: number;
  private db?: IDBDatabase;
  private initializationPromise: Promise<void> | null = null;

  /**
   * Constructs a new KeyValueIndexedDB instance.
   * @param dbName The name of the IndexedDB database.
   * @param storeName The name of the object store within the database.
   * @param dbVersion The version of the database schema. Increment this when you change the object store structure.
   */
  constructor(dbName: string, storeName: string, dbVersion: number = 1) {
    if (!dbName || !storeName) {
      throw new Error(
        "dbName and storeName are required for KeyValueIndexedDB.",
      );
    }
    if (dbVersion < 1 || !Number.isInteger(dbVersion)) {
      throw new Error("dbVersion must be a positive integer.");
    }

    this.dbName = dbName;
    this.storeName = storeName;
    this.dbVersion = dbVersion;
  }

  /**
   * Initializes the IndexedDB database. This must be awaited before performing any operations.
   * It handles database creation and schema upgrades.
   */
  public async init(): Promise<void> {
    // Prevent multiple concurrent initializations
    if (this.db) return; // Already initialized
    if (this.initializationPromise) return this.initializationPromise; // Initialization in progress

    this.initializationPromise = new Promise<void>((resolve, reject) => {
      console.log(
        `[KeyValueIndexedDB] Attempting to open database '${this.dbName}' (Version: ${this.dbVersion})`,
      );
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        console.log(
          `[KeyValueIndexedDB] Upgrade needed for database '${this.dbName}' from version ${event.oldVersion} to ${event.newVersion}`,
        );

        // If the object store already exists, delete it to ensure a clean slate
        // for schema changes (e.g., changing keyPath or autoIncrement behavior).
        // This is crucial if you ever previously created the store with a keyPath.
        if (db.objectStoreNames.contains(this.storeName)) {
          console.warn(
            `[KeyValueIndexedDB] Deleting existing object store: ${this.storeName}`,
          );
          db.deleteObjectStore(this.storeName);
        }

        console.log(
          `[KeyValueIndexedDB] Creating new object store: ${this.storeName} (no keyPath, no autoIncrement)`,
        );
        // Create the object store without a keyPath and without autoIncrement.
        // This means keys must be explicitly provided in `put(value, key)`.
        db.createObjectStore(this.storeName);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log(
          `[KeyValueIndexedDB] Database '${this.dbName}' opened successfully.`,
        );
        this.db.onversionchange = () => {
          // Handle cases where another tab requests a higher version
          console.warn(
            `[KeyValueIndexedDB] Database version change detected. Closing connection.`,
          );
          this.db?.close();
          this.db = undefined; // Mark as uninitialized
          this.initializationPromise = null;
          alert("Database schema updated. Please reload this page.");
        };
        resolve();
      };

      request.onerror = () => {
        console.error(
          `[KeyValueIndexedDB] Error opening database '${this.dbName}':`,
          request.error,
        );
        this.initializationPromise = null; // Clear promise on error
        reject(request.error);
      };

      request.onblocked = () => {
        // This event fires if a new version is requested but older connections
        // to the database are still open, preventing the upgrade.
        console.warn(
          `[KeyValueIndexedDB] Database upgrade blocked for '${this.dbName}'. Please close all other tabs using this database or refresh the page.`,
        );
        // You might want to notify the user or refresh the page here.
        this.initializationPromise = null; // Clear promise if blocked
        reject(new Error("Database access blocked by other open connections."));
      };
    });

    return this.initializationPromise;
  }

  /**
   * Helper to get an IndexedDB transaction and object store.
   * @param mode The transaction mode ("readonly" or "readwrite").
   * @returns An IDBObjectStore instance.
   * @throws Error if the database is not initialized.
   */
  private getStore(mode: IDBTransactionMode): IDBObjectStore {
    if (!this.db) {
      throw new Error(
        "Database not initialized. Call init() and await its completion before operations.",
      );
    }
    // Ensure the object store name is valid for the current transaction
    if (!this.db.objectStoreNames.contains(this.storeName)) {
      throw new Error(
        `Object store '${this.storeName}' does not exist in database '${this.dbName}'. This indicates a schema mismatch or unhandled upgrade.`,
      );
    }
    const tx = this.db.transaction(this.storeName, mode);
    tx.onerror = (event) => {
      console.error(
        `[KeyValueIndexedDB] Transaction error for store '${this.storeName}' in mode '${mode}':`,
        event.target?.error,
      );
    };
    tx.oncomplete = () => {
      // console.log(`[KeyValueIndexedDB] Transaction for store '${this.storeName}' in mode '${mode}' completed.`);
    };
    return tx.objectStore(this.storeName);
  }

  /**
   * Stores a value associated with a key.
   * @param key The key to store the value under (e.g., string, number, Date, ArrayBuffer).
   * @param value The value to store. Can be any JavaScript object that can be cloned.
   * @returns A Promise that resolves when the item is successfully stored.
   */
  public async setItem(key: IDBValidKey, value: T): Promise<void> {
    await this.init(); // Ensure database is initialized
    return new Promise<void>((resolve, reject) => {
      try {
        const store = this.getStore("readwrite");
        const request = store.put(value, key); // Explicitly provide key (out-of-line key)

        request.onsuccess = () => resolve();
        request.onerror = (event) => {
          console.error(
            `[KeyValueIndexedDB] setItem Error for key '${key}':`,
            event.target?.error,
          );
          reject(event.target?.error);
        };
      } catch (error) {
        console.error(
          `[KeyValueIndexedDB] Error during setItem operation for key '${key}':`,
          error,
        );
        reject(error);
      }
    });
  }

  /**
   * Retrieves a value by its key.
   * @param key The key of the value to retrieve.
   * @returns A Promise that resolves with the retrieved value, or `undefined` if not found.
   */
  public async getItem(key: IDBValidKey): Promise<T | undefined> {
    await this.init(); // Ensure database is initialized
    return new Promise<T | undefined>((resolve, reject) => {
      try {
        const store = this.getStore("readonly");
        const request = store.get(key);

        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => {
          console.error(
            `[KeyValueIndexedDB] getItem Error for key '${key}':`,
            event.target?.error,
          );
          reject(event.target?.error);
        };
      } catch (error) {
        console.error(
          `[KeyValueIndexedDB] Error during getItem operation for key '${key}':`,
          error,
        );
        reject(error);
      }
    });
  }

  /**
   * Removes a value by its key.
   * @param key The key of the value to remove.
   * @returns A Promise that resolves when the item is successfully removed.
   */
  public async removeItem(key: IDBValidKey): Promise<void> {
    await this.init(); // Ensure database is initialized
    return new Promise<void>((resolve, reject) => {
      try {
        const store = this.getStore("readwrite");
        const request = store.delete(key);

        request.onsuccess = () => resolve();
        request.onerror = (event) => {
          console.error(
            `[KeyValueIndexedDB] removeItem Error for key '${key}':`,
            event.target?.error,
          );
          reject(event.target?.error);
        };
      } catch (error) {
        console.error(
          `[KeyValueIndexedDB] Error during removeItem operation for key '${key}':`,
          error,
        );
        reject(error);
      }
    });
  }

  /**
   * Clears all key-value pairs from the object store.
   * @returns A Promise that resolves when the store is successfully cleared.
   */
  public async clear(): Promise<void> {
    await this.init(); // Ensure database is initialized
    return new Promise<void>((resolve, reject) => {
      try {
        const store = this.getStore("readwrite");
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = (event) => {
          console.error(
            `[KeyValueIndexedDB] clear Error:`,
            event.target?.error,
          );
          reject(event.target?.error);
        };
      } catch (error) {
        console.error(
          `[KeyValueIndexedDB] Error during clear operation:`,
          error,
        );
        reject(error);
      }
    });
  }

  /**
   * Retrieves all keys currently in the object store.
   * @returns A Promise that resolves with an array of all keys.
   */
  public async getAllKeys(): Promise<IDBValidKey[]> {
    await this.init();
    return new Promise<IDBValidKey[]>((resolve, reject) => {
      try {
        const store = this.getStore("readonly");
        const request = store.getAllKeys();

        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => {
          console.error(
            `[KeyValueIndexedDB] getAllKeys Error:`,
            event.target?.error,
          );
          reject(event.target?.error);
        };
      } catch (error) {
        console.error(
          `[KeyValueIndexedDB] Error during getAllKeys operation:`,
          error,
        );
        reject(error);
      }
    });
  }

  /**
   * Retrieves all values currently in the object store.
   * @returns A Promise that resolves with an array of all values.
   */
  public async getAllValues(): Promise<T[]> {
    await this.init();
    return new Promise<T[]>((resolve, reject) => {
      try {
        const store = this.getStore("readonly");
        const request = store.getAll(); // Note: getAll() fetches values, getAllKeys() fetches keys

        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => {
          console.error(
            `[KeyValueIndexedDB] getAllValues Error:`,
            event.target?.error,
          );
          reject(event.target?.error);
        };
      } catch (error) {
        console.error(
          `[KeyValueIndexedDB] Error during getAllValues operation:`,
          error,
        );
        reject(error);
      }
    });
  }

  /**
   * Closes the database connection. Useful for cleanup or if you need to release resources.
   * The database will be re-opened on the next operation if needed.
   */
  public close(): void {
    if (this.db) {
      this.db.close();
      console.log(`[KeyValueIndexedDB] Database '${this.dbName}' closed.`);
      this.db = undefined;
      this.initializationPromise = null;
    }
  }
}
