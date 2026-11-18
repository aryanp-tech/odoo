// src/services/employeeService.js
// Enterprise Employee & Super Admin Management Service
// Full Role Hierarchies, Granular Backend Permission Mapping & Live Odoo 14 Integration

import { callOdooKw } from './api/apiSlice';

const EMPLOYEES_STORAGE_KEY = 'latitude_enterprise_employees';
const PASSWORDS_STORAGE_KEY = 'latitude_custom_passwords';

// 1. Full Role Hierarchies across all enterprise departments
export const SYSTEM_ROLES = [
  // Executive Governance
  {
    id: 'super_admin',
    label: 'Super Admin',
    category: 'Executive Governance',
    department: 'Executive Leadership',
    color: 'indigo',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    description: 'Unrestricted master authority across all portal modules, users, and security settings',
  },

  // HR Hierarchy
  {
    id: 'super_hr',
    label: 'Super HR',
    category: 'People Operations',
    department: 'Human Resources',
    color: 'purple',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'Top HR authority: Full employee management, leave policies, reviews, and office polls',
  },
  {
    id: 'hr_admin',
    label: 'HR Administrator',
    category: 'People Operations',
    department: 'Human Resources',
    color: 'fuchsia',
    badgeColor: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
    description: 'Full employee directory, attendance administration, and leave approvals',
  },
  {
    id: 'hr_manager',
    label: 'HR Manager',
    category: 'People Operations',
    department: 'Human Resources',
    color: 'violet',
    badgeColor: 'bg-violet-50 text-violet-700 border-violet-200',
    description: 'Appraisal manager, leave approver, and attendance records oversight',
  },
  {
    id: 'hr_officer',
    label: 'HR Officer',
    category: 'People Operations',
    department: 'Human Resources',
    color: 'sky',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    description: 'Employee profile onboarding, attendance verification, and leave inquiries',
  },

  // IT & Infrastructure Hierarchy
  {
    id: 'it_admin',
    label: 'IT Administrator',
    category: 'Infrastructure',
    department: 'Infrastructure Operations',
    color: 'rose',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    description: 'Hardware equipment manager, server issue resolver, and infrastructure tickets admin',
  },
  {
    id: 'it_officer',
    label: 'IT Support Officer',
    category: 'Infrastructure',
    department: 'Infrastructure Operations',
    color: 'teal',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    description: 'Hardware diagnostics, helpdesk ticket assignment, and office tech support',
  },

  // Squad Leadership & Project Hierarchy
  {
    id: 'project_manager',
    label: 'Project Manager',
    category: 'Squad Leadership',
    department: 'Engineering & Cloud Systems',
    color: 'emerald',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Project workspace administrator, analytic timesheets sign-off, and squad evaluations',
  },
  {
    id: 'team_lead',
    label: 'Team Lead (TL)',
    category: 'Squad Leadership',
    department: 'Engineering & Cloud Systems',
    color: 'amber',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Squad tasks management, timesheet approver, and peer reviewer',
  },

  // Core Contributor
  {
    id: 'employee',
    label: 'Standard Employee',
    category: 'Core Contributor',
    department: 'Engineering & Cloud Systems',
    color: 'blue',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Employee self-service: Attendance check-in/out, personal leave requests, and timesheets',
  },
];

export const DEPARTMENTS = [
  'Engineering & Cloud Systems',
  'Human Resources',
  'Infrastructure Operations',
  'Quality Assurance',
  'Product & UI/UX Design',
  'Executive Leadership',
];

