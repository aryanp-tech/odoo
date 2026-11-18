// src/pages/employee/ProfilePage.jsx
// Executive Employee Profile with Photo Upload, Two-Column Organization Details, and 6 Tabs

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import TopNavbar from '../../components/layout/TopNavbar';
import { getStoredSession, saveSession } from '../../services/authService';
import { callOdooKw } from '../../services/api/apiSlice';
import {
  Camera,
  Upload,
  Trash2,
  Building,
  Briefcase,
  Award,
  Shield,
  Laptop,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Edit3,
  Save,
  CheckSquare,
  Square,
  Sparkles,
  RotateCcw,
  Mail,
  Phone,
  MapPin,
  Clock,
  User,
  Heart,
  FileText,
  BadgeAlert,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const navigate = useNavigate();
  const sessionUser = getStoredSession();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('private'); // work, badges, private, hr, exit, equipment
  const [isEditing, setIsEditing] = useState(false);
  const [badgesList, setBadgesList] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);

  // Live profile data from Odoo backend
  const [profile, setProfile] = useState({
    photo: sessionUser?.photo || '',
    workMobile: '',
    workPhone: '',
    workEmail: sessionUser?.email || '',
    workingType: 'Hybrid (Full-Time)',
    department: sessionUser?.department || 'Engineering & Cloud Systems',
    manager: 'Leadership Board',
    coach: 'Leadership Board',
    readOnly: true,
    probation: false,
    mentorName: '',
    techLead: '',
    privateAddress: 'Ahmedabad, Gujarat, India',
    privateEmail: sessionUser?.email || '',
    privatePhone: '',
    pfAccount: true,
    universalAccountNo: '',
    identificationNo: '',
    panNo: '',
    passportNo: '',
    gender: 'Male',
    dateOfBirth: '',
    maritalStatus: 'Single',
    emergencyName: '',
    emergencyPhone: '',
    workLocation: 'Latitude Techno Labs HQ',
    timeOffApprover: 'Reporting Manager',
    projectApprover: 'Project Lead',
    timesheetApprover: 'Project Leader',
    workingSchedule: 'Standard 40h / Week (09:00 - 18:00 IST)',
    timezone: 'Asia/Kolkata (IST)',
    employeeType: 'Regular Full-Time',
    badgeId: sessionUser?.badge_id || '6APX-77402',
    pinCode: '••••',
    jobPosition: sessionUser?.job_title || 'Software Engineer',
    noticePeriod: '60 Days',
  });

  const [editForm, setEditForm] = useState(profile);

  // Load real employee profile, real badges, and real equipment from Odoo backend
  useEffect(() => {
    async function loadLiveEmployeeData() {
      try {
        const stored = getStoredSession();
        const empId = stored.employee_id || 3;

        // 1. Fetch real hr.employee record
        const empRecords = await callOdooKw('hr.employee', 'search_read', [[['id', '=', empId]]], {
          fields: [
            'id',
            'name',
            'work_email',
            'work_phone',
            'mobile_phone',
            'department_id',
            'job_title',
            'work_location',
            'parent_id',
            'coach_id',
            'working_type',
            'probabtion',
            'mentor_id',
            'lead_id',
            'pf_account',
            'uan',
            'pan_no',
            'identification_id',
            'barcode',
            'emergency_contact',
            'emergency_phone',
            'pin',
            'blood_group',
            'aadhar_no',
            'gender',
            'marital',
            'birthday',
          ],
        });

        if (Array.isArray(empRecords) && empRecords.length > 0) {
          const emp = empRecords[0];
          const loaded = {
            photo: stored.photo || '',
            workMobile: emp.mobile_phone || '',
            workPhone: emp.work_phone || '',
            workEmail: emp.work_email || stored.email || '',
            workingType: emp.working_type || 'Hybrid (Full-Time)',
            department: Array.isArray(emp.department_id) ? emp.department_id[1] : (stored.department || 'Engineering & Cloud Systems'),
            manager: Array.isArray(emp.parent_id) ? emp.parent_id[1] : 'Leadership Board',
            coach: Array.isArray(emp.coach_id) ? emp.coach_id[1] : 'Leadership Board',
            readOnly: true,
            probation: Boolean(emp.probabtion),
            mentorName: Array.isArray(emp.mentor_id) ? emp.mentor_id[1] : '',
            techLead: Array.isArray(emp.lead_id) ? emp.lead_id[1] : '',
            privateAddress: 'Ahmedabad, Gujarat, India',
            privateEmail: emp.work_email || stored.email || '',
            privatePhone: emp.mobile_phone || '',
            pfAccount: Boolean(emp.pf_account),
            universalAccountNo: emp.uan || '',
            identificationNo: emp.identification_id || emp.aadhar_no || '',
            panNo: emp.pan_no || '',
            passportNo: '',
            gender: emp.gender === 'male' ? 'Male' : emp.gender === 'female' ? 'Female' : 'Other',
            dateOfBirth: emp.birthday || '',
            maritalStatus: emp.marital || 'Single',
            emergencyName: emp.emergency_contact || '',
            emergencyPhone: emp.emergency_phone || '',
            workLocation: emp.work_location || 'Latitude Techno Labs HQ',
            timeOffApprover: Array.isArray(emp.parent_id) ? emp.parent_id[1] : 'Reporting Manager',
            expenseApprover: 'HR Operations Desk',
            timesheetApprover: 'Project Leader',
            workingSchedule: 'Standard 40h / Week (09:00 - 18:00 IST)',
            timezone: 'Asia/Kolkata (IST)',
            employeeType: 'Regular Full-Time',
            badgeId: emp.barcode || stored.badge_id || `6APX-774${String(emp.id).padStart(2, '0')}`,
            pinCode: emp.pin || '••••',
            jobPosition: emp.job_title || stored.job_title || 'Software Engineer',
            noticePeriod: '60 Days',
          };
          setProfile(loaded);
          setEditForm(loaded);
        }

        // 2. Fetch real gamification badges from Odoo
        const badgeRecords = await callOdooKw('gamification.badge', 'search_read', [[]], {
          fields: ['id', 'name', 'description'],
        });
        if (Array.isArray(badgeRecords) && badgeRecords.length > 0) {
          const colors = ['from-amber-400 to-amber-600', 'from-blue-500 to-indigo-600', 'from-purple-500 to-violet-600', 'from-emerald-500 to-teal-600'];
          setBadgesList(badgeRecords.map((b, idx) => ({
            id: String(b.id),
            name: b.name,
            issuer: 'Leadership Team',
            date: 'Awarded 2026',
            desc: b.description || 'Recognized for excellent engineering contributions.',
            color: colors[idx % colors.length],
          })));
        }

        // 3. Fetch real equipment from equipment.details
        const equipRecords = await callOdooKw('equipment.details', 'search_read', [[['use_by', '=', empId]]], {
          fields: ['id', 'name', 'tag_no', 'comp_name', 'state', 'details'],
        });
        if (Array.isArray(equipRecords) && equipRecords.length > 0) {
          setEquipmentList(equipRecords.map((eq) => ({
            id: String(eq.id),
            name: eq.details || eq.name,
            category: 'Assigned Asset',
            code: eq.tag_no ? `Tag #${eq.tag_no}` : eq.name,
            serial: eq.name,
            date: 'Active Custody',
            status: 'Active',
          })));
        }
      } catch (err) {
        console.warn('Live profile fetch warning:', err);
      }
    }
    loadLiveEmployeeData();
  }, []);

  // Sync session changes if photo changed elsewhere
  useEffect(() => {
    if (sessionUser?.photo && sessionUser.photo !== profile.photo) {
      setProfile((prev) => ({ ...prev, photo: sessionUser.photo }));
      setEditForm((prev) => ({ ...prev, photo: sessionUser.photo }));
    }
  }, [sessionUser?.photo]);

  const handleStartEdit = () => {
    setEditForm(profile);
    setIsEditing(true);
  };

  const handleInputChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image file size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      setEditForm((prev) => ({ ...prev, photo: dataUrl }));
      setProfile((prev) => {
        const updated = { ...prev, photo: dataUrl };
        try {
          localStorage.setItem('portal_employee_profile_v2', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });

      // Update session so TopNavbar & Sidebar update immediately
      const current = getStoredSession();
      saveSession({ ...current, photo: dataUrl });
      toast.success('Employee photo uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setEditForm((prev) => ({ ...prev, photo: '' }));
    setProfile((prev) => {
      const updated = { ...prev, photo: '' };
      try {
        localStorage.setItem('portal_employee_profile_v2', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    const current = getStoredSession();
    const { photo, ...rest } = current;
    saveSession(rest);
    toast.success('Employee photo removed');
  };

  const handleSaveProfile = () => {
    setProfile(editForm);
    try {
      localStorage.setItem('portal_employee_profile_v2', JSON.stringify(editForm));
    } catch {
      // ignore
    }

    // Save to active session
    const current = getStoredSession();
    saveSession({
      ...current,
      photo: editForm.photo,
      name: sessionUser.name,
      job_title: editForm.jobPosition || current.job_title,
    });

    setIsEditing(false);
    toast.success('Employee profile updated successfully!');
  };

  const handleCancelEdit = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  const handleResetToBackendData = () => {
    setEditForm(profile);
    toast.success('Reset to live backend data');
  };

  const handleClearPersonalData = () => {
    setEditForm((prev) => ({
      ...prev,
      privateAddress: '',
      privateEmail: '',
      privatePhone: '',
      pfAccount: false,
      universalAccountNo: '',
      identificationNo: '',
      panNo: '',
    }));
    toast.success('Personal information reset to 0%');
  };

  // Calculate Personal Information Completion % dynamically based on user data
  const currentData = isEditing ? editForm : profile;
  const personalFields = [
    Boolean(currentData.privateAddress && currentData.privateAddress.trim()),
    Boolean(currentData.privateEmail && currentData.privateEmail.trim()),
    Boolean(currentData.privatePhone && currentData.privatePhone.trim()),
    Boolean(currentData.pfAccount),
    Boolean(currentData.universalAccountNo && currentData.universalAccountNo.trim()),
    Boolean(currentData.identificationNo && currentData.identificationNo.trim()),
  ];
  const filledCount = personalFields.filter(Boolean).length;
  const personalInfoPercent = Math.round((filledCount / personalFields.length) * 100);

  const TABS = [
    { id: 'work', label: 'Work Information' },
    { id: 'badges', label: `Received Badges (${badgesList.length})` },
    { id: 'private', label: 'Private Information' },
    { id: 'hr', label: 'HR Settings' },
    { id: 'exit', label: 'Exit data' },
    { id: 'equipment', label: `Equipment (${equipmentList.length})` },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7fb] flex text-slate-800 font-sans antialiased">
      {/* 1. Sidebar */}
      <Sidebar activeTab="profile" />

      {/* 2. Main Content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
        <TopNavbar />

        <main className="flex-1 p-5 md:p-8 max-w-6xl w-full mx-auto space-y-6">
          {/* Top Breadcrumb & Action Controls */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500 font-medium">
              <span className="text-slate-400">Employees / </span>
              <span className="font-bold text-slate-800">{sessionUser.name || 'Aryan Patel'}</span>
            </div>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors cursor-pointer"
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-sm transition-all cursor-pointer"
                  >
                    <Save size={13} />
                    <span>Save Changes</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  <Edit3 size={13} />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          {/* Elevated Employee Profile Sheet Canvas */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 md:p-8 space-y-8">
            {/* Header: Employee Photo, Name, Role, and Circular Progress Ring */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-5">
                {/* Employee Photo Upload Box */}
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-md border-2 border-white ring-2 ring-slate-200/80 flex items-center justify-center">
                    {currentData.photo ? (
                      <img
                        src={currentData.photo}
                        alt={sessionUser.name || 'Aryan Patel'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white font-black text-2xl tracking-wider">
                        <span>{sessionUser.avatar_initials || 'AP'}</span>
                        <span className="text-[10px] font-semibold opacity-80 mt-1">Add Photo</span>
                      </div>
                    )}
                  </div>

                  {/* Upload / Change Photo Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload / Change Photo"
                    className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-white border border-slate-200 shadow-md text-slate-700 hover:text-indigo-600 hover:bg-slate-50 transition-all cursor-pointer group-hover:scale-105"
                  >
                    <Camera size={15} />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>

                {/* Name, Designation, and Status */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                      {sessionUser.name || 'Aryan Patel'}
                    </h1>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Active Full-Time</span>
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-indigo-600 font-bold">{currentData.jobPosition || 'Software Engineer'}</span>
                    <span>•</span>
                    <span>{currentData.department || 'Engineering & Cloud Systems'}</span>
                    <span>•</span>
                    <span className="font-mono text-slate-400">Badge: {currentData.badgeId || '6APX-77402'}</span>
                  </div>

                  {currentData.photo && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:text-rose-700 hover:underline cursor-pointer"
                      >
                        <Trash2 size={12} />
                        <span>Remove Photo</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Information Completion Metric Ring */}
              <div className="flex items-center gap-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 shadow-2xs self-start md:self-center">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-12 h-12 transform -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="19"
                      stroke="#e2e8f0"
                      strokeWidth="3.5"
                      fill="transparent"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="19"
                      stroke={personalInfoPercent === 100 ? '#10b981' : personalInfoPercent > 0 ? '#4f46e5' : '#94a3b8'}
                      strokeWidth="3.5"
                      strokeDasharray={119.38}
                      strokeDashoffset={119.38 - (119.38 * personalInfoPercent) / 100}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-500 ease-out"
                    />
                  </svg>
                  <span className="absolute text-xs font-bold text-slate-800">
                    {personalInfoPercent}%
                  </span>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 leading-tight">Personal Info</div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                    {personalInfoPercent === 100 ? 'Fully completed' : `${filledCount} of ${personalFields.length} completed`}
                  </div>
                </div>
              </div>
            </div>

            {/* Top Two-Column Form Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3.5 text-xs">
              {/* Left Column: Work Contact & Schedule */}
              <div className="space-y-3">
                {/* Work Mobile */}
                <div className="grid grid-cols-3 items-center">
                  <span className="font-bold text-slate-700">Work Mobile</span>
                  <div className="col-span-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.workMobile}
                        onChange={(e) => handleInputChange('workMobile', e.target.value)}
                        placeholder="e.g. +91 98765 01234"
                        className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      />
                    ) : (
                      <span className="text-slate-800 font-medium">{profile.workMobile || '—'}</span>
                    )}
                  </div>
                </div>

                {/* Work Phone */}
                <div className="grid grid-cols-3 items-center">
                  <span className="font-bold text-slate-700">Work Phone</span>
                  <div className="col-span-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.workPhone}
                        onChange={(e) => handleInputChange('workPhone', e.target.value)}
                        placeholder="e.g. +91 79 4000 1234"
                        className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      />
                    ) : (
                      <span className="text-slate-800 font-medium">{profile.workPhone || '—'}</span>
                    )}
                  </div>
                </div>

                {/* Work Email */}
                <div className="grid grid-cols-3 items-center">
                  <span className="font-bold text-slate-700">Work Email</span>
                  <div className="col-span-2">
                    <a
                      href={`mailto:${profile.workEmail}`}
                      className="text-indigo-600 hover:text-indigo-800 hover:underline font-semibold"
                    >
                      {profile.workEmail}
                    </a>
                  </div>
                </div>

                {/* Working Type */}
                <div className="grid grid-cols-3 items-center">
                  <span className="font-bold text-slate-700">Working Type</span>
                  <div className="col-span-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.workingType}
                        onChange={(e) => handleInputChange('workingType', e.target.value)}
                        placeholder="e.g. Hybrid (Full-Time)"
                        className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      />
                    ) : (
                      <span className="text-slate-800 font-medium">{profile.workingType || '—'}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Organization & Hierarchy */}
              <div className="space-y-3">
                {/* Department */}
                <div className="grid grid-cols-3 items-center">
                  <span className="font-bold text-slate-700">Department</span>
                  <div className="col-span-2">
                    <span className="text-indigo-700 font-semibold">{profile.department}</span>
                  </div>
                </div>

                {/* Manager */}
                <div className="grid grid-cols-3 items-center">
                  <span className="font-bold text-slate-700">Manager</span>
                  <div className="col-span-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.manager}
                        onChange={(e) => handleInputChange('manager', e.target.value)}
                        placeholder="Manager Name"
                        className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      />
                    ) : (
                      <span className="text-slate-800 font-medium">{profile.manager || '—'}</span>
                    )}
                  </div>
                </div>

                {/* Coach */}
                <div className="grid grid-cols-3 items-center">
                  <span className="font-bold text-slate-700">Coach</span>
                  <div className="col-span-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.coach}
                        onChange={(e) => handleInputChange('coach', e.target.value)}
                        placeholder="Coach Name"
                        className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      />
                    ) : (
                      <span className="text-slate-800 font-medium">{profile.coach || '—'}</span>
                    )}
                  </div>
                </div>

                {/* Read Only & Probation */}
                <div className="grid grid-cols-3 items-center">
                  <span className="font-bold text-slate-700">Read Only</span>
                  <div className="col-span-2 flex items-center">
                    <button
                      type="button"
                      disabled={!isEditing}
                      onClick={() => handleInputChange('readOnly', !editForm.readOnly)}
                      className="cursor-pointer text-indigo-600 disabled:cursor-default"
                    >
                      {editForm.readOnly ? <CheckSquare size={16} /> : <Square size={16} className="text-slate-300" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 items-center">
                  <span className="font-bold text-slate-700">Probation</span>
                  <div className="col-span-2 flex items-center">
                    <button
                      type="button"
                      disabled={!isEditing}
                      onClick={() => handleInputChange('probation', !editForm.probation)}
                      className="cursor-pointer text-indigo-600 disabled:cursor-default"
                    >
                      {editForm.probation ? <CheckSquare size={16} /> : <Square size={16} className="text-slate-300" />}
                    </button>
                  </div>
                </div>

                {/* Mentor Name */}
                <div className="grid grid-cols-3 items-center">
                  <span className="font-bold text-slate-700">Mentor Name</span>
                  <div className="col-span-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.mentorName}
                        onChange={(e) => handleInputChange('mentorName', e.target.value)}
                        placeholder="Mentor Name"
                        className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      />
                    ) : (
                      <span className="text-slate-800 font-medium">{profile.mentorName || '—'}</span>
                    )}
                  </div>
                </div>

                {/* Tech Lead */}
                <div className="grid grid-cols-3 items-center">
                  <span className="font-bold text-slate-700">Tech Lead</span>
                  <div className="col-span-2">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.techLead}
                        onChange={(e) => handleInputChange('techLead', e.target.value)}
                        placeholder="Tech Lead Name"
                        className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                      />
                    ) : (
                      <span className="text-slate-800 font-medium">{profile.techLead || '—'}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Form Tabs Bar */}
            <div className="border-b border-slate-200 pt-2">
              <nav className="flex flex-wrap items-center gap-1 sm:gap-2 -mb-px">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 sm:px-4 py-2.5 text-xs font-bold transition-all cursor-pointer border-b-2 ${
                        isActive
                          ? 'border-indigo-600 text-indigo-600 bg-white'
                          : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* TAB 1: Private Information */}
            {activeTab === 'private' && (
              <div className="space-y-6 animate-in fade-in duration-150 text-xs">
                {/* Personal Information Progress & Quick Actions */}
                <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      {personalInfoPercent}%
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">
                        Personal Information Completion ({filledCount} of {personalFields.length} completed)
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {personalInfoPercent === 100
                          ? 'All private contact and identification fields are verified.'
                          : 'Fill in Address, Email, Phone, PF, UAN, and Identification No to complete profile.'}
                      </div>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleResetToBackendData}
                        className="px-2.5 py-1 text-[11px] font-semibold text-indigo-700 hover:text-indigo-950 bg-white border border-indigo-300 rounded-lg shadow-2xs hover:bg-indigo-50 transition-colors cursor-pointer"
                      >
                        Reset to Backend
                      </button>
                      <button
                        type="button"
                        onClick={handleClearPersonalData}
                        className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-rose-600 bg-white border border-slate-300 rounded-lg shadow-2xs hover:bg-rose-50 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <RotateCcw size={11} /> Clear (0%)
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStartEdit}
                      className="px-3 py-1 text-[11px] font-bold text-indigo-700 bg-white border border-indigo-200 hover:border-indigo-400 rounded-lg shadow-2xs transition-colors cursor-pointer"
                    >
                      Update Details
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  {/* Column 1: Private Contact */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-1.5">
                      <MapPin size={15} className="text-indigo-600" />
                      <span>Private Contact</span>
                    </h3>

                    <div className="space-y-3">
                      {/* Address */}
                      <div className="grid grid-cols-3 items-start">
                        <span className="font-bold text-slate-700 mt-1">Address</span>
                        <div className="col-span-2">
                          {isEditing ? (
                            <textarea
                              rows={3}
                              value={editForm.privateAddress}
                              onChange={(e) => handleInputChange('privateAddress', e.target.value)}
                              placeholder="Enter permanent private address"
                              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                            />
                          ) : (
                            <p className="text-slate-800 font-medium leading-relaxed">
                              {profile.privateAddress || '—'}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Email */}
                      <div className="grid grid-cols-3 items-center">
                        <span className="font-bold text-slate-700">Email</span>
                        <div className="col-span-2">
                          {isEditing ? (
                            <input
                              type="email"
                              value={editForm.privateEmail}
                              onChange={(e) => handleInputChange('privateEmail', e.target.value)}
                              placeholder="Personal email address"
                              className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                            />
                          ) : (
                            profile.privateEmail ? (
                              <a
                                href={`mailto:${profile.privateEmail}`}
                                className="text-indigo-600 hover:underline font-semibold"
                              >
                                {profile.privateEmail}
                              </a>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )
                          )}
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="grid grid-cols-3 items-center">
                        <span className="font-bold text-slate-700">Phone</span>
                        <div className="col-span-2">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.privatePhone}
                              onChange={(e) => handleInputChange('privatePhone', e.target.value)}
                              placeholder="Personal phone number"
                              className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                            />
                          ) : (
                            <span className="text-slate-800 font-medium">{profile.privatePhone || '—'}</span>
                          )}
                        </div>
                      </div>

                      {/* PF Account */}
                      <div className="grid grid-cols-3 items-center">
                        <span className="font-bold text-slate-700">PF Account</span>
                        <div className="col-span-2 flex items-center">
                          <button
                            type="button"
                            disabled={!isEditing}
                            onClick={() => handleInputChange('pfAccount', !editForm.pfAccount)}
                            className="cursor-pointer text-indigo-600 disabled:cursor-default"
                          >
                            {editForm.pfAccount ? <CheckSquare size={16} /> : <Square size={16} className="text-slate-300" />}
                          </button>
                        </div>
                      </div>

                      {/* Universal Account No */}
                      <div className="grid grid-cols-3 items-center">
                        <span className="font-bold text-slate-700">Universal Account No</span>
                        <div className="col-span-2">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.universalAccountNo}
                              onChange={(e) => handleInputChange('universalAccountNo', e.target.value)}
                              placeholder="12-digit UAN"
                              className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                            />
                          ) : (
                            <span className="text-slate-800 font-mono font-semibold">
                              {profile.universalAccountNo || '—'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Identification ID */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-1.5">
                      <Shield size={15} className="text-indigo-600" />
                      <span>Identification ID</span>
                    </h3>

                    <div className="space-y-3">
                      {/* Identification No */}
                      <div className="grid grid-cols-3 items-center">
                        <span className="font-bold text-slate-700">Identification No</span>
                        <div className="col-span-2">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.identificationNo}
                              onChange={(e) => handleInputChange('identificationNo', e.target.value)}
                              placeholder="National ID / Aadhaar"
                              className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                            />
                          ) : (
                            <span className="text-slate-800 font-mono font-semibold">
                              {profile.identificationNo || '—'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* PAN Card */}
                      <div className="grid grid-cols-3 items-center">
                        <span className="font-bold text-slate-700">PAN Card No</span>
                        <div className="col-span-2">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.panNo}
                              onChange={(e) => handleInputChange('panNo', e.target.value)}
                              placeholder="10-digit PAN"
                              className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                            />
                          ) : (
                            <span className="text-slate-800 font-mono font-semibold">{profile.panNo || '—'}</span>
                          )}
                        </div>
                      </div>

                      {/* Passport */}
                      <div className="grid grid-cols-3 items-center">
                        <span className="font-bold text-slate-700">Passport No</span>
                        <div className="col-span-2">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.passportNo}
                              onChange={(e) => handleInputChange('passportNo', e.target.value)}
                              placeholder="Passport number"
                              className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                            />
                          ) : (
                            <span className="text-slate-800 font-mono font-semibold">{profile.passportNo || '—'}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Family & Emergency Contact */}
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Heart size={13} className="text-rose-500" />
                        <span>Family &amp; Emergency Contact</span>
                      </h4>

                      <div className="space-y-2.5">
                        <div className="grid grid-cols-3 items-center">
                          <span className="font-bold text-slate-700">Gender</span>
                          <div className="col-span-2">
                            <span className="text-slate-800 font-medium">{profile.gender}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 items-center">
                          <span className="font-bold text-slate-700">Emergency Contact</span>
                          <div className="col-span-2">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editForm.emergencyName}
                                onChange={(e) => handleInputChange('emergencyName', e.target.value)}
                                placeholder="Contact Name"
                                className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                              />
                            ) : (
                              <span className="text-slate-800 font-medium">{profile.emergencyName || '—'}</span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 items-center">
                          <span className="font-bold text-slate-700">Emergency Phone</span>
                          <div className="col-span-2">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editForm.emergencyPhone}
                                onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                                placeholder="Phone number"
                                className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                              />
                            ) : (
                              <span className="text-slate-800 font-medium">{profile.emergencyPhone || '—'}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Work Information */}
            {activeTab === 'work' && (
              <div className="space-y-6 animate-in fade-in duration-150 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  {/* Location & Approvers */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-1.5">
                      <Building size={15} className="text-indigo-600" />
                      <span>Work Location &amp; Approvals</span>
                    </h3>

                    <div className="space-y-3 pt-1">
                      <div className="grid grid-cols-3 items-center">
                        <span className="font-bold text-slate-700">Work Location</span>
                        <span className="col-span-2 text-slate-800 font-medium">{profile.workLocation}</span>
                      </div>
                      <div className="grid grid-cols-3 items-center">
                        <span className="font-bold text-slate-700">Time Off Approver</span>
                        <span className="col-span-2 text-slate-800 font-medium">{profile.timeOffApprover}</span>
                      </div>
                      <div className="grid grid-cols-3 items-center">
                        <span className="font-bold text-slate-700">Project Approver</span>
                        <span className="col-span-2 text-slate-800 font-medium">{profile.projectApprover || 'Project Lead'}</span>
                      </div>
                      <div className="grid grid-cols-3 items-center">
                        <span className="font-bold text-slate-700">Timesheet Approver</span>
                        <span className="col-span-2 text-slate-800 font-medium">{profile.timesheetApprover}</span>
                      </div>
                    </div>
                  </div>

                  {/* Schedule & Timezone */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-1.5">
                      <Clock size={15} className="text-indigo-600" />
                      <span>Working Schedule</span>
                    </h3>

                    <div className="space-y-3 pt-1">
                      <div className="grid grid-cols-3 items-center">
                        <span className="font-bold text-slate-700">Working Hours</span>
                        <span className="col-span-2 text-slate-800 font-medium">{profile.workingSchedule}</span>
                      </div>
                      <div className="grid grid-cols-3 items-center">
                        <span className="font-bold text-slate-700">Timezone</span>
                        <span className="col-span-2 text-slate-800 font-medium">{profile.timezone}</span>
                      </div>
                      <div className="grid grid-cols-3 items-center">
                        <span className="font-bold text-slate-700">Assigned Node</span>
                        <span className="col-span-2 font-mono text-indigo-700 font-bold">{sessionUser.node || 'HQ-EMEA-01'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Received Badges */}
            {activeTab === 'badges' && (
              <div className="space-y-5 animate-in fade-in duration-150 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Recognitions &amp; Honors</h3>
                    <p className="text-slate-500 text-[11px]">Peer recognition and leadership commendations</p>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
                    {badgesList.length} Badges Awarded
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {badgesList.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-indigo-300 hover:shadow-sm transition-all space-y-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${b.color} text-white flex items-center justify-center shadow-xs shrink-0`}>
                          <Award size={18} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs">{b.name}</h4>
                          <span className="text-[10px] text-slate-400 font-medium">Issued by {b.issuer} • {b.date}</span>
                        </div>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed pt-1">
                        {b.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: HR Settings */}
            {activeTab === 'hr' && (
              <div className="space-y-5 animate-in fade-in duration-150 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-indigo-900">Contract &amp; Status</h3>
                    <div className="space-y-2.5 pt-1">
                      <div className="grid grid-cols-3 items-center">
                        <span className="font-bold text-slate-700">Employee Type</span>
                        <span className="col-span-2 text-slate-800 font-medium">{profile.employeeType}</span>
                      </div>
                      <div className="grid grid-cols-3 items-center">
                        <span className="font-bold text-slate-700">Badge ID</span>
                        <span className="col-span-2 font-mono font-bold text-slate-900">{profile.badgeId}</span>
                      </div>
                      <div className="grid grid-cols-3 items-center">
                        <span className="font-bold text-slate-700">PIN Code</span>
                        <span className="col-span-2 font-mono text-slate-500">{profile.pinCode}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-indigo-900">Position Details</h3>
                    <div className="space-y-2.5 pt-1">
                      <div className="grid grid-cols-3 items-center">
                        <span className="font-bold text-slate-700">Job Position</span>
                        <span className="col-span-2 text-slate-800 font-medium">{profile.jobPosition}</span>
                      </div>
                      <div className="grid grid-cols-3 items-center">
                        <span className="font-bold text-slate-700">Notice Period</span>
                        <span className="col-span-2 text-slate-800 font-medium">{profile.noticePeriod}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: Exit data */}
            {activeTab === 'exit' && (
              <div className="space-y-4 animate-in fade-in duration-150 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold">
                    <CheckCircle2 size={16} />
                    <span>Active In-Service Record</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    No pending separation, resignation, or exit handover processes. The employee is in active full-time service.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 6: Equipment */}
            {activeTab === 'equipment' && (
              <div className="space-y-4 animate-in fade-in duration-150 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Assigned Equipment &amp; Assets</h3>
                    <p className="text-slate-500 text-[11px]">Hardware assets currently checked out under employee custody</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/assets')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Manage Assets</span>
                    <ExternalLink size={12} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {equipmentList.map((eq) => (
                    <div
                      key={eq.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 shadow-2xs space-y-2.5 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                          <Laptop size={16} />
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {eq.status}
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 truncate">{eq.name}</div>
                        <div className="text-[10px] text-slate-500">{eq.category}</div>
                      </div>
                      <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                        <span>Code: <strong className="text-slate-700">{eq.code}</strong></span>
                        <span>{eq.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
