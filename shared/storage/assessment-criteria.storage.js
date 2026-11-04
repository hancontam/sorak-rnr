import AsyncStorage from '@react-native-async-storage/async-storage';

const CRITERIA_KEY = '@sorak/flower-criteria';

// Chỉ lưu tiêu chí gợi ý tặng hoa trên thiết bị: backend chưa có endpoint cho phần này.
export async function readFlowerCriteria() {
  const raw = await AsyncStorage.getItem(CRITERIA_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function saveFlowerCriteria(criteria) {
  await AsyncStorage.setItem(CRITERIA_KEY, JSON.stringify(criteria));
}