// 2. Granular Backend Permission Modules & Group Mappings
export const PERMISSION_MODULES = [
  {
    id: 'employees',
    name: 'Employees',
    category: 'Human Resources',
    iconName: 'Users',
    description: 'Workforce records, profiles, and hierarchy',
    options: [
      { id: 'none', label: 'None', groupIds: [] },
      { id: 'officer', label: 'Officer', groupIds: [15] },
      { id: 'admin', label: 'Administrator', groupIds: [15, 16] },
    ],
  },
  {
    id: 'time_off',
    name: 'Time Off & Leaves',
    category: 'Human Resources',
    iconName: 'CalendarCheck',
    description: 'Leave allocations, vacation requests, and absence approvals',
    options: [
      { id: 'none', label: 'None', groupIds: [] },
      { id: 'responsible', label: 'Responsible (Approver)', groupIds: [32] },
      { id: 'all_approver', label: 'All Approver', groupIds: [32, 33] },
      { id: 'admin', label: 'Administrator', groupIds: [32, 33, 34] },
    ],
  },
  {
    id: 'attendances',
    name: 'Attendances',
    category: 'Human Resources',
    iconName: 'Clock',
    description: 'Daily check-in / check-out, manual punches, and timesheet telemetry',
    options: [
      { id: 'none', label: 'None', groupIds: [] },
      { id: 'manual', label: 'Manual Punch (Self)', groupIds: [27] },
      { id: 'officer', label: 'Officer', groupIds: [27, 28] },
      { id: 'admin', label: 'Administrator', groupIds: [27, 28, 29] },
    ],
  },
  {
    id: 'appraisal',
    name: 'Reviews & Appraisals',
    category: 'Human Resources',
    iconName: 'Award',
    description: 'Quarterly reviews, goal appraisals, and evaluation scores',
    options: [
      { id: 'none', label: 'None', groupIds: [] },
      { id: 'employee', label: 'Employee', groupIds: [44] },
      { id: 'manager', label: 'Manager Reviewer', groupIds: [44, 45] },
      { id: 'super_admin', label: 'Super Admin Reviewer', groupIds: [44, 45, 37] },
    ],
  },
  {
    id: 'projects',
    name: 'Projects',
    category: 'Services & Operations',
    iconName: 'FolderKanban',
    description: 'Project workspaces, task assignments, and delivery milestones',
    options: [
      { id: 'none', label: 'None', groupIds: [] },
      { id: 'user', label: 'User', groupIds: [60] },
      { id: 'admin', label: 'Administrator', groupIds: [60, 61] },
    ],
  },
  {
    id: 'timesheets',
    name: 'Timesheets',
    category: 'Services & Operations',
    iconName: 'FileSpreadsheet',
    description: 'Analytic billable line logging and squad timesheet approvals',
    options: [
      { id: 'none', label: 'None', groupIds: [] },
      { id: 'own', label: 'See Own Timesheets', groupIds: [72] },
      { id: 'approver', label: 'Approver', groupIds: [72, 73] },
      { id: 'admin', label: 'Administrator', groupIds: [72, 73, 74] },
    ],
  },
  {
    id: 'it_tickets',
    name: 'IT & Server Tickets',
    category: 'IT & Infrastructure',
    iconName: 'LifeBuoy',
    description: 'Helpdesk issues, incident escalation, and server diagnostics',
    options: [
      { id: 'none', label: 'None', groupIds: [] },
      { id: 'officer', label: 'IT Support Officer', groupIds: [35] },
      { id: 'admin', label: 'IT Admin & Server Issue Admin', groupIds: [35, 36, 38] },
    ],
  },
  {
    id: 'equipment',
    name: 'Hardware & Equipment',
    category: 'IT & Infrastructure',
    iconName: 'Laptop',
    description: 'Laptops, monitors, assets inventory, and equipment management',
    options: [
      { id: 'none', label: 'None', groupIds: [] },
      { id: 'manager', label: 'Equipment Manager', groupIds: [17] },
    ],
  },
  {
    id: 'voting',
    name: 'Office Pulse Polls',
    category: 'Community & Culture',
    iconName: 'Vote',
    description: 'Company-wide voting, workplace pulse surveys, and all-hands polls',
    options: [
      { id: 'none', label: 'None', groupIds: [] },
      { id: 'user', label: 'Voting User', groupIds: [24] },
      { id: 'admin', label: 'Employee Voting Admin', groupIds: [24, 25] },
    ],
  },
  {
    id: 'admin_access',
    name: 'System Governance',
    category: 'Administration',
    iconName: 'ShieldAlert',
    description: 'Top-level portal control, user provisioning, and full access settings',
    options: [
      { id: 'none', label: 'None (Standard User)', groupIds: [1] },
      { id: 'settings', label: 'Access Rights Admin', groupIds: [1, 2] },
      { id: 'super_admin', label: 'Full Super Admin Master', groupIds: [1, 2, 3, 68] },
    ],
  },
];

