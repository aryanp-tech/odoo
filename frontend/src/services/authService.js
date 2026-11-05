// src/services/authService.js
// Session management & Odoo credential binding for Aryan Patel

const STORAGE_KEY = 'latitude_user_session';

export const DEFAULT_USER = {
  id: 11,
  employee_id: 3,
  name: "Aryan Patel",
  username: "aryan.p",
  email: "aryan.p@latitudetechnolabs.org",
  role: "super_admin",
  badge_id: "6APX-77402",
  job_title: "Software Engineer",
  department: "Core Platform Engineering Group",
  standard_hours: "09:00 - 17:00",
  location: "Hybrid (Munich Tech Center)",
  node: "HQ-EMEA-01",
  avatar_initials: "AP",
};

export const ODOO_CONFIG = {
  db: 'aryanodoo',
  login: 'aryan.p@latitudetechnolabs.org',
  password: 'Aryan@123',
  employeeId: 3,
  userId: 11,
};

export function getStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_USER;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_USER, ...parsed };
  } catch (e) {
    console.error("Failed to parse stored session", e);
    return DEFAULT_USER;
  }
}

export function saveSession(user) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch (e) {
    console.error("Failed to save session", e);
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear session", e);
  }
}
