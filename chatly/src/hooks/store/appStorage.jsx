import { Store } from "@tauri-apps/plugin-store";

let storePromise;

async function getStoreInstance() {
  if (!storePromise) {
    storePromise = Store.load("app-settings.json");
  }
  return storePromise;
}

export async function getStore(key) {
  const store = await getStoreInstance();
  return store.get(key);
}

export async function setStore(key, value) {
  const store = await getStoreInstance();
  await store.set(key, value);
  await store.save();
  return value;
}

export async function removeStore(key) {
  const store = await getStoreInstance();
  await store.delete(key);
  await store.save();
}

export async function clearStore() {
  const store = await getStoreInstance();
  await store.clear();
  await store.save();
}