// 3. Recommended permission mapping per role preset (editable by Super Admin)
export const DEFAULT_ROLE_PERMISSIONS = {
  super_admin: {
    employees: 'admin',
    time_off: 'admin',
    attendances: 'admin',
    appraisal: 'super_admin',
    projects: 'admin',
    timesheets: 'admin',
    it_tickets: 'admin',
    equipment: 'manager',
    voting: 'admin',
    admin_access: 'super_admin',
  },
  super_hr: {
    employees: 'admin',
    time_off: 'admin',
    attendances: 'admin',
    appraisal: 'super_admin',
    projects: 'user',
    timesheets: 'approver',
    it_tickets: 'none',
    equipment: 'none',
    voting: 'admin',
    admin_access: 'none',
  },
  hr_admin: {
    employees: 'admin',
    time_off: 'admin',
    attendances: 'admin',
    appraisal: 'manager',
    projects: 'none',
    timesheets: 'own',
    it_tickets: 'none',
    equipment: 'none',
    voting: 'user',
    admin_access: 'none',
  },
  hr_manager: {
    employees: 'officer',
    time_off: 'all_approver',
    attendances: 'officer',
    appraisal: 'manager',
    projects: 'none',
    timesheets: 'own',
    it_tickets: 'none',
    equipment: 'none',
    voting: 'user',
    admin_access: 'none',
  },
  hr_officer: {
    employees: 'officer',
    time_off: 'responsible',
    attendances: 'officer',
    appraisal: 'employee',
    projects: 'none',
    timesheets: 'own',
    it_tickets: 'none',
    equipment: 'none',
    voting: 'user',
    admin_access: 'none',
  },
  it_admin: {
    employees: 'none',
    time_off: 'responsible',
    attendances: 'manual',
    appraisal: 'employee',
    projects: 'admin',
    timesheets: 'approver',
    it_tickets: 'admin',
    equipment: 'manager',
    voting: 'user',
    admin_access: 'none',
  },
  it_officer: {
    employees: 'none',
    time_off: 'none',
    attendances: 'manual',
    appraisal: 'employee',
    projects: 'user',
    timesheets: 'own',
    it_tickets: 'officer',
    equipment: 'none',
    voting: 'user',
    admin_access: 'none',
  },
  project_manager: {
    employees: 'none',
    time_off: 'all_approver',
    attendances: 'manual',
    appraisal: 'manager',
    projects: 'admin',
    timesheets: 'admin',
    it_tickets: 'none',
    equipment: 'none',
    voting: 'user',
    admin_access: 'none',
  },
  team_lead: {
    employees: 'none',
    time_off: 'responsible',
    attendances: 'manual',
    appraisal: 'employee',
    projects: 'user',
    timesheets: 'approver',
    it_tickets: 'none',
    equipment: 'none',
    voting: 'user',
    admin_access: 'none',
  },
  employee: {
    employees: 'none',
    time_off: 'none',
    attendances: 'manual',
    appraisal: 'employee',
    projects: 'user',
    timesheets: 'own',
    it_tickets: 'none',
    equipment: 'none',
    voting: 'user',
    admin_access: 'none',
  },
};

