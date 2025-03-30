import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getItem(key: string) {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error(`Error getting item ${key}:`, error);
    return null;
  }
}

export async function setItem(key: string, value: any) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error setting item ${key}:`, error);
    return false;
  }
}

export async function removeItem(key: string) {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing item ${key}:`, error);
    return false;
  }
}

export async function mergeItem(key: string, value: any) {
  try {
    const existing = (await getItem(key)) || {};
    const merged = { ...existing, ...value };
    await setItem(key, merged);
    return merged;
  } catch (error) {
    console.error(`Error merging item ${key}:`, error);
    return null;
  }
}
