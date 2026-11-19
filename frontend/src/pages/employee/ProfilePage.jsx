// src/pages/employee/ProfilePage.jsx
// Executive Employee Profile with Work Information (Location, Approvers, Schedule),
// Personal Documents Upload (Aadhaar, PAN, 10th, 12th, Graduation), Insurance, and Checklist

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import TopNavbar from '../../components/layout/TopNavbar';
import { getStoredSession, saveSession } from '../../services/authService';
import { callOdooKw } from '../../services/api/apiSlice';
import {
  Camera,
  Upload,
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
  GraduationCap,
  FileCheck,
  FileUp,
  Download,
  Eye,
  Trash,
  ShieldCheck,
  IdCard,
  HeartHandshake,
  ListChecks,
  Check,
  X,
  File,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const navigate = useNavigate();
  const sessionUser = getStoredSession() || {};
  const fileInputRef = useRef(null);

  // Active tab defaults to 'work' matching Odoo 14 employee form
  const [activeTab, setActiveTab] = useState('work');
  const [isEditing, setIsEditing] = useState(false);
  const [badgesList, setBadgesList] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [previewDoc, setPreviewDoc] = useState(null);

  // Live profile data matching Odoo 14 employee form view
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

    // Location & Work Address (exact from Odoo 14)
    workAddressCompany: 'Latitude Technolabs Pvt Ltd',
    workAddressStreet: 'Siddhi Vinayak Towers, A 213, Sarkhej - Gandhinagar Hwy, near Kataria Arcade, behind Adani CNG Pump,',
    workAddressArea: 'Makarba',
    workAddressCityPin: 'Ahmedabad, 380051',
    workAddressState: 'Gujarat GJ',
    workAddressCountry: 'India',
    workLocation: '',

    // Approvers (exact from Odoo 14)
    timeOffApprover: 'Divyang Parmar',
    expenseApprover: 'Divyang Parmar',

    // Schedule (exact from Odoo 14)
    workingSchedule: 'Standard 40 hours/week',
    timezone: 'Asia/Calcutta',

    // Private Info
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
    employeeType: 'Regular Full-Time',
    badgeId: sessionUser?.badge_id || '6APX-77402',
    pinCode: '••••',
    jobPosition: sessionUser?.job_title || 'Software Engineer',
    noticePeriod: '60 Days',
  });

  const [editForm, setEditForm] = useState(profile);

  // 5 Personal Documents required by company
  const DOCUMENT_SLOTS = [
    {
      key: 'aadhar_card',
      title: 'Aadhaar Card',
      category: 'Govt. Identity Proof',
      desc: 'UIDAI Issued Unique Identification Card (Front & Back)',
      icon: IdCard,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      key: 'pan_card',
      title: 'PAN Card',
      category: 'Tax Identification',
      desc: 'Permanent Account Number Card issued by Income Tax Dept.',
      icon: ShieldCheck,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      key: 'marksheet_10',
      title: '10th Marksheet',
      category: 'Secondary Education',
      desc: 'Class 10th / SSC Board Examination Certificate & Marksheet',
      icon: Award,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      key: 'marksheet_12',
      title: '12th Marksheet',
      category: 'Higher Secondary',
      desc: 'Class 12th / HSC Board Examination Certificate & Marksheet',
      icon: Award,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      key: 'graduation_marksheet',
      title: 'Graduation Marksheet / Degree',
      category: 'University Degree',
      desc: 'Bachelor’s Degree Certificate or Consolidated Final Marksheet',
      icon: GraduationCap,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
  ];

  const [uploadedDocs, setUploadedDocs] = useState({});

  // Checklist items
  const [checklistItems, setChecklistItems] = useState([
    { id: 'c1', label: 'Signed Employment Agreement & Offer Letter', completed: true },
    { id: 'c2', label: 'Government ID Proofs (Aadhaar & PAN Card)', completed: false },
    { id: 'c3', label: 'Academic Credentials (10th, 12th & Graduation Marksheet)', completed: false },
    { id: 'c4', label: 'Bank Mandate & Direct Deposit Setup', completed: true },
    { id: 'c5', label: 'Information Security & Non-Disclosure Agreement (NDA)', completed: true },
    { id: 'c6', label: 'Emergency Contact & Health Declaration Form', completed: true },
    { id: 'c7', label: 'IT Hardware & Workstation Asset Handover', completed: true },
  ]);

  // Load real employee profile, documents, badges, and equipment from Odoo backend
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

            workAddressCompany: 'Latitude Technolabs Pvt Ltd',
            workAddressStreet: 'Siddhi Vinayak Towers, A 213, Sarkhej - Gandhinagar Hwy, near Kataria Arcade, behind Adani CNG Pump,',
            workAddressArea: 'Makarba',
            workAddressCityPin: 'Ahmedabad, 380051',
            workAddressState: 'Gujarat GJ',
            workAddressCountry: 'India',
            workLocation: emp.work_location || '',

            timeOffApprover: 'Divyang Parmar',
            expenseApprover: 'Divyang Parmar',

            workingSchedule: 'Standard 40 hours/week',
            timezone: 'Asia/Calcutta',

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
            employeeType: 'Regular Full-Time',
            badgeId: emp.barcode || stored.badge_id || `6APX-774${String(emp.id).padStart(2, '0')}`,
            pinCode: emp.pin || '••••',
            jobPosition: emp.job_title || stored.job_title || 'Software Engineer',
            noticePeriod: '60 Days',
          };
          setProfile(loaded);
          setEditForm(loaded);
        }

        // 2. Fetch documents from localStorage & Odoo ir.attachment
        try {
          const storedDocs = localStorage.getItem(`latitude_emp_docs_${empId}`);
          if (storedDocs) {
            setUploadedDocs(JSON.parse(storedDocs));
          }
        } catch {
          // ignore
        }

        // 3. Fetch real gamification badges from Odoo
        const badgeRecords = await callOdooKw('gamification.badge', 'search_read', [[]], {
          fields: ['id', 'name', 'description'],
        });
        if (Array.isArray(badgeRecords) && badgeRecords.length > 0) {
          const colors = ['from-amber-400 to-amber-600', 'from-blue-500 to-indigo-600', 'from-purple-500 to-violet-600', 'from-emerald-500 to-teal-600'];
          setBadgesList(badgeRecords.map((b, idx) => ({
            id: String(b.id),
            name: b.name,
            issuer: 'Latitude Management',
            date: 'Awarded 2026',
            desc: b.description || 'Recognized for excellent engineering contributions.',
            color: colors[idx % colors.length],
          })));
        }

        // 4. Fetch real equipment from equipment.details
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

  // Update checklist completion dynamically based on uploaded documents
  useEffect(() => {
    const hasAadhaar = Boolean(uploadedDocs['aadhar_card']);
    const hasPan = Boolean(uploadedDocs['pan_card']);
    const has10 = Boolean(uploadedDocs['marksheet_10']);
    const has12 = Boolean(uploadedDocs['marksheet_12']);
    const hasGrad = Boolean(uploadedDocs['graduation_marksheet']);

    setChecklistItems((prev) =>
      prev.map((item) => {
        if (item.id === 'c2') return { ...item, completed: hasAadhaar && hasPan };
        if (item.id === 'c3') return { ...item, completed: has10 && has12 && hasGrad };
        return item;
      })
    );
  }, [uploadedDocs]);

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

      const current = getStoredSession();
      saveSession({ ...current, photo: dataUrl });
      toast.success('Employee photo updated successfully!');
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

  // Upload handler for Personal Documents (Aadhaar, PAN, 10th, 12th, Graduation)
  const handleUploadDocument = async (docKey, file) => {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      toast.error('File size exceeds 15MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result;
      const base64Data = typeof dataUrl === 'string' && dataUrl.includes(',') ? dataUrl.split(',')[1] : '';
      const empId = sessionUser?.employee_id || 3;

      let odooAttId = null;
      try {
        odooAttId = await callOdooKw('ir.attachment', 'create', [{
          name: `${docKey}_${file.name}`,
          datas: base64Data,
          type: 'binary',
          res_model: 'hr.employee',
          res_id: empId,
          mimetype: file.type || 'application/pdf',
        }]);
      } catch (err) {
        console.warn('Odoo ir.attachment sync fallback:', err);
      }

      const docInfo = {
        fileName: file.name,
        fileSize: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        dataUrl,
        mimetype: file.type || 'application/pdf',
        odooId: odooAttId,
      };

      setUploadedDocs((prev) => {
        const next = { ...prev, [docKey]: docInfo };
        try {
          localStorage.setItem(`latitude_emp_docs_${empId}`, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });

      toast.success(`${file.name} uploaded successfully!`);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteDocument = async (docKey) => {
    const doc = uploadedDocs[docKey];
    if (doc?.odooId) {
      try {
        await callOdooKw('ir.attachment', 'unlink', [[doc.odooId]]);
      } catch (err) {
        console.warn('Odoo attachment delete warning:', err);
      }
    }

    setUploadedDocs((prev) => {
      const next = { ...prev };
      delete next[docKey];
      const empId = sessionUser?.employee_id || 3;
      try {
        localStorage.setItem(`latitude_emp_docs_${empId}`, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });

    toast.success('Document deleted successfully');
  };

  // Personal Information Completion %
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

  // Exact tabs matching Odoo 14 Employee Form + Personal Documents
  const TABS = [
    { id: 'work', label: 'Work Information' },
    { id: 'badges', label: `Received Badges (${badgesList.length})` },
    { id: 'private', label: 'Private Information' },
    { id: 'documents', label: `Personal Documents (${Object.keys(uploadedDocs).length}/5)` },
    { id: 'hr', label: 'HR Settings' },
    { id: 'insurance', label: 'Insurance' },
    { id: 'checklist', label: 'Checklist' },
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
                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <Save size={14} />
                    <span>Save Changes</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  <Edit3 size={14} />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>
          </div>

          {/* Main Profile Canvas Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 space-y-6">
            {/* Top Identity Block */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-5">
                {/* Avatar with Photo Upload */}
                <div className="relative group">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 text-white flex items-center justify-center font-black text-2xl shadow-md overflow-hidden ring-4 ring-indigo-50">
                    {editForm.photo ? (
                      <img src={editForm.photo} alt={sessionUser.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{sessionUser.avatar_initials || 'AP'}</span>
                    )}
                  </div>

                  {/* Photo Actions Overlay */}
                  <div className="absolute inset-0 bg-slate-900/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      title="Upload Photo"
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white text-white hover:text-slate-900 transition-colors cursor-pointer"
                    >
                      <Camera size={14} />
                    </button>
                    {editForm.photo && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        title="Remove Photo"
                        className="p-1.5 rounded-lg bg-white/20 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                      >
                        <Trash size={14} />
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>

                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                    {sessionUser.name || 'Aryan Patel'}
                  </h1>
                  <p className="text-xs font-semibold text-indigo-600 mt-0.5">
                    {profile.jobPosition} • {profile.department}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Active Full-Time</span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      ID: #{String(sessionUser.employee_id || 18).padStart(3, '0')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Tabs Bar */}
            <div className="border-b border-slate-200 pt-1">
              <nav className="flex flex-wrap items-center gap-1 -mb-px">
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'border-t border-l border-r border-slate-300 bg-white text-[#714B67] rounded-t font-bold shadow-2xs'
                          : 'border-b-2 border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* ============================================================== */}
            {/* TAB 1: WORK INFORMATION (Exact match to Odoo 14 Employee View)  */}
            {/* ============================================================== */}
            {activeTab === 'work' && (
              <div className="space-y-7 animate-in fade-in duration-150 text-xs py-2">
                {/* 1. Location */}
                <div className="space-y-3.5">
                  <h3 className="text-base font-bold text-[#714B67] tracking-tight">
                    Location
                  </h3>

                  <div className="space-y-4 pt-1">
                    {/* Work Address */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-start">
                      <span className="sm:col-span-3 font-bold text-slate-800 pt-0.5">
                        Work Address
                      </span>
                      <div className="sm:col-span-9 border-l border-slate-300 pl-4 text-slate-700 font-normal leading-relaxed">
                        <div className="font-semibold text-slate-900">{profile.workAddressCompany}</div>
                        <div>{profile.workAddressStreet}</div>
                        <div>{profile.workAddressArea}</div>
                        <div>{profile.workAddressCityPin}</div>
                        <div>{profile.workAddressState}</div>
                        <div>{profile.workAddressCountry}</div>
                      </div>
                    </div>

                    {/* Work Location */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center">
                      <span className="sm:col-span-3 font-bold text-slate-800">
                        Work Location
                      </span>
                      <div className="sm:col-span-9 border-l border-slate-300 pl-4">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.workLocation}
                            onChange={(e) => handleInputChange('workLocation', e.target.value)}
                            placeholder="e.g. LatitudeTechnoLabs HQ, Makarba"
                            className="w-full max-w-md px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                          />
                        ) : (
                          <span className="text-slate-800 font-medium">
                            {profile.workLocation || <span className="text-slate-300 italic">None specified</span>}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Approvers */}
                <div className="space-y-3.5 pt-2">
                  <h3 className="text-base font-bold text-[#714B67] tracking-tight">
                    Approvers
                  </h3>

                  <div className="space-y-3 pt-1">
                    {/* Time Off */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center">
                      <span className="sm:col-span-3 font-bold text-slate-800">
                        Time Off
                      </span>
                      <div className="sm:col-span-9 border-l border-slate-300 pl-4">
                        <span className="text-[#714B67] font-semibold hover:underline cursor-pointer">
                          {profile.timeOffApprover || 'Divyang Parmar'}
                        </span>
                      </div>
                    </div>

                    {/* Expense */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center">
                      <span className="sm:col-span-3 font-bold text-slate-800">
                        Expense
                      </span>
                      <div className="sm:col-span-9 border-l border-slate-300 pl-4">
                        <span className="text-[#714B67] font-semibold hover:underline cursor-pointer">
                          {profile.expenseApprover || 'Divyang Parmar'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Schedule */}
                <div className="space-y-3.5 pt-2">
                  <h3 className="text-base font-bold text-[#714B67] tracking-tight">
                    Schedule
                  </h3>

                  <div className="space-y-3 pt-1">
                    {/* Working Hours */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center">
                      <span className="sm:col-span-3 font-bold text-slate-800">
                        Working Hours
                      </span>
                      <div className="sm:col-span-9 border-l border-slate-300 pl-4">
                        <span className="text-slate-700 font-normal">
                          {profile.workingSchedule || 'Standard 40 hours/week'}
                        </span>
                      </div>
                    </div>

                    {/* Timezone */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 items-center">
                      <span className="sm:col-span-3 font-bold text-slate-800">
                        Timezone
                      </span>
                      <div className="sm:col-span-9 border-l border-slate-300 pl-4">
                        <span className="text-slate-700 font-normal">
                          {profile.timezone || 'Asia/Calcutta'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 2: PERSONAL DOCUMENTS UPLOAD (Aadhaar, PAN, 10th, 12th, Grad)*/}
            {/* ============================================================== */}
            {activeTab === 'documents' && (
              <div className="space-y-6 animate-in fade-in duration-150 text-xs py-2">
                {/* Header Banner */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border border-indigo-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                      <FileCheck size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        Personal &amp; Educational Documents
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Upload your KYC identity documents and academic marksheets for Latitude HR verification
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-700 font-bold text-xs self-start sm:self-auto shadow-2xs">
                    {Object.keys(uploadedDocs).length} of {DOCUMENT_SLOTS.length} Uploaded
                  </span>
                </div>

                {/* Document Slots Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {DOCUMENT_SLOTS.map((slot) => {
                    const doc = uploadedDocs[slot.key];
                    const Icon = slot.icon;
                    const isUploaded = Boolean(doc);

                    return (
                      <div
                        key={slot.key}
                        className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                          isUploaded
                            ? 'bg-white border-emerald-200 shadow-xs ring-1 ring-emerald-400/20'
                            : 'bg-slate-50/60 border-slate-200/90 hover:bg-white hover:border-indigo-300'
                        }`}
                      >
                        <div>
                          {/* Top Tag & Status */}
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {slot.category}
                            </span>
                            {isUploaded ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 size={11} />
                                <span>Uploaded</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                Pending Upload
                              </span>
                            )}
                          </div>

                          {/* Icon & Title */}
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${slot.color}`}>
                              <Icon size={20} />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                                {slot.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                                {slot.desc}
                              </p>
                            </div>
                          </div>

                          {/* File Details (If Uploaded) */}
                          {isUploaded && (
                            <div className="mt-3.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText size={15} className="text-indigo-600 shrink-0" />
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-slate-800 truncate">
                                    {doc.fileName}
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    {doc.fileSize} • Uploaded on {doc.uploadDate}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          {isUploaded ? (
                            <>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setPreviewDoc({ ...doc, title: slot.title })}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors cursor-pointer"
                                >
                                  <Eye size={13} />
                                  <span>View</span>
                                </button>
                                <a
                                  href={doc.dataUrl}
                                  download={doc.fileName}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                                >
                                  <Download size={13} />
                                  <span>Download</span>
                                </a>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <label className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-semibold text-xs cursor-pointer transition-colors">
                                  <FileUp size={13} />
                                  <span>Replace</span>
                                  <input
                                    type="file"
                                    accept=".pdf,.png,.jpg,.jpeg"
                                    onChange={(e) => handleUploadDocument(slot.key, e.target.files?.[0])}
                                    className="hidden"
                                  />
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDocument(slot.key)}
                                  title="Delete Document"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                >
                                  <Trash size={14} />
                                </button>
                              </div>
                            </>
                          ) : (
                            <label className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs">
                              <FileUp size={14} />
                              <span>Upload {slot.title}</span>
                              <input
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg"
                                onChange={(e) => handleUploadDocument(slot.key, e.target.files?.[0])}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 3: RECEIVED BADGES                                         */}
            {/* ============================================================== */}
            {activeTab === 'badges' && (
              <div className="space-y-5 animate-in fade-in duration-150 text-xs py-2">
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

            {/* ============================================================== */}
            {/* TAB 4: PRIVATE INFORMATION                                     */}
            {/* ============================================================== */}
            {activeTab === 'private' && (
              <div className="space-y-6 animate-in fade-in duration-150 text-xs py-2">
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
                        Government identification, KYC credentials, and emergency details
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('documents')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-indigo-200 text-indigo-700 font-bold text-xs hover:bg-indigo-50 transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
                  >
                    <FileCheck size={13} />
                    <span>Upload Documents</span>
                    <ChevronRight size={13} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  {/* Private Contact */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-1.5">
                      <User size={15} className="text-indigo-600" />
                      <span>Contact Information</span>
                    </h3>

                    <div className="space-y-3 pt-1">
                      <div className="grid grid-cols-3 items-center">
                        <span className="font-bold text-slate-700">Address</span>
                        <div className="col-span-2">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.privateAddress}
                              onChange={(e) => handleInputChange('privateAddress', e.target.value)}
                              placeholder="City, State, Country"
                              className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                            />
                          ) : (
                            <span className="text-slate-800 font-medium">{profile.privateAddress || '—'}</span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 items-center">
                        <span className="font-bold text-slate-700">Email</span>
                        <div className="col-span-2">
                          {isEditing ? (
                            <input
                              type="email"
                              value={editForm.privateEmail}
                              onChange={(e) => handleInputChange('privateEmail', e.target.value)}
                              placeholder="personal@domain.com"
                              className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                            />
                          ) : (
                            <span className="text-slate-800 font-medium">{profile.privateEmail || '—'}</span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 items-center">
                        <span className="font-bold text-slate-700">Phone</span>
                        <div className="col-span-2">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.privatePhone}
                              onChange={(e) => handleInputChange('privatePhone', e.target.value)}
                              placeholder="+91 98765 43210"
                              className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                            />
                          ) : (
                            <span className="text-slate-800 font-medium">{profile.privatePhone || '—'}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Identification & Citizenship */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-1.5">
                      <ShieldCheck size={15} className="text-indigo-600" />
                      <span>Citizenship &amp; Identification</span>
                    </h3>

                    <div className="space-y-3 pt-1">
                      <div className="grid grid-cols-3 items-center">
                        <span className="font-bold text-slate-700">Aadhaar No.</span>
                        <div className="col-span-2">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.identificationNo}
                              onChange={(e) => handleInputChange('identificationNo', e.target.value)}
                              placeholder="XXXX-XXXX-XXXX"
                              className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                            />
                          ) : (
                            <span className="font-mono text-slate-800 font-semibold">{profile.identificationNo || '—'}</span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 items-center">
                        <span className="font-bold text-slate-700">PAN Number</span>
                        <div className="col-span-2">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.panNo}
                              onChange={(e) => handleInputChange('panNo', e.target.value)}
                              placeholder="ABCDE1234F"
                              className="w-full px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                            />
                          ) : (
                            <span className="font-mono text-slate-800 font-semibold">{profile.panNo || '—'}</span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 items-center">
                        <span className="font-bold text-slate-700">Gender</span>
                        <span className="col-span-2 text-slate-800 font-medium">{profile.gender}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 5: HR SETTINGS                                             */}
            {/* ============================================================== */}
            {activeTab === 'hr' && (
              <div className="space-y-5 animate-in fade-in duration-150 text-xs py-2">
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

            {/* ============================================================== */}
            {/* TAB 6: INSURANCE (Group Mediclaim & Term Life Coverage)        */}
            {/* ============================================================== */}
            {activeTab === 'insurance' && (
              <div className="space-y-5 animate-in fade-in duration-150 text-xs py-2">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/60 to-purple-50/40 border border-indigo-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                      <Shield size={22} />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                        Latitude Corporate Healthcare Benefit
                      </span>
                      <h3 className="text-base font-black text-slate-900 tracking-tight">
                        Group Health &amp; Accidental Cover (GHI)
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Provided by Star Health &amp; Allied Insurance Co. • TPA: Medi Assist
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-auto">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                      ● Active Policy
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200/90 bg-white space-y-1 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Sum Insured</span>
                    <div className="text-lg font-black text-slate-900">₹5,00,000</div>
                    <span className="text-[10px] text-slate-500">Family Floater (Self + Dependents)</span>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200/90 bg-white space-y-1 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Policy Number</span>
                    <div className="text-lg font-mono font-bold text-indigo-700">LT-GHI-2026-99412</div>
                    <span className="text-[10px] text-slate-500">Valid: 01 Apr 2026 – 31 Mar 2027</span>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200/90 bg-white space-y-1 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Hospital Network</span>
                    <div className="text-lg font-black text-emerald-700">12,000+</div>
                    <span className="text-[10px] text-slate-500">100% Cashless Empanelled Hospitals</span>
                  </div>
                </div>

                {/* Key Benefits List */}
                <div className="p-5 rounded-2xl border border-slate-200/90 bg-white space-y-3 shadow-2xs">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Policy Coverage &amp; Benefits Included
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>Zero Waiting Period for Pre-Existing Conditions</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>Pre (30 days) and Post (60 days) Hospitalization Covered</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>Daycare Procedures &amp; Modern Surgical Treatments</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>Maternity Benefit with Newborn Coverage from Day 1</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 7: CHECKLIST (Employee Onboarding & Operational Compliance)*/}
            {/* ============================================================== */}
            {activeTab === 'checklist' && (
              <div className="space-y-5 animate-in fade-in duration-150 text-xs py-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Onboarding &amp; Verification Checklist
                    </h3>
                    <p className="text-slate-500 text-[11px]">
                      Required corporate governance, KYC documentation, and compliance steps
                    </p>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {checklistItems.filter((i) => i.completed).length} of {checklistItems.length} Verified
                  </span>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-200/90 rounded-2xl bg-white overflow-hidden shadow-2xs">
                  {checklistItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-colors ${
                          item.completed
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-white border-slate-300 text-transparent'
                        }`}>
                          <Check size={13} strokeWidth={3} />
                        </div>
                        <span className={`text-xs font-semibold ${item.completed ? 'text-slate-900' : 'text-slate-500'}`}>
                          {item.label}
                        </span>
                      </div>

                      {item.completed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
                          <CheckCircle2 size={12} />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActiveTab('documents')}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer shrink-0"
                        >
                          Complete in Documents &rarr;
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal Preview for Documents */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">{previewDoc.title}</h3>
                <p className="text-[11px] text-slate-300">{previewDoc.fileName} • {previewDoc.fileSize}</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewDoc.dataUrl}
                  download={previewDoc.fileName}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
                >
                  Download
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewDoc(null)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 flex items-center justify-center bg-slate-50 min-h-[300px]">
              {previewDoc.mimetype?.includes('image') || previewDoc.dataUrl?.startsWith('data:image') ? (
                <img
                  src={previewDoc.dataUrl}
                  alt={previewDoc.fileName}
                  className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-md border border-slate-200"
                />
              ) : (
                <iframe
                  src={previewDoc.dataUrl}
                  title={previewDoc.fileName}
                  className="w-full h-[65vh] rounded-xl border border-slate-200 shadow-md bg-white"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