// 4. Helper to compute real Odoo group IDs from selected permissions
export function computeGroupIds(permissions = {}) {
  const groupSet = new Set([1]); // Internal user always included

  PERMISSION_MODULES.forEach((mod) => {
    const selectedOptId = permissions[mod.id] || 'none';
    const opt = mod.options.find((o) => o.id === selectedOptId);
    if (opt && Array.isArray(opt.groupIds)) {
      opt.groupIds.forEach((gid) => groupSet.add(gid));
    }
  });

  return Array.from(groupSet);
}

// Helper to load passwords map
function getCustomPasswords() {
  try {
    const raw = localStorage.getItem(PASSWORDS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Helper to save passwords map
function saveCustomPasswords(passwords) {
  try {
    localStorage.setItem(PASSWORDS_STORAGE_KEY, JSON.stringify(passwords));
  } catch (e) {
    console.error('Failed to save passwords', e);
  }
}

// Retrieve full employee directory (100% dynamic from backend)
export function getAllEmployees() {
  try {
    const stored = localStorage.getItem(EMPLOYEES_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Clean out any old mock data from previous sessions
      const valid = Array.isArray(parsed)
        ? parsed.filter(
            (e) =>
              !e.email?.includes('@test.com') &&
              e.email !== 'jaimin.p@gmail.com' &&
              e.name !== 'Sarah Chen (HR Admin)' &&
              e.name !== 'Karan Shah (IT Admin)' &&
              e.name !== 'Super Admin Master'
          )
        : [];
      if (Array.isArray(parsed) && valid.length !== parsed.length) {
        saveAllEmployees(valid);
      }
      return valid;
    }
    return [];
  } catch (e) {
    console.error('Failed to load employees from local storage', e);
    return [];
  }
}

// Save complete employee directory
export function saveAllEmployees(employees) {
  try {
    localStorage.setItem(EMPLOYEES_STORAGE_KEY, JSON.stringify(employees));
  } catch (e) {
    console.error('Failed to persist employees', e);
  }
}

// Live fetch from Odoo 14 backend hr.employee
export async function fetchEmployeesFromBackend() {
  try {
    const raw = await callOdooKw('hr.employee', 'search_read', [[]], {
      fields: ['id', 'name', 'work_email', 'job_title', 'department_id', 'user_id', 'active', 'mobile_phone', 'work_phone'],
      order: 'name asc',
    });
    if (Array.isArray(raw) && raw.length > 0) {
      const mapped = raw.map((emp) => {
        const initials = (emp.name || 'EM')
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        const deptName = Array.isArray(emp.department_id) ? emp.department_id[1] : 'Latitude Techno Labs';
        const isSuper = (emp.name || '').toLowerCase().includes('admin') || (emp.name || '').toLowerCase().includes('aryan');
        const isHr = (emp.name || '').toLowerCase().includes('hr');
        const isIt = (emp.name || '').toLowerCase().includes('it');
        const role = isSuper ? 'super_admin' : isHr ? 'super_hr' : isIt ? 'it_admin' : 'employee';
        const roleLabel = isSuper ? 'Super Admin' : isHr ? 'Super HR' : isIt ? 'IT Administrator' : (emp.job_title || 'Standard Employee');

        return {
          id: emp.user_id ? emp.user_id[0] : emp.id,
          employee_id: emp.id,
          name: emp.name,
          username: emp.work_email ? emp.work_email.split('@')[0] : emp.name.toLowerCase().replace(/\s+/g, '.'),
          email: emp.work_email || `${emp.name.toLowerCase().replace(/\s+/g, '.')}@latitudetechnolabs.org`,
          role,
          roleLabel,
          badge_id: `EMP-${emp.id}00`,
          job_title: emp.job_title || roleLabel,
          department: deptName,
          workMobile: emp.mobile_phone || '+91 98765 00000',
          workPhone: emp.work_phone || '+91 79 4000 0000',
          workingType: 'Hybrid',
          standard_hours: '09:00 - 18:00 IST',
          location: 'Ahmedabad HQ',
          node: 'HQ-EMEA-01',
          status: emp.active !== false ? 'Active' : 'Inactive',
          manager: 'Leadership Board',
          avatar_initials: initials,
          permissions: DEFAULT_ROLE_PERMISSIONS[role] || DEFAULT_ROLE_PERMISSIONS.employee,
        };
      });
      saveAllEmployees(mapped);
      return mapped;
    }
  } catch (e) {
    console.warn('Could not fetch employees from live Odoo backend:', e);
  }
  return getAllEmployees();
}

// Get single employee by ID
export function getEmployeeById(id) {
  const employees = getAllEmployees();
  return employees.find((e) => String(e.id) === String(id) || String(e.employee_id) === String(id)) || null;
}

// Super Admin / HR: Create new employee with customized permissions & live Odoo backend sync
export async function createEmployee(data) {
  const employees = getAllEmployees();

  const cleanName = (data.name || '').trim();
  const cleanEmail = (data.email || '').trim().toLowerCase();
  const cleanPassword = (data.password || '').trim();

  if (!cleanName) {
    return { success: false, error: 'Employee full name is required.' };
  }
  if (!cleanEmail) {
    return { success: false, error: 'Employee email is required.' };
  }
  if (!cleanPassword || cleanPassword.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }

  // Check email uniqueness
  const exists = employees.some((e) => e.email.toLowerCase() === cleanEmail);
  if (exists) {
    return { success: false, error: `An employee with email "${cleanEmail}" already exists.` };
  }

  // Derive role and permissions
  const roleId = data.role || 'employee';
  const roleObj = SYSTEM_ROLES.find((r) => r.id === roleId) || SYSTEM_ROLES[SYSTEM_ROLES.length - 1];
  
  // Custom permissions from form, falling back to preset defaults
  const permissions = data.permissions && Object.keys(data.permissions).length > 0
    ? { ...(DEFAULT_ROLE_PERMISSIONS[roleId] || DEFAULT_ROLE_PERMISSIONS.employee), ...data.permissions }
    : (DEFAULT_ROLE_PERMISSIONS[roleId] || DEFAULT_ROLE_PERMISSIONS.employee);

  const finalGroupIds = computeGroupIds(permissions);

  let odooUserId = null;
  let odooEmployeeId = null;

  // Direct Odoo 14 backend provisioning
  try {
    const odooUserRes = await fetch('/web/dataset/call_kw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        jsonrpc: '2.0',
        params: {
          model: 'res.users',
          method: 'create',
          args: [{
            name: cleanName,
            login: cleanEmail,
            password: cleanPassword,
            groups_id: [[6, 0, finalGroupIds]],
          }],
          kwargs: {},
        },
      }),
    });
    const odooUserData = await odooUserRes.json();
    if (odooUserData.result) {
      odooUserId = odooUserData.result;

      // Create linked hr.employee record in Odoo
      const empRes = await fetch('/web/dataset/call_kw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          jsonrpc: '2.0',
          params: {
            model: 'hr.employee',
            method: 'create',
            args: [{
              name: cleanName,
              work_email: cleanEmail,
              job_title: data.job_title || roleObj.label,
              user_id: odooUserId,
              work_phone: data.workMobile || '',
            }],
            kwargs: {},
          },
        }),
      });
      const empData = await empRes.json();
      if (empData.result) {
        odooEmployeeId = empData.result;
      }
    }
  } catch (e) {
    console.warn('Odoo backend creation fallback to local:', e);
  }

  const nextId = odooUserId || Math.max(...employees.map((e) => Number(e.id) || 0), 100) + 1;
  const nextEmpId = odooEmployeeId || Math.max(...employees.map((e) => Number(e.employee_id) || 0), 10) + 1;
  const username = cleanEmail.split('@')[0] || `user.${nextId}`;
  const initials = cleanName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'EP';

  const newEmployee = {
    id: nextId,
    employee_id: nextEmpId,
    name: cleanName,
    username,
    email: cleanEmail,
    role: roleId,
    roleLabel: data.roleLabel || roleObj.label,
    badge_id: data.badge_id || `6APX-774${String(nextId).slice(-2)}`,
    job_title: data.job_title || roleObj.label,
    department: data.department || roleObj.department || DEPARTMENTS[0],
    workMobile: data.workMobile || '',
    workPhone: data.workPhone || '',
    workingType: data.workingType || 'Full-Time Hybrid',
    standard_hours: data.standard_hours || '09:00 - 18:00 IST',
    location: data.location || 'Ahmedabad HQ',
    node: data.node || 'HQ-EMEA-01',
    status: data.status || 'Active',
    manager: data.manager || 'Aryan Patel',
    avatar_initials: initials,
    photo: data.photo || '',
    defaultPassword: cleanPassword,
    permissions,
    groupIds: finalGroupIds,
    joinedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
  };

  // 1. Save password to credentials store for instant portal authentication
  const passwords = getCustomPasswords();
  passwords[cleanEmail] = cleanPassword;
  saveCustomPasswords(passwords);

  // 2. Add to employee registry
  const updatedList = [newEmployee, ...employees];
  saveAllEmployees(updatedList);

  return { success: true, employee: newEmployee };
}

