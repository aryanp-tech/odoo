// src/services/api/apiSlice.js
// Live Odoo 14 JSON-RPC integration for Aryan Patel ESS Dashboard

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ODOO_CONFIG, DEFAULT_USER, getStoredSession, saveSession } from '../authService';

// Re-authenticate session with Odoo backend
export async function reauthenticateOdoo() {
  const session = getStoredSession();
  const login = session?.rawLogin || session?.email || session?.username || ODOO_CONFIG.login;
  const password = session?.rawPassword || session?.defaultPassword || ODOO_CONFIG.password;

  try {
    const res = await fetch('/web/session/authenticate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        jsonrpc: '2.0',
        params: {
          db: ODOO_CONFIG.db || 'aryanodoo',
          login,
          password,
        },
      }),
    });
    const json = await res.json();
    return Boolean(json.result && json.result.uid);
  } catch (e) {
    console.warn('Odoo auto re-authentication attempt failed:', e);
    return false;
  }
}

// Authenticate session with Odoo backend only if active session exists
async function ensureAuthenticated() {
  const session = getStoredSession();
  if (session && session.isAuthenticated) {
    return true;
  }
  return false;
}

// Call Odoo ORM method via JSON-RPC /web/dataset/call_kw with self-healing retry on session expiration
export async function callOdooKw(model, method, args = [], kwargs = {}, retry = true) {
  try {
    const res = await fetch('/web/dataset/call_kw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        jsonrpc: '2.0',
        params: {
          model,
          method,
          args,
          kwargs,
        },
      }),
    });
    const data = await res.json();

    // Detect session expiration and auto-reauthenticate
    if (data.error && (data.error.code === 100 || String(data.error.message || '').includes('Session Expired')) && retry) {
      console.warn(`[${model}.${method}] Odoo session expired. Auto re-authenticating...`);
      const authed = await reauthenticateOdoo();
      if (authed) {
        return callOdooKw(model, method, args, kwargs, false);
      }
    }

    if (data.error) {
      console.error(`Odoo Error [${model}.${method}]:`, data.error);
      throw new Error(data.error.data?.message || data.error.message || 'Odoo RPC Error');
    }
    return data.result;
  } catch (err) {
    if (retry && (String(err.message || '').includes('Session Expired') || String(err.message || '').includes('NetworkError'))) {
      const authed = await reauthenticateOdoo();
      if (authed) {
        return callOdooKw(model, method, args, kwargs, false);
      }
    }
    console.error(`Odoo call failed [${model}.${method}]:`, err);
    throw err;
  }
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr.replace(' ', 'T') + 'Z');
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDuration(hoursFloat) {
  if (!hoursFloat) return '0h 00m';
  const hours = Math.floor(hoursFloat);
  const minutes = Math.round((hoursFloat - hours) * 60);
  return `${hours}h ${String(minutes).padStart(2, '0')}m`;
}

const BREAK_STORAGE_KEY = 'latitude_break_state';

export function getStoredBreakState() {
  try {
    const raw = localStorage.getItem(BREAK_STORAGE_KEY);
    if (!raw) return { onBreak: false, breakStartTime: null, accumulatedBreakSeconds: 0 };
    return JSON.parse(raw);
  } catch {
    return { onBreak: false, breakStartTime: null, accumulatedBreakSeconds: 0 };
  }
}