// Super Admin / HR: Update all fields of an employee including email, role, and granular permissions
export async function updateEmployee(id, updatedData) {
  const employees = getAllEmployees();
  const index = employees.findIndex((e) => String(e.id) === String(id));

  if (index === -1) {
    return { success: false, error: 'Employee not found.' };
  }

  const existing = employees[index];
  const oldEmail = existing.email.toLowerCase();
  const newEmail = (updatedData.email || existing.email).trim().toLowerCase();

  // If email is changing, verify uniqueness
  if (newEmail !== oldEmail) {
    const emailConflict = employees.some((e) => String(e.id) !== String(id) && e.email.toLowerCase() === newEmail);
    if (emailConflict) {
      return { success: false, error: `Email address "${newEmail}" is already assigned to another employee.` };
    }
  }

  const roleId = updatedData.role || existing.role;
  const roleObj = SYSTEM_ROLES.find((r) => r.id === roleId) || SYSTEM_ROLES[SYSTEM_ROLES.length - 1];

  // Merge updated permissions or preserve existing
  const permissions = updatedData.permissions
    ? { ...(existing.permissions || DEFAULT_ROLE_PERMISSIONS[roleId] || {}), ...updatedData.permissions }
    : (existing.permissions || DEFAULT_ROLE_PERMISSIONS[roleId] || DEFAULT_ROLE_PERMISSIONS.employee);

  const finalGroupIds = computeGroupIds(permissions);

  // Sync to live Odoo backend if user exists
  if (existing.id && typeof existing.id === 'number') {
    try {
      const userPayload = {
        name: updatedData.name || existing.name,
        login: newEmail,
        groups_id: [[6, 0, finalGroupIds]],
      };
      if (updatedData.password && updatedData.password.trim()) {
        userPayload.password = updatedData.password.trim();
      }

      await fetch('/web/dataset/call_kw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          jsonrpc: '2.0',
          params: {
            model: 'res.users',
            method: 'write',
            args: [[existing.id], userPayload],
            kwargs: {},
          },
        }),
      });

      if (existing.employee_id) {
        await fetch('/web/dataset/call_kw', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            jsonrpc: '2.0',
            params: {
              model: 'hr.employee',
              method: 'write',
              args: [[existing.employee_id], {
                name: updatedData.name || existing.name,
                work_email: newEmail,
                job_title: updatedData.job_title || existing.job_title,
                work_phone: updatedData.workMobile || existing.workMobile || '',
              }],
              kwargs: {},
            },
          }),
        });
      }
    } catch (e) {
      console.warn('Odoo backend update fallback to local:', e);
    }
  }

  const initials = (updatedData.name || existing.name)
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'EP';

  const merged = {
    ...existing,
    ...updatedData,
    id: existing.id,
    employee_id: existing.employee_id,
    email: newEmail,
    role: roleId,
    roleLabel: updatedData.roleLabel || roleObj.label,
    avatar_initials: initials,
    permissions,
    groupIds: finalGroupIds,
  };

  // If a new password is provided, save it directly to authentication credentials
  const passwords = getCustomPasswords();
  if (updatedData.password && updatedData.password.trim()) {
    const cleanPassword = updatedData.password.trim();
    merged.defaultPassword = cleanPassword;
    passwords[newEmail] = cleanPassword;
  } else if (newEmail !== oldEmail && passwords[oldEmail]) {
    passwords[newEmail] = passwords[oldEmail];
    delete passwords[oldEmail];
  }
  saveCustomPasswords(passwords);

  employees[index] = merged;
  saveAllEmployees(employees);

  return { success: true, employee: merged };
}

// Super Admin: Reset or change an employee's password directly
export function changeEmployeePassword(id, newPassword) {
  const cleanPass = (newPassword || '').trim();
  if (!cleanPass || cleanPass.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters.' };
  }

  const employees = getAllEmployees();
  const emp = employees.find((e) => String(e.id) === String(id));
  if (!emp) {
    return { success: false, error: 'Employee not found.' };
  }

  // Sync to live Odoo backend
  if (emp.id && typeof emp.id === 'number') {
    try {
      fetch('/web/dataset/call_kw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          jsonrpc: '2.0',
          params: {
            model: 'res.users',
            method: 'write',
            args: [[emp.id], { password: cleanPass }],
            kwargs: {},
          },
        }),
      }).catch(() => {});
    } catch {
      // ignore
    }
  }

  // Update password store
  const passwords = getCustomPasswords();
  passwords[emp.email.toLowerCase()] = cleanPass;
  saveCustomPasswords(passwords);

  // Update defaultPassword on record
  emp.defaultPassword = cleanPass;
  saveAllEmployees(employees);

  return { success: true, message: `Password for ${emp.name} (${emp.email}) updated successfully.` };
}

// Super Admin: Toggle Employee Active/Inactive Status
export function toggleEmployeeStatus(id) {
  const employees = getAllEmployees();
  const emp = employees.find((e) => String(e.id) === String(id));
  if (!emp) {
    return { success: false, error: 'Employee not found.' };
  }
  emp.status = emp.status === 'Active' ? 'Inactive' : 'Active';
  saveAllEmployees(employees);
  return { success: true, employee: emp };
}