export function saveBreakState(state) {
  try {
    localStorage.setItem(BREAK_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save break state:', e);
  }
}

export function clearBreakState() {
  try {
    localStorage.removeItem(BREAK_STORAGE_KEY);
  } catch {}
}

export async function getEffectiveEmployeeId() {
  const session = getStoredSession() || {};
  if (session.employee_id && session.employee_id !== 7) {
    return session.employee_id;
  }
  if (session.id) {
    try {
      const emps = await callOdooKw('hr.employee', 'search_read', [[['user_id', '=', session.id]]], {
        fields: ['id'],
        limit: 1,
      });
      if (emps && emps.length > 0) {
        session.employee_id = emps[0].id;
        saveSession(session);
        return emps[0].id;
      }
    } catch (e) {
      console.warn('Failed to resolve employee by user_id:', e);
    }
  }
  if (session.email) {
    try {
      const emps = await callOdooKw('hr.employee', 'search_read', [[['work_email', '=', session.email]]], {
        fields: ['id'],
        limit: 1,
      });
      if (emps && emps.length > 0) {
        session.employee_id = emps[0].id;
        saveSession(session);
        return emps[0].id;
      }
    } catch (e) {
      console.warn('Failed to resolve employee by work_email:', e);
    }
  }
  return 3;
}

let pollState = null;

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  tagTypes: ['Dashboard', 'Attendance', 'Leaves', 'Assets', 'Poll', 'Profile'],
  endpoints: (builder) => ({
    getEmployeeDashboard: builder.query({
      queryFn: async () => {
        try {
          await ensureAuthenticated();
          const storedSession = getStoredSession() || {};
          const empId = await getEffectiveEmployeeId();

          // 1. Fetch live Employee record
          let emp = {};
          try {
            const empRecords = await callOdooKw('hr.employee', 'search_read', [[['id', '=', empId]]], {
              fields: ['name', 'job_title', 'department_id', 'work_location', 'attendance_state'],
            });
            emp = empRecords?.[0] || {};
          } catch (e) {
            console.warn('Could not read hr.employee, using stored profile');
          }

          // 2. Fetch Active and Recent Attendances live from hr.attendance
          const attendances = await callOdooKw('hr.attendance', 'search_read', [[['employee_id', '=', empId]]], {
            order: 'check_in desc',
            limit: 7,
          }) || [];

          const activeAttendance = attendances.find((a) => !a.check_out);
          const isClockedIn = Boolean(activeAttendance) || emp.attendance_state === 'checked_in';

          let shiftSeconds = 0;
          let clockInTime = '';
          const breakInfo = getStoredBreakState();

          if (!isClockedIn) {
            clearBreakState();
            breakInfo.onBreak = false;
            breakInfo.breakStartTime = null;
            breakInfo.accumulatedBreakSeconds = 0;
          } else if (activeAttendance && activeAttendance.check_in) {
            const checkInDate = new Date(activeAttendance.check_in.replace(' ', 'T') + 'Z');
            clockInTime = formatTime(activeAttendance.check_in);

            const rawElapsed = Math.max(0, Math.floor((Date.now() - checkInDate.getTime()) / 1000));
            let totalBreak = breakInfo.accumulatedBreakSeconds || 0;
            if (breakInfo.onBreak && breakInfo.breakStartTime) {
              const currentBreakDuration = Math.max(0, Math.floor((Date.now() - breakInfo.breakStartTime) / 1000));
              totalBreak += currentBreakDuration;
            }

            shiftSeconds = Math.max(0, rawElapsed - totalBreak);
          } else if (attendances.length > 0 && attendances[0].check_in) {
            clockInTime = formatTime(attendances[0].check_in);
          }

          let totalWeeklyHours = 0;
          const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const telemetryRows = attendances.slice(0, 5).reverse().map((att, idx) => {
            const cin = new Date(att.check_in.replace(' ', 'T') + 'Z');
            const dayName = daysOfWeek[cin.getDay()];
            const monthName = cin.toLocaleString('en-US', { month: 'short' });
            const dayNum = cin.getDate();
            const isToday = att.check_out === false || idx === attendances.slice(0, 5).length - 1;

            const worked = att.worked_hours || (shiftSeconds / 3600);
            totalWeeklyHours += worked;

            const tags = ['On-Time', 'Secure', 'Normal', 'On-Time'];
            const tag = isToday ? 'Active Shift' : tags[idx % tags.length];

            return {
              id: att.id,
              dateLabel: isToday ? `${dayName}, ${monthName} ${dayNum} (Today)` : `${dayName}, ${monthName} ${dayNum}`,
              punchIn: formatTime(att.check_in),
              punchOut: att.check_out ? formatTime(att.check_out) : 'In progress...',
              netTime: formatDuration(worked),
              statusTag: tag,
              isToday,
            };
          });

          // 3. Fetch Leave Allocations live from hr.leave.allocation
          const allocations = await callOdooKw('hr.leave.allocation', 'search_read', [[['employee_id', '=', empId], ['state', '=', 'validate']]], {
            fields: ['name', 'holiday_status_id', 'number_of_days'],
          }) || [];

          let casualAllotted = 0;
          let sickAllotted = 0;
          let wfhAllotted = 0;
          allocations.forEach((alloc) => {
            const name = (alloc.holiday_status_id?.[1] || alloc.name || '').toLowerCase();
            if (name.includes('wfh') || name.includes('work from home') || name.includes('remote')) {
              wfhAllotted += Number(alloc.number_of_days) || 0;
            } else if (name.includes('sick')) {
              sickAllotted += Number(alloc.number_of_days) || 0;
            } else if (name.includes('paid') || name.includes('casual')) {
              casualAllotted += Number(alloc.number_of_days) || 0;
            }
          });

          // Policy baseline fallback: Every employee has 3 Casual, 3 Sick, 6 WFH
          if (casualAllotted === 0) casualAllotted = 3;
          if (sickAllotted === 0) sickAllotted = 3;
          if (wfhAllotted === 0) wfhAllotted = 6;

          // 4. Fetch Submitted Leaves live from hr.leave
          const leaves = await callOdooKw('hr.leave', 'search_read', [[['employee_id', '=', empId]]], {
            fields: ['id', 'name', 'holiday_status_id', 'request_date_from', 'request_date_to', 'number_of_days', 'state'],
            order: 'create_date desc',
            limit: 10,
          }) || [];

          let casualTaken = 0;
          let sickTaken = 0;
          let wfhTaken = 0;
          leaves.forEach((lv) => {
            if (lv.state === 'validate' || lv.state === 'confirm') {
              const name = (lv.holiday_status_id?.[1] || lv.name || '').toLowerCase();
              if (name.includes('wfh') || name.includes('work from home') || name.includes('remote')) {
                wfhTaken += Number(lv.number_of_days) || 0;
              } else if (name.includes('sick')) {
                sickTaken += Number(lv.number_of_days) || 0;
              } else {
                casualTaken += Number(lv.number_of_days) || 0;
              }
            }
          });

          const activeLeave = leaves.length > 0 ? {
            name: leaves[0].name || (leaves[0].holiday_status_id ? leaves[0].holiday_status_id[1] : 'Leave Request'),
            subtext: `${leaves[0].holiday_status_id ? leaves[0].holiday_status_id[1] : 'Time Off'} • ${leaves[0].number_of_days || 1} Day(s)`,
            approver: 'Reporting Manager',
            state: leaves[0].state,
          } : null;

          // 5. Fetch Real Assigned Assets live from equipment.details
          const equips = await callOdooKw('equipment.details', 'search_read', [[['use_by', '=', empId]]], {
            fields: ['id', 'name', 'tag_no', 'comp_name', 'details', 'processor', 'ram', 'state'],
          }) || [];

          const assetsList = equips.map((eq) => {
            const isLap = (eq.name || '').toLowerCase().includes('nb') || (eq.name || '').toLowerCase().includes('mac');
            const isMon = (eq.name || '').toLowerCase().includes('mn') || (eq.name || '').toLowerCase().includes('monitor');
            return {
              id: eq.id,
              title: eq.details || eq.name,
              badge: eq.tag_no ? `Tag #${eq.tag_no}` : 'Active',
              meta: eq.processor || (isLap ? 'Core Machine' : isMon ? 'Display Output' : 'Security Hardware'),
              spec: eq.ram || 'Corporate Inventory',
              type: isLap ? 'laptop' : isMon ? 'monitor' : 'key',
            };
          });

          // 6. Fetch Real Team Members from hr.employee
          const colleagues = await callOdooKw('hr.employee', 'search_read', [[]], {
            fields: ['id', 'name', 'job_title', 'department_id', 'work_email'],
            limit: 8,
          }) || [];

          const teamMembers = colleagues
            .filter((c) => c.id !== empId)
            .map((c) => ({
              id: `emp-colleague-${c.id}`,
              name: c.name,
              role: c.job_title || 'Software Engineer',
              department: Array.isArray(c.department_id) ? c.department_id[1] : 'Engineering & Cloud Systems',
              dateLabel: 'Active',
              countdown: 'Team Member',
              avatarInitials: c.name
                .split(' ')
                .filter(Boolean)
                .map((w) => w[0])
                .join('')
                .toUpperCase()
                .slice(0, 2) || 'TM',
              avatarBg: 'bg-indigo-600',
              accentColor: 'border-slate-200 bg-white',
            }));

          // 7. Live active poll from survey.survey
          let livePoll = null;
          try {
            const surveys = await callOdooKw('survey.survey', 'search_read', [[['state', '!=', 'closed']]], {
              fields: ['id', 'title', 'state', 'answer_count'],
              limit: 1,
            });
            if (Array.isArray(surveys) && surveys.length > 0) {
              const s = surveys[0];
              livePoll = {
                id: String(s.id),
                title: s.title,
                badge: 'Open Ballot',
                totalVotes: s.answer_count || 0,
                userVotedId: null,
                options: [],
              };
            }
          } catch (e) {
            console.warn('Could not read survey.survey:', e);
          }

          // 8. Live project timesheets count & hours for this employee
          let timesheetsCount = 0;
          let timesheetsHours = 0;
          try {
            const tsLines = await callOdooKw('account.analytic.line', 'search_read', [[['employee_id', '=', empId]]], {
              fields: ['id', 'unit_amount'],
            });
            timesheetsCount = Array.isArray(tsLines) ? tsLines.length : 0;
            if (Array.isArray(tsLines)) {
              tsLines.forEach((t) => {
                timesheetsHours += Number(t.unit_amount) || 0;
              });
            }
          } catch (e) {
            console.warn('Could not count timesheets:', e);
          }

          // 9. Live projects count from project.project
          let projectsCount = 0;
          try {
            const prjs = await callOdooKw('project.project', 'search_count', [[]]);
            projectsCount = typeof prjs === 'number' ? prjs : 0;
          } catch (e) {
            console.warn('Could not count projects:', e);
          }

          // Merge profile without polluting with Aryan's default profile
          const activeUser = {
            ...storedSession,
            employee_id: empId,
            name: storedSession.name || emp.name || 'User',
            job_title: storedSession.job_title || emp.job_title || 'Software Engineer',
            department: storedSession.department || (Array.isArray(emp.department_id) ? emp.department_id[1] : 'Latitude Techno Labs'),
            location: storedSession.location || emp.work_location || 'Ahmedabad (WFO)',
            avatar_initials: (storedSession.name || emp.name || 'User')
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2),
          };

          const dashboardData = {
            user: activeUser,
            attendance: {
              clockedIn: isClockedIn,
              clockInTime: clockInTime || (attendances.length > 0 && attendances[0].check_in ? formatTime(attendances[0].check_in) : '--:--'),
              shiftSeconds: shiftSeconds,
              onBreak: breakInfo.onBreak,
              workMode: 'in_office',
              weeklyLoggedHours: Number(totalWeeklyHours.toFixed(1)),
              weeklyTarget: 40.0,
              telemetryRows,
            },
            leaveQuotas: {
              casual: {
                allotted: casualAllotted,
                used: casualTaken,
                left: Math.max(0, casualAllotted - casualTaken),
              },
              vacation: {
                allotted: casualAllotted,
                used: casualTaken,
                left: Math.max(0, casualAllotted - casualTaken),
              },
              sick: {
                allotted: sickAllotted,
                used: sickTaken,
                left: Math.max(0, sickAllotted - sickTaken),
              },
              wfh: {
                allotted: wfhAllotted,
                used: wfhTaken,
                left: Math.max(0, wfhAllotted - wfhTaken),
              },
              totalAllotted: casualAllotted + sickAllotted + wfhAllotted,
              totalUsed: casualTaken + sickTaken + wfhTaken,
              totalLeft: Math.max(0, (casualAllotted + sickAllotted + wfhAllotted) - (casualTaken + sickTaken + wfhTaken)),
              activeRequest: activeLeave ? {
                title: activeLeave.name,
                subtext: activeLeave.subtext,
                approver: activeLeave.approver,
                status: activeLeave.state === 'confirm' ? 'Pending Review' : (activeLeave.state === 'validate' ? 'Approved' : 'Pending Review'),
              } : null,
            },
            assets: assetsList,
            poll: livePoll,
            birthdays: teamMembers,
            timesheetsCount,
            timesheetsHours: Number(timesheetsHours.toFixed(1)),
            projectsCount,
          };

          return { data: dashboardData };
        } catch (err) {
          console.error('getEmployeeDashboard error:', err);
          return { error: { message: err.message || 'Failed to fetch dashboard' } };
        }
      },
      providesTags: ['Dashboard'],
    }),

    updateProfile: builder.mutation({
      queryFn: async (updatedData) => {
        try {
          const stored = getStoredSession() || {};
          const empId = stored.employee_id || 7;
          // 1. Try to sync with Odoo ORM hr.employee
          try {
            await callOdooKw('hr.employee', 'write', [[empId], {
              name: updatedData.name,
              job_title: updatedData.job_title,
              work_location: updatedData.location,
            }]);
          } catch (e) {
            console.warn('Odoo hr.employee write skipped, updating session locally:', e);
          }

          // 2. Update local storage session
          saveSession(updatedData);

          return { data: updatedData };
        } catch (err) {
          console.error('updateProfile failed:', err);
          return { error: { message: err.message || 'Profile update failed' } };
        }
      },
      invalidatesTags: ['Dashboard', 'Profile'],
    }),

    togglePunch: builder.mutation({
      queryFn: async () => {
        try {
          const empId = await getEffectiveEmployeeId();
          const result = await callOdooKw(
            'hr.employee',
            'attendance_manual',
            [[empId], 'hr_attendance.manual_attendance'],
            {}
          );

          const att = result?.action?.attendance || {};
          const isClockedIn = Boolean(att.id && !att.check_out);

          // If punched out, clear break state
          if (!isClockedIn) {
            clearBreakState();
          }

          return {
            data: {
              clockedIn: isClockedIn,
              clockInTime: att.check_in ? formatTime(att.check_in) : '',
              clockOutTime: att.check_out ? formatTime(att.check_out) : '',
              workedHours: att.worked_hours || 0,
            },
          };
        } catch (err) {
          console.error('togglePunch failed:', err);
          return { error: { message: err.message || 'Punch toggle failed' } };
        }
      },
      invalidatesTags: ['Dashboard', 'Attendance'],
    }),

    toggleBreak: builder.mutation({
      queryFn: async () => {
        const current = getStoredBreakState();
        if (!current.onBreak) {
          // Starting Tea Break
          const updated = {
            onBreak: true,
            breakStartTime: Date.now(),
            accumulatedBreakSeconds: current.accumulatedBreakSeconds || 0,
          };
          saveBreakState(updated);
          return { data: { onBreak: true } };
        } else {
          // Ending Tea Break - Back to Work
          const duration = current.breakStartTime
            ? Math.max(0, Math.floor((Date.now() - current.breakStartTime) / 1000))
            : 0;
          const updated = {
            onBreak: false,
            breakStartTime: null,
            accumulatedBreakSeconds: (current.accumulatedBreakSeconds || 0) + duration,
          };
          saveBreakState(updated);
          return { data: { onBreak: false } };
        }
      },
      invalidatesTags: ['Dashboard'],
    }),

    submitLeaveRequest: builder.mutation({
      queryFn: async (payload) => {
        try {
          const stored = getStoredSession() || {};
          let empId = stored.employee_id;
          if (!empId && stored.id) {
            try {
              const emps = await callOdooKw('hr.employee', 'search_read', [[['user_id', '=', stored.id]]], { fields: ['id'] });
              if (emps && emps.length > 0) empId = emps[0].id;
            } catch (e) {
              console.warn('Could not resolve empId for leave:', e);
            }
          }
          if (!empId) empId = 3;

          const startDate = payload.startDate || new Date().toISOString().split('T')[0];
          const endDate = payload.endDate || startDate;
          const days = Number(payload.days) || 1;

          let holidayStatusId = 1; // Default Paid Time Off
          if (!isNaN(Number(payload.leaveType)) && Number(payload.leaveType) > 0) {
            holidayStatusId = Number(payload.leaveType);
          } else if (payload.leaveType === 'sick') {
            holidayStatusId = 2;
          } else if (payload.leaveType === 'compensatory') {
            holidayStatusId = 3;
          } else if (payload.leaveType === 'wfh') {
            holidayStatusId = 5;
          }

          const res = await callOdooKw('hr.leave', 'create', [
            {
              name: payload.reason || payload.leaveLabel || 'Time Off Request',
              holiday_status_id: holidayStatusId,
              holiday_type: 'employee',
              employee_id: empId,
              date_from: `${startDate} 00:00:00`,
              date_to: `${endDate} 23:59:59`,
              request_date_from: startDate,
              request_date_to: endDate,
              number_of_days: days,
            },
          ]);
          return { data: { id: res } };
        } catch (err) {
          console.error('submitLeaveRequest failed:', err);
          return { error: { message: err.message || 'Leave request failed' } };
        }
      },
      invalidatesTags: ['Dashboard', 'Leaves'],
    }),

    submitPollVote: builder.mutation({
      queryFn: async ({ optionId }) => {
        pollState.userVotedId = optionId;
        pollState.hasVoted = true;
        let sum = 0;
        pollState.options = pollState.options.map((opt) => {
          const votes = opt.id === optionId ? opt.votes + 1 : opt.votes;
          sum += votes;
          return { ...opt, votes };
        });
        pollState.totalVotes = sum;
        pollState.options = pollState.options.map((opt) => ({
          ...opt,
          percentage: Math.round((opt.votes / sum) * 100),
        }));
        return { data: pollState };
      },
      invalidatesTags: ['Dashboard', 'Poll'],
    }),

    getSuperAdminDashboard: builder.query({
      queryFn: async () => {
        try {
          await ensureAuthenticated();
          const storedSession = getStoredSession() || {};
          let empId = storedSession.employee_id;
          if (!empId && storedSession.id) {
            try {
              const emps = await callOdooKw('hr.employee', 'search_read', [[['user_id', '=', storedSession.id]]], { fields: ['id'] });
              if (emps && emps.length > 0) empId = emps[0].id;
            } catch (e) {
              console.warn('Could not resolve employee id:', e);
            }
          }
          if (!empId) empId = 3;

          // 0. Live Employees from hr.employee for total headcount
          let rawEmployees = [];
          try {
            rawEmployees = (await callOdooKw('hr.employee', 'search_read', [[]], {
              fields: ['id', 'name'],
            })) || [];
          } catch (e) {
            console.warn('Could not read hr.employee:', e);
          }

          // 1. Live Projects from project.project
          let rawProjects = [];
          try {
            rawProjects = (await callOdooKw('project.project', 'search_read', [[]], {
              fields: ['id', 'name', 'task_count', 'date'],
              order: 'create_date desc',
              limit: 10,
            })) || [];
          } catch (e) {
            console.warn('Could not read project.project:', e);
          }

          // 2. Live Tasks from project.task
          let rawTasks = [];
          try {
            rawTasks = (await callOdooKw('project.task', 'search_read', [[]], {
              fields: ['id', 'name', 'project_id', 'stage_id', 'date_deadline'],
              order: 'create_date desc',
              limit: 20,
            })) || [];
          } catch (e) {
            console.warn('Could not read project.task:', e);
          }

          // 3. Live Attendances from hr.attendance
          let rawAttendances = [];
          try {
            rawAttendances = (await callOdooKw('hr.attendance', 'search_read', [[]], {
              fields: ['id', 'employee_id', 'check_in', 'check_out', 'worked_hours'],
              order: 'check_in desc',
              limit: 50,
            })) || [];
          } catch (e) {
            console.warn('Could not read hr.attendance:', e);
          }

          // 4. Live Leaves from hr.leave
          let rawLeaves = [];
          try {
            rawLeaves = (await callOdooKw('hr.leave', 'search_read', [[]], {
              fields: ['id', 'employee_id', 'holiday_status_id', 'request_date_from', 'request_date_to', 'state', 'number_of_days'],
              order: 'create_date desc',
              limit: 10,
            })) || [];
          } catch (e) {
            console.warn('Could not read hr.leave:', e);
          }

          // 5. Live Leave Allocations from hr.leave.allocation
          let rawAllocations = [];
          try {
            rawAllocations = (await callOdooKw('hr.leave.allocation', 'search_read', [[['employee_id', '=', empId], ['state', '=', 'validate']]], {
              fields: ['id', 'holiday_status_id', 'number_of_days'],
            })) || [];
          } catch (e) {
            console.warn('Could not read hr.leave.allocation:', e);
          }

          // 6. Live Timesheets from account.analytic.line
          let rawTimesheets = [];
          try {
            rawTimesheets = (await callOdooKw('account.analytic.line', 'search_read', [[]], {
              fields: ['id', 'name', 'unit_amount', 'date', 'project_id', 'employee_id'],
              order: 'date desc',
              limit: 20,
            })) || [];
          } catch (e) {
            console.warn('Could not read account.analytic.line:', e);
          }

          // Process metrics dynamically
          const myAttendances = rawAttendances.filter((a) => a.employee_id && a.employee_id[0] === empId);
          const activePunch = myAttendances.find((a) => !a.check_out);
          const isPresentToday = Boolean(activePunch) || (myAttendances.length > 0 && myAttendances[0].check_in && new Date(myAttendances[0].check_in).toDateString() === new Date().toDateString());
          const attendancePercent = rawAttendances.length > 0 ? 100 : 0;

          let totalAllocatedDays = 0;
          rawAllocations.forEach((alloc) => {
            totalAllocatedDays += Number(alloc.number_of_days) || 0;
          });
          let myTakenDays = 0;
          rawLeaves
            .filter((l) => l.employee_id && l.employee_id[0] === empId && (l.state === 'validate' || l.state === 'confirm'))
            .forEach((l) => {
              myTakenDays += Number(l.number_of_days) || 0;
            });
          const leaveBalanceDays = Math.max(0, totalAllocatedDays - myTakenDays);

          const todayIso = new Date().toISOString().split('T')[0];
          const overdueTasksCount = rawTasks.filter((t) => t.date_deadline && t.date_deadline < todayIso).length;

          // Upcoming Leaves
          const upcomingLeaves = rawLeaves.map((l) => {
            const empName = l.employee_id ? l.employee_id[1] : 'Employee';
            const initials = empName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);
            const leaveType = l.holiday_status_id ? l.holiday_status_id[1] : 'Leave';
            const dateStr = l.request_date_from && l.request_date_to
              ? `${l.request_date_from} • ${l.request_date_to}`
              : (l.request_date_from || 'Scheduled');
            let statusLabel = 'Applied';
            let statusColor = 'bg-slate-100 text-slate-700 border-slate-200';
            if (l.state === 'validate') {
              statusLabel = 'Approved';
              statusColor = 'bg-blue-50 text-blue-700 border-blue-200';
            } else if (l.state === 'confirm') {
              statusLabel = 'Pending';
              statusColor = 'bg-amber-50 text-amber-700 border-amber-200';
            }
            return {
              id: l.id,
              name: empName,
              initials,
              leaveType,
              dateStr,
              statusLabel,
              statusColor,
            };
          });

          // Calculate dynamic Mon - Fri attendance rates from live hr.attendance records
          const now = new Date();
          const currentDayOfWeek = now.getDay();
          const mondayDate = new Date(now);
          mondayDate.setDate(now.getDate() - (currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1));
          
          const weeklyRates = [0, 0, 0, 0, 0];
          for (let i = 0; i < 5; i++) {
            const d = new Date(mondayDate);
            d.setDate(mondayDate.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            const countForDay = rawAttendances.filter((a) => a.check_in && a.check_in.startsWith(dateStr)).length;
            const totalEmps = rawEmployees.length || 1;
            weeklyRates[i] = countForDay > 0 ? Math.min(100, Math.round((countForDay / totalEmps) * 100)) : 0;
          }

          // Projects list from live project.project
          const projectsList = rawProjects.slice(0, 4).map((p) => {
            const dueStr = p.date ? `Due: ${p.date}` : 'Ongoing';
            const progress = p.task_count > 0 ? Math.min(100, p.task_count * 25) : 0;
            return {
              id: p.id,
              name: p.name,
              progress,
              dueStr,
              tasksCount: p.task_count || 0,
            };
          });

          // Timesheets from live account.analytic.line
          let loggedHours = 0;
          rawTimesheets.forEach((t) => {
            loggedHours += Number(t.unit_amount) || 0;
          });
          loggedHours = Math.round(loggedHours * 10) / 10;
          const requiredHours = 40;
          const timesheetPercent = Math.min(100, Math.round((loggedHours / (requiredHours || 1)) * 100));

          // Activity Timeline derived from real records
          const activities = [];
          if (rawTimesheets.length > 0) {
            activities.push({
              id: 'act-ts-1',
              title: `Logged timesheet for ${rawTimesheets[0].name || 'Project Work'}`,
              time: rawTimesheets[0].date || 'Recent',
              color: 'bg-purple-500',
            });
          }
          if (rawLeaves.length > 0) {
            activities.push({
              id: 'act-lv-1',
              title: `Leave request "${rawLeaves[0].holiday_status_id?.[1] || 'Leave'}" is ${rawLeaves[0].state === 'validate' ? 'approved' : 'pending review'}`,
              time: rawLeaves[0].request_date_from || 'Recent',
              color: 'bg-amber-500',
            });
          }
          if (rawProjects.length > 0) {
            activities.push({
              id: 'act-pr-1',
              title: `Active project: "${rawProjects[0].name}"`,
              time: 'Recent',
              color: 'bg-emerald-500',
            });
          }
          if (rawAttendances.length > 0) {
            activities.push({
              id: 'act-att-1',
              title: `Attendance logged for ${rawAttendances[0].employee_id?.[1] || 'Employee'}`,
              time: 'Today',
              color: 'bg-blue-500',
            });
          }

          return {
            data: {
              user: storedSession,
              attendance: {
                percent: attendancePercent,
                isPresentToday,
                weeklyBarData: weeklyRates,
              },
              leaveBalance: {
                totalDays: leaveBalanceDays,
                carryForward: 0,
              },
              tasks: {
                totalCount: rawTasks.length,
                overdueCount: overdueTasksCount,
              },
              projects: {
                totalCount: rawProjects.length,
                list: projectsList,
              },
              timesheet: {
                loggedHours,
                requiredHours,
                percent: timesheetPercent,
                remainingHours: Math.max(0, requiredHours - loggedHours),
              },
              upcomingLeaves,
              recentActivities: activities,
            },
          };
        } catch (err) {
          console.error('getSuperAdminDashboard error:', err);
          return { error: { message: err.message || 'Failed to fetch dashboard' } };
        }
      },
      providesTags: ['Dashboard'],
    }),
  }),
});

export const {
  useGetEmployeeDashboardQuery,
  useGetSuperAdminDashboardQuery,
  useUpdateProfileMutation,
  useTogglePunchMutation,
  useToggleBreakMutation,
  useSubmitLeaveRequestMutation,
  useSubmitPollVoteMutation,
} = apiSlice;