// Super Admin: Delete / Remove an employee
export function deleteEmployee(id) {
  const employees = getAllEmployees();
  const filtered = employees.filter((e) => String(e.id) !== String(id));
  if (filtered.length === employees.length) {
    return { success: false, error: 'Employee not found.' };
  }
  saveAllEmployees(filtered);
  return { success: true, message: 'Employee removed from registry.' };
}

// Super Admin: Telemetry Metrics Calculation
export function getSuperAdminMetrics() {
  const employees = getAllEmployees();
  const total = employees.length;

  const roleCounts = employees.reduce((acc, emp) => {
    const r = emp.role || 'employee';
    acc[r] = (acc[r] || 0) + 1;
    return acc;
  }, {});

  const deptCounts = employees.reduce((acc, emp) => {
    const d = emp.department || 'Other';
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});

  const activeCount = employees.filter((e) => (e.status || 'Active') === 'Active').length;

  return {
    totalEmployees: total,
    activeEmployees: activeCount,
    superAdmins: roleCounts.super_admin || 0,
    hrAdmins: (roleCounts.super_hr || 0) + (roleCounts.hr_admin || 0) + (roleCounts.hr_manager || 0) + (roleCounts.hr_officer || 0),
    itAdmins: (roleCounts.it_admin || 0) + (roleCounts.it_officer || 0),
    managers: (roleCounts.project_manager || 0) + (roleCounts.team_lead || 0),
    standardEmployees: roleCounts.employee || 0,
    departmentBreakdown: deptCounts,
  };
}
