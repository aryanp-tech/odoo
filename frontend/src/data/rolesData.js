// src/data/rolesData.js
// Enterprise Role Definitions, KPI Metrics, Charts Data, Quick Actions, and Pending Approvals
// Configured with exactly 2 complementary, varied charts (Area Trend + Donut / Bar) per role for optimal clarity.

export const ROLES_CONFIG = {
  super_admin: {
    id: "super_admin",
    name: "Super Admin",
    category: "Executive Governance",
    badge: "Role 1 of 9",
    accentColor: "indigo",
    accentHex: "#6366F1",
    subtitle: "Enterprise governance, multi-branch attendance metrics, and infrastructure health.",
    user: {
      name: "Aryan Patel",
      title: "Chief Technology & Operations Officer",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      initials: "AP"
    },
    metrics: [
      {
        id: "total_headcount",
        label: "Total Workforce",
        value: "150",
        sub: "3 Operating Entities",
        trend: "+8.4%",
        trendDirection: "up",
        color: "indigo",
        icon: "Users",
        sparkline: [136, 138, 140, 144, 146, 148, 150]
      },
      {
        id: "zk_biometric",
        label: "ZKTeco Biometrics",
        value: "Online",
        sub: "3 Machines (Port 4370)",
        trend: "100%",
        trendDirection: "up",
        color: "emerald",
        icon: "ShieldCheck",
        sparkline: [100, 100, 98, 100, 100, 100, 100]
      },
      {
        id: "monthly_payroll",
        label: "Monthly Payroll",
        value: "₹ 48.2 L",
        sub: "Oct 2026 Disbursed",
        trend: "+3.1%",
        trendDirection: "up",
        color: "purple",
        icon: "Wallet",
        sparkline: [44.5, 45.0, 46.2, 46.8, 47.5, 47.9, 48.2]
      },
      {
        id: "infra_health",
        label: "System Health",
        value: "99.98%",
        sub: "PostgreSQL 14 Live",
        trend: "Healthy",
        trendDirection: "up",
        color: "teal",
        icon: "Server",
        sparkline: [99.9, 99.9, 100, 99.8, 100, 100, 99.98]
      }
    ],
    announcement: {
      id: "ann-1",
      badge: "Notice",
      title: "Q4 Town Hall & Annual Appraisal Cycle Launch 🚀",
      description: "Leadership meeting scheduled for Friday at 04:30 PM. Review branch allocations and PMS guidelines.",
      date: "05 Nov 2026",
      actionText: "View Agenda",
      link: "#"
    },
    // EXACTLY 2 VARIED CHARTS (Area Trend + Donut Breakdown)
    charts: [
      {
        id: "attendance_trend",
        title: "Attendance Velocity (7 Days)",
        subtitle: "Daily present vs late punch counts",
        type: "area",
        data: [
          { label: "Mon", present: 141, late: 7 },
          { label: "Tue", present: 143, late: 5 },
          { label: "Wed", present: 145, late: 3 },
          { label: "Thu", present: 142, late: 6 },
          { label: "Today", present: 145, late: 4 }
        ],
        series: [
          { key: "present", name: "Present", color: "#10B981" },
          { key: "late", name: "Late Punch", color: "#F59E0B" }
        ]
      },
      {
        id: "branch_donut",
        title: "Headcount by Entity",
        subtitle: "Branch workforce allocation",
        type: "donut",
        centerText: "150",
        centerLabel: "Total Staff",
        data: [
          { label: "Ahmedabad HQ", value: 114, color: "#6366F1" },
          { label: "Pune Satellite", value: 24, color: "#0EA5E9" },
          { label: "Remote UK/US", value: 12, color: "#EC4899" }
        ]
      }
    ],
    quickActions: [
      { label: "Database Backup", icon: "Database", color: "indigo", action: "backup" },
      { label: "Role Permissions", icon: "Lock", color: "purple", action: "permissions" },
      { label: "Biometric Sync", icon: "Cpu", color: "emerald", action: "biometrics" },
      { label: "Process Payroll", icon: "CreditCard", color: "teal", action: "payroll" }
    ],
    pendingApprovals: [
      {
        id: "app-1",
        user: "Neha Joshi",
        role: "Head of HR",
        title: "Revised Q4 Remote Work & WFH Policy Document",
        time: "10 mins ago",
        status: "Pending Review"
      },
      {
        id: "app-2",
        user: "Chirag Trivedi",
        role: "IT Lead",
        title: "Capital Expenditure: 8x M3 MacBooks for AI Team",
        time: "1 hour ago",
        status: "₹ 14.8 L"
      }
    ]
  },

  hr_admin: {
    id: "hr_admin",
    name: "HR Administrator",
    category: "Talent & People Ops",
    badge: "Role 2 of 9",
    accentColor: "purple",
    accentHex: "#8B5CF6",
    subtitle: "Enterprise attendance compliance, probation confirmations, and leave verifications.",
    user: {
      name: "Neha Joshi",
      title: "Senior HR Administrator",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
      initials: "NJ"
    },
    metrics: [
      {
        id: "today_present",
        label: "Today's Presence",
        value: "142 / 150",
        sub: "94.6% Workforce Present",
        trend: "+2.1%",
        trendDirection: "up",
        color: "emerald",
        icon: "UserCheck",
        sparkline: [139, 140, 141, 140, 143, 141, 142]
      },
      {
        id: "pending_leaves",
        label: "Leave Approvals",
        value: "4 Pending",
        sub: "Casual & WFH Pending",
        trend: "Action",
        trendDirection: "warning",
        color: "amber",
        icon: "Calendar",
        sparkline: [2, 3, 5, 4, 6, 5, 4]
      },
      {
        id: "probations_due",
        label: "Probation Reviews",
        value: "3 Due",
        sub: "Confirmation Letters Ready",
        trend: "This Week",
        trendDirection: "neutral",
        color: "purple",
        icon: "Award",
        sparkline: [1, 2, 2, 3, 3, 3, 3]
      },
      {
        id: "open_requisitions",
        label: "Open Job Openings",
        value: "12 Roles",
        sub: "Engineering & Sourcing",
        trend: "Active",
        trendDirection: "up",
        color: "rose",
        icon: "Briefcase",
        sparkline: [8, 9, 10, 11, 11, 12, 12]
      }
    ],
    announcement: {
      id: "ann-2",
      badge: "Compliance",
      title: "Diwali Festive Bonus & Public Holiday Notification 🪔",
      description: "Payroll cutoff for festival advance is Nov 8th. Ensure all biometric regularizations are approved.",
      date: "04 Nov 2026",
      actionText: "Check Guidelines",
      link: "#"
    },
    charts: [
      {
        id: "attendance_variance",
        title: "Daily Attendance Variance",
        subtitle: "On-time punches vs regularized anomalies",
        type: "area",
        data: [
          { label: "Mon", onTime: 132, regularized: 11 },
          { label: "Tue", onTime: 136, regularized: 7 },
          { label: "Wed", onTime: 139, regularized: 5 },
          { label: "Thu", onTime: 137, regularized: 6 },
          { label: "Today", onTime: 140, regularized: 4 }
        ],
        series: [
          { key: "onTime", name: "On Time", color: "#10B981" },
          { key: "regularized", name: "Regularized", color: "#8B5CF6" }
        ]
      },
      {
        id: "leave_donut",
        title: "Leave Requests Breakdown",
        subtitle: "Share by leave category",
        type: "donut",
        centerText: "18",
        centerLabel: "Applications",
        data: [
          { label: "Paid Leave", value: 8, color: "#8B5CF6" },
          { label: "Work From Home", value: 5, color: "#0EA5E9" },
          { label: "Sick Leave", value: 3, color: "#F59E0B" },
          { label: "Comp Off", value: 2, color: "#10B981" }
        ]
      }
    ],
    quickActions: [
      { label: "Add Employee", icon: "UserPlus", color: "purple", action: "new_employee" },
      { label: "Regularize Punch", icon: "Clock", color: "emerald", action: "regularize" },
      { label: "Issue Letter", icon: "FileCheck", color: "indigo", action: "confirm_probation" },
      { label: "Post Notice", icon: "Megaphone", color: "rose", action: "announcement" }
    ],
    pendingApprovals: [
      {
        id: "app-3",
        user: "Manan Shah",
        role: "React Frontend Dev",
        title: "Probation Confirmation Sign-off (Rating: 4.8★)",
        time: "10:15 AM",
        status: "Ready"
      },
      {
        id: "app-4",
        user: "Rohan Sharma",
        role: "Python Dev",
        title: "Casual Leave Application (3 Days: Nov 11 - 13)",
        time: "Yesterday",
        status: "Endorsed"
      }
    ]
  },

  hr_officer: {
    id: "hr_officer",
    name: "HR Officer",
    category: "Talent & People Ops",
    badge: "Role 3 of 9",
    accentColor: "sky",
    accentHex: "#0EA5E9",
    subtitle: "Frontline punch regularization, document verification, and interview coordination.",
    user: {
      name: "Pooja Mehta",
      title: "HR Operations Officer",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
      initials: "PM"
    },
    metrics: [
      {
        id: "missing_punches",
        label: "Missing Punches",
        value: "5",
        sub: "Regularization Required",
        trend: "Action",
        trendDirection: "warning",
        color: "amber",
        icon: "AlertCircle",
        sparkline: [3, 4, 6, 5, 7, 5, 5]
      },
      {
        id: "interviews_today",
        label: "Interviews Scheduled",
        value: "4 Rounds",
        sub: "Tech L1 & L2 Today",
        trend: "Today",
        trendDirection: "neutral",
        color: "sky",
        icon: "Video",
        sparkline: [2, 3, 5, 3, 4, 4, 4]
      },
      {
        id: "joiner_kits",
        label: "New Joiner Kits",
        value: "2 Ready",
        sub: "Docs & Welcome Kit Ready",
        trend: "Ready",
        trendDirection: "up",
        color: "emerald",
        icon: "PackageCheck",
        sparkline: [0, 1, 1, 2, 2, 2, 2]
      },
      {
        id: "tickets_unresolved",
        label: "Helpdesk Queries",
        value: "3 In Queue",
        sub: "PF & Tax Slip Queries",
        trend: "In SLA",
        trendDirection: "up",
        color: "indigo",
        icon: "HelpCircle",
        sparkline: [6, 5, 4, 4, 3, 3, 3]
      }
    ],
    announcement: {
      id: "ann-3",
      badge: "Onboarding",
      title: "2 New Joiners Orientation Scheduled for Monday Morning 🎯",
      description: "Welcome kit, employee ID badges, and biometrics enrollment pre-configured at front desk.",
      date: "05 Nov 2026",
      actionText: "View Dossier",
      link: "#"
    },
    charts: [
      {
        id: "interview_status",
        title: "Interview Rounds Progress",
        subtitle: "Candidate evaluation pipeline",
        type: "bar",
        data: [
          { label: "Screening", count: 12, color: "#0EA5E9" },
          { label: "Tech L1", count: 7, color: "#6366F1" },
          { label: "Tech L2", count: 4, color: "#8B5CF6" },
          { label: "Final HR", count: 3, color: "#10B981" }
        ]
      },
      {
        id: "punch_causes_donut",
        title: "Missing Punch Causes",
        subtitle: "Biometric anomaly root causes",
        type: "donut",
        centerText: "16",
        centerLabel: "Incidents",
        data: [
          { label: "Forgot Punch", value: 7, color: "#F59E0B" },
          { label: "WFH / Client Visit", value: 6, color: "#0EA5E9" },
          { label: "Biometric Timeout", value: 3, color: "#F43F5E" }
        ]
      }
    ],
    quickActions: [
      { label: "Mark Manual Punch", icon: "CheckSquare", color: "sky", action: "manual_punch" },
      { label: "Schedule Interview", icon: "CalendarPlus", color: "indigo", action: "schedule_interview" },
      { label: "Print ID Badge", icon: "Printer", color: "purple", action: "print_badge" },
      { label: "Upload KYC Docs", icon: "UploadCloud", color: "emerald", action: "kyc_docs" }
    ],
    pendingApprovals: [
      {
        id: "app-5",
        user: "Kavita Rao",
        role: "Junior QA Tester",
        title: "Missing Evening Punch Regularization (Checked out 07:15 PM)",
        time: "25 mins ago",
        status: "Biometric Fail"
      },
      {
        id: "app-6",
        user: "Siddharth Verma",
        role: "Candidate",
        title: "Signed Offer Acceptance Letter & Verification",
        time: "2 hours ago",
        status: "Check Docs"
      }
    ]
  },

  manager: {
    id: "manager",
    name: "Manager / Team Leader",
    category: "Squad Leadership",
    badge: "Role 4 of 9",
    accentColor: "emerald",
    accentHex: "#10B981",
    subtitle: "Squad live attendance tracking, leave/WFH approval queue, timesheet validation, and PMS reviews.",
    user: {
      name: "Vikram Rathore",
      title: "Engineering Squad Lead",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
      initials: "VR"
    },
    metrics: [
      {
        id: "squad_presence",
        label: "Squad Attendance",
        value: "11 / 12",
        sub: "1 WFH • 0 Unplanned Absent",
        trend: "91.6%",
        trendDirection: "up",
        color: "emerald",
        icon: "UsersCheck",
        sparkline: [10, 11, 12, 11, 12, 11, 11]
      },
      {
        id: "team_approvals",
        label: "Team Requests",
        value: "3 Pending",
        sub: "2 Leaves, 1 Timesheet",
        trend: "Pending",
        trendDirection: "warning",
        color: "amber",
        icon: "FileCheck2",
        sparkline: [1, 2, 4, 3, 5, 4, 3]
      },
      {
        id: "timesheet_compliance",
        label: "Timesheet Compliance",
        value: "94.2%",
        sub: "Current Sprint On-Track",
        trend: "+5.1%",
        trendDirection: "up",
        color: "indigo",
        icon: "CheckCircle",
        sparkline: [88, 89, 90, 92, 93, 94, 94.2]
      },
      {
        id: "quarterly_pms",
        label: "PMS Reviews Due",
        value: "2",
        sub: "Q3 1-on-1 Evaluations",
        trend: "Due Nov 10",
        trendDirection: "neutral",
        color: "purple",
        icon: "Target",
        sparkline: [4, 4, 3, 3, 2, 2, 2]
      }
    ],
    announcement: {
      id: "ann-4",
      badge: "Sprint Alert",
      badgeColor: "emerald",
      title: "Sprint 24 Code Freeze on Thursday 06:00 PM IST ⚡",
      description: "Ensure all PRs are reviewed and timesheets for SquadFocus v2.4 billable hours are submitted.",
      date: "05 Nov 2026",
      actionText: "Open Board",
      link: "#"
    },
    charts: [
      {
        id: "squad_hours",
        title: "Squad Daily Hours Logged",
        subtitle: "Recorded hours against 8h daily baseline",
        type: "bar",
        data: [
          { label: "Aryan P.", count: 8.5, color: "#10B981" },
          { label: "Rohan S.", count: 8.2, color: "#10B981" },
          { label: "Sneha M.", count: 7.9, color: "#10B981" },
          { label: "Kavita R.", count: 8.0, color: "#10B981" },
          { label: "Manan S.", count: 8.6, color: "#10B981" }
        ]
      },
      {
        id: "billability_donut",
        title: "Squad Project Allocation",
        subtitle: "Client billable vs internal share",
        type: "donut",
        centerText: "100%",
        centerLabel: "Capacity",
        data: [
          { label: "SquadFocus Enterprise", value: 68, color: "#10B981" },
          { label: "Omega Elevators Core", value: 22, color: "#0EA5E9" },
          { label: "Internal R&D", value: 10, color: "#8B5CF6" }
        ]
      }
    ],
    quickActions: [
      { label: "Approve Squad Leave", icon: "CheckCheck", color: "emerald", action: "approve_leave" },
      { label: "Timesheet Audit", icon: "Clock8", color: "indigo", action: "review_timesheets" },
      { label: "Schedule 1-on-1", icon: "UserCheck", color: "purple", action: "schedule_pms" },
      { label: "Reassign Ticket", icon: "Share2", color: "sky", action: "reassign_ticket" }
    ],
    pendingApprovals: [
      {
        id: "app-7",
        user: "Sneha Mukherjee",
        role: "Full Stack Engineer",
        title: "WFH Request for Friday (Medical appointment)",
        time: "15 mins ago",
        status: "Lead Sign-off"
      },
      {
        id: "app-8",
        user: "Aryan Patel",
        role: "Senior Full Stack Dev",
        title: "Overtime Timesheet Log: 4.5h Sprint Optimization",
        time: "1 hour ago",
        status: "Billable"
      }
    ]
  },

  employee: {
    id: "employee",
    name: "Employee Self-Service (ESS)",
    category: "Personal Workspace",
    badge: "Role 5 of 9",
    accentColor: "indigo",
    accentHex: "#6366F1",
    subtitle: "Personal attendance punch logs, leave balances, performance reviews, and squad notifications.",
    user: {
      name: "Aryan Patel",
      title: "Senior Full Stack Engineer (L4)",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      initials: "AP"
    },
    metrics: [
      {
        id: "daily_presence",
        label: "Today's Presence",
        value: "03h 42m",
        sub: "Punched in 09:15 AM (On Time)",
        trend: "Active",
        trendDirection: "up",
        color: "emerald",
        icon: "Timer",
        sparkline: [8.5, 8.2, 8.8, 8.4, 8.5, 8.6, 3.7]
      },
      {
        id: "leave_balance",
        label: "Available Leaves",
        value: "14.5 Days",
        sub: "8.5 Paid • 4 Sick • 2 Comp Off",
        trend: "Healthy",
        trendDirection: "up",
        color: "purple",
        icon: "Palmtree",
        sparkline: [18, 17, 16.5, 15.5, 15.5, 14.5, 14.5]
      },
      {
        id: "pms_rating",
        label: "PMS Rating (Q3)",
        value: "4.85 ★",
        sub: "Band: Exceeds Expectations",
        trend: "+0.15",
        trendDirection: "up",
        color: "amber",
        icon: "Star",
        sparkline: [4.4, 4.5, 4.6, 4.7, 4.75, 4.8, 4.85]
      },
      {
        id: "client_project",
        label: "Primary Assignment",
        value: "SquadFocus v18",
        sub: "100% Billable • Latitude HQ",
        trend: "Active",
        trendDirection: "neutral",
        color: "sky",
        icon: "Laptop",
        sparkline: [100, 100, 100, 100, 100, 100, 100]
      }
    ],
    announcement: {
      id: "ann-5",
      badge: "Festival",
      badgeColor: "purple",
      title: "Diwali Corporate Holidays: Office closed Nov 11 to 13 🪔",
      description: "Timesheet submission deadline for the fortnight is Thursday, Nov 7 at 06:00 PM.",
      date: "04 Nov 2026",
      actionText: "Holiday Calendar",
      link: "#"
    },
    charts: [
      {
        id: "weekly_hours_trend",
        title: "Weekly Logged Hours vs Target",
        subtitle: "Biometric recorded hours against 8h daily target",
        type: "area",
        data: [
          { label: "Mon", hours: 8.5, target: 8.0 },
          { label: "Tue", hours: 8.4, target: 8.0 },
          { label: "Wed", hours: 8.8, target: 8.0 },
          { label: "Thu", hours: 8.2, target: 8.0 },
          { label: "Today", hours: 3.7, target: 8.0 }
        ],
        series: [
          { key: "hours", name: "Logged", color: "#6366F1" },
          { key: "target", name: "Target", color: "#CBD5E1" }
        ]
      },
      {
        id: "leave_balance_donut",
        title: "Leave Entitlement Balance",
        subtitle: "Remaining balance breakdown (24 Total)",
        type: "donut",
        centerText: "14.5",
        centerLabel: "Days Left",
        data: [
          { label: "Paid Leave", value: 8.5, color: "#6366F1" },
          { label: "Sick Leave", value: 4.0, color: "#0EA5E9" },
          { label: "Comp Off", value: 2.0, color: "#10B981" },
          { label: "Consumed", value: 9.5, color: "#F59E0B" }
        ]
      }
    ],
    quickActions: [
      { label: "Apply Leave / WFH", icon: "CalendarPlus", color: "indigo", action: "apply_leave" },
      { label: "Regularize Punch", icon: "Clock", color: "emerald", action: "regularize_punch" },
      { label: "Log Timesheet", icon: "FileText", color: "sky", action: "submit_timesheet" },
      { label: "Download Payslip", icon: "Download", color: "purple", action: "download_payslip" }
    ],
    pendingApprovals: [
      {
        id: "app-9",
        user: "My Leave Application",
        role: "Status Update",
        title: "Casual Leave (Nov 14) — Endorsed by Vikram Rathore",
        time: "11:30 AM",
        status: "Approved"
      },
      {
        id: "app-10",
        user: "Annual Sports Day",
        role: "Active HR Poll",
        title: "Annual Sports & Cultural Day Location Voting",
        time: "Closes Tomorrow",
        status: "Vote Needed"
      }
    ]
  },

  it_admin: {
    id: "it_admin",
    name: "IT Administrator",
    category: "Infrastructure",
    badge: "Role 6 of 9",
    accentColor: "rose",
    accentHex: "#F43F5E",
    subtitle: "Enterprise IT assets custody, MacBook/laptop inventory allocations, and server downtime monitoring.",
    user: {
      name: "Chirag Trivedi",
      title: "Lead Infrastructure Architect",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
      initials: "CT"
    },
    metrics: [
      {
        id: "assigned_assets",
        label: "Assigned Laptops",
        value: "184 Units",
        sub: "Active Personnel Assigned",
        trend: "Healthy",
        trendDirection: "up",
        color: "indigo",
        icon: "Monitor",
        sparkline: [178, 179, 180, 182, 182, 184, 184]
      },
      {
        id: "in_stock_hardware",
        label: "Hardware in Stock",
        value: "38 Ready",
        sub: "Ready for New Joiners",
        trend: "+6 Stock",
        trendDirection: "up",
        color: "emerald",
        icon: "Archive",
        sparkline: [32, 34, 30, 36, 35, 38, 38]
      },
      {
        id: "active_it_tickets",
        label: "Open Tickets",
        value: "5",
        sub: "1 Critical VPN Alert",
        trend: "Action",
        trendDirection: "danger",
        color: "rose",
        icon: "AlertOctagon",
        sparkline: [4, 6, 8, 7, 6, 5, 5]
      },
      {
        id: "subnets_active",
        label: "Office Subnets",
        value: "3 Subnets",
        sub: "IP Whitelist & Firewall OK",
        trend: "Secure",
        trendDirection: "up",
        color: "teal",
        icon: "ShieldAlert",
        sparkline: [3, 3, 3, 3, 3, 3, 3]
      }
    ],
    announcement: {
      id: "ann-6",
      badge: "Security",
      badgeColor: "rose",
      title: "Scheduled Core Switch & Firewall Patching Window Tonight 🛡️",
      description: "Maintenance window: 11:00 PM – 11:45 PM IST. VPN tunnels may experience intermittent reconnects.",
      date: "05 Nov 2026",
      actionText: "Topology",
      link: "#"
    },
    charts: [
      {
        id: "asset_donut",
        title: "Hardware Asset Distribution",
        subtitle: "Laptops & equipment in inventory",
        type: "donut",
        centerText: "322",
        centerLabel: "Total Devices",
        data: [
          { label: "MacBook Pro M2/M3", value: 92, color: "#6366F1" },
          { label: "ThinkPad T14", value: 86, color: "#0EA5E9" },
          { label: "4K Displays", value: 120, color: "#F59E0B" },
          { label: "Dell Workstations", value: 24, color: "#10B981" }
        ]
      },
      {
        id: "ticket_severity",
        title: "Helpdesk SLA Performance",
        subtitle: "Tickets created vs resolved within 30m SLA",
        type: "area",
        data: [
          { label: "Mon", created: 8, resolved: 7 },
          { label: "Tue", created: 6, resolved: 6 },
          { label: "Wed", created: 10, resolved: 9 },
          { label: "Thu", created: 5, resolved: 6 },
          { label: "Today", created: 4, resolved: 4 }
        ],
        series: [
          { key: "created", name: "Created", color: "#F43F5E" },
          { key: "resolved", name: "Resolved", color: "#10B981" }
        ]
      }
    ],
    quickActions: [
      { label: "Register Asset Tag", icon: "Tag", color: "indigo", action: "new_asset" },
      { label: "Assign Laptop", icon: "UserPlus", color: "emerald", action: "assign_laptop" },
      { label: "Revoke Access", icon: "UserX", color: "rose", action: "revoke_access" },
      { label: "Audit IP Logs", icon: "Terminal", color: "teal", action: "audit_network" }
    ],
    pendingApprovals: [
      {
        id: "app-11",
        user: "TICK-104: DevOps Gateway",
        role: "Critical Infra",
        title: "VPN Gateway OpenVPN Tunnel Config Reset",
        time: "12 mins ago",
        status: "P1 Urgent"
      },
      {
        id: "app-12",
        user: "Priya Rao (Joiner)",
        role: "QA Engineer",
        title: "Hardware Custody Handover Sign-off: ThinkPad T14",
        time: "45 mins ago",
        status: "Signature"
      }
    ]
  },

  it_officer: {
    id: "it_officer",
    name: "IT Officer",
    category: "Infrastructure",
    badge: "Role 7 of 9",
    accentColor: "teal",
    accentHex: "#14B8A6",
    subtitle: "Desk hardware maintenance, peripheral allocations, and biometric terminal support.",
    user: {
      name: "Suresh Prajapati",
      title: "IT Support Officer",
      avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200",
      initials: "SP"
    },
    metrics: [
      {
        id: "my_open_tickets",
        label: "Assigned Tickets",
        value: "3 Active",
        sub: "Desk 302, 308 & 404",
        trend: "In SLA",
        trendDirection: "up",
        color: "teal",
        icon: "Wrench",
        sparkline: [2, 4, 3, 5, 4, 3, 3]
      },
      {
        id: "under_repair",
        label: "Under Vendor Repair",
        value: "4 Units",
        sub: "Display & Keyboard RMA",
        trend: "Vendor Service",
        trendDirection: "neutral",
        color: "amber",
        icon: "Cpu",
        sparkline: [3, 3, 4, 5, 4, 4, 4]
      },
      {
        id: "handovers_due",
        label: "Handovers Pending",
        value: "2 Due",
        sub: "Waiting for Signatures",
        trend: "Today",
        trendDirection: "neutral",
        color: "purple",
        icon: "FileSignature",
        sparkline: [1, 1, 2, 2, 2, 2, 2]
      },
      {
        id: "zk_gateway_status",
        label: "Biometric Device",
        value: "Port 4370",
        sub: "ZK Device: Live & Pinging",
        trend: "Active",
        trendDirection: "up",
        color: "emerald",
        icon: "Wifi",
        sparkline: [1, 1, 1, 1, 1, 1, 1]
      }
    ],
    announcement: {
      id: "ann-7",
      badge: "Peripherals",
      badgeColor: "teal",
      title: "New Batch of Ergonomic Keyboards & USB-C Docks Arrived 🔌",
      description: "Available at IT counter floor 3 for employees with approved ergonomic requests.",
      date: "05 Nov 2026",
      actionText: "Stock Log",
      link: "#"
    },
    charts: [
      {
        id: "issues_donut",
        title: "Support Tickets by Category",
        subtitle: "Frequent desk incident share",
        type: "donut",
        centerText: "36",
        centerLabel: "Incidents",
        data: [
          { label: "Display / HDMI", value: 14, color: "#14B8A6" },
          { label: "Password / SSO", value: 9, color: "#6366F1" },
          { label: "Docking Station", value: 8, color: "#0EA5E9" },
          { label: "OS / Slow Boot", value: 5, color: "#F59E0B" }
        ]
      },
      {
        id: "daily_resolutions",
        title: "Daily Issue Resolution Velocity",
        subtitle: "Tickets closed within 30m SLA",
        type: "area",
        data: [
          { label: "Mon", resolved: 6 },
          { label: "Tue", resolved: 8 },
          { label: "Wed", resolved: 7 },
          { label: "Thu", resolved: 9 },
          { label: "Fri", resolved: 5 }
        ],
        series: [
          { key: "resolved", name: "Resolved Tickets", color: "#14B8A6" }
        ]
      }
    ],
    quickActions: [
      { label: "Resolve Ticket", icon: "CheckCircle", color: "teal", action: "resolve_ticket" },
      { label: "Issue Peripheral", icon: "PlusCircle", color: "indigo", action: "issue_item" },
      { label: "Test Biometrics", icon: "RefreshCw", color: "emerald", action: "test_zk" },
      { label: "Reset Password", icon: "Key", color: "amber", action: "reset_pass" }
    ],
    pendingApprovals: [
      {
        id: "app-13",
        user: "Desk 304: Anjali Patel",
        role: "UI/UX Designer",
        title: "Second Display 4K HDMI Port Flickering & Cable Replacement",
        time: "18 mins ago",
        status: "Open Ticket"
      },
      {
        id: "app-14",
        user: "Desk 202: Manish Vyas",
        role: "QA Automation",
        title: "Asset Custody Return: Replacement of faulty charger",
        time: "1 hour ago",
        status: "Sign-off"
      }
    ]
  },

  recruiter: {
    id: "recruiter",
    name: "Recruiter / BDE",
    category: "Talent Acquisition",
    badge: "Role 8 of 9",
    accentColor: "pink",
    accentHex: "#EC4899",
    subtitle: "Candidate talent pool, interview pipelines, and CTC offer dispatches.",
    user: {
      name: "Simran Kaur",
      title: "Lead Talent Acquisition Partner",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200",
      initials: "SK"
    },
    metrics: [
      {
        id: "active_requisitions",
        label: "Active Openings",
        value: "12 Roles",
        sub: "Engineering & QA",
        trend: "High Demand",
        trendDirection: "up",
        color: "pink",
        icon: "Briefcase",
        sparkline: [8, 9, 10, 11, 11, 12, 12]
      },
      {
        id: "talent_pipeline",
        label: "Active Candidates",
        value: "38 Pipeline",
        sub: "Across 4 Pipeline Stages",
        trend: "+6 New",
        trendDirection: "up",
        color: "indigo",
        icon: "Users",
        sparkline: [28, 30, 32, 35, 36, 38, 38]
      },
      {
        id: "interviews_today_recruiter",
        label: "Interviews Today",
        value: "5 Rounds",
        sub: "Tech L1 & Managerial",
        trend: "Scheduled",
        trendDirection: "neutral",
        color: "sky",
        icon: "Video",
        sparkline: [3, 4, 6, 4, 5, 5, 5]
      },
      {
        id: "offer_acceptance_rate",
        label: "Offer Acceptance",
        value: "87.5%",
        sub: "Q3 Benchmark Exceeded",
        trend: "+4.2%",
        trendDirection: "up",
        color: "emerald",
        icon: "Award",
        sparkline: [80, 82, 84, 85, 86, 87, 87.5]
      }
    ],
    announcement: {
      id: "ann-8",
      badge: "Hiring Milestone",
      badgeColor: "pink",
      title: "Senior Python & Odoo Lead Candidate Accepted Offer Letter! 🎉",
      description: "Joining scheduled for December 1st. Onboarding team notified.",
      date: "05 Nov 2026",
      actionText: "View Offer",
      link: "#"
    },
    charts: [
      {
        id: "pipeline_funnel",
        title: "Recruitment Pipeline Funnel",
        subtitle: "Candidate progression through hiring stages",
        type: "bar",
        data: [
          { label: "Sourced", count: 148, color: "#EC4899" },
          { label: "Screened", count: 38, color: "#6366F1" },
          { label: "Tech L1/L2", count: 18, color: "#0EA5E9" },
          { label: "Management HR", count: 7, color: "#F59E0B" },
          { label: "Offered", count: 4, color: "#10B981" }
        ]
      },
      {
        id: "sourcing_donut",
        title: "Sourcing Channel Share",
        subtitle: "Percentage share of qualified candidates",
        type: "donut",
        centerText: "100%",
        centerLabel: "Channels",
        data: [
          { label: "LinkedIn Recruiter", value: 52, color: "#0EA5E9" },
          { label: "Employee Referrals", value: 28, color: "#10B981" },
          { label: "Job Portals", value: 12, color: "#8B5CF6" },
          { label: "Campus Tech Drives", value: 8, color: "#F59E0B" }
        ]
      }
    ],
    quickActions: [
      { label: "Create Job Opening", icon: "PlusSquare", color: "pink", action: "new_opening" },
      { label: "Add Candidate", icon: "UserPlus", color: "indigo", action: "add_candidate" },
      { label: "Generate CTC Offer", icon: "DollarSign", color: "emerald", action: "generate_offer" },
      { label: "Schedule Tech Round", icon: "Calendar", color: "sky", action: "schedule_round" }
    ],
    pendingApprovals: [
      {
        id: "app-15",
        user: "Snehal Dave",
        role: "Senior Odoo Candidate",
        title: "CTC Offer Letter Approval: ₹ 22.5 LPA",
        time: "30 mins ago",
        status: "Admin Sign"
      },
      {
        id: "app-16",
        user: "Harshil Mehta",
        role: "Frontend Dev Candidate",
        title: "Technical L2 Scorecard Submitted: 4.5/5",
        time: "2 hours ago",
        status: "HR Round"
      }
    ]
  },

  project_manager: {
    id: "project_manager",
    name: "Project Manager",
    category: "Delivery & Projects",
    badge: "Role 9 of 9",
    accentColor: "blue",
    accentHex: "#2563EB",
    subtitle: "Tracking client deliverables, developer billability utilization, and sprint velocity.",
    user: {
      name: "Karan Singhal",
      title: "Senior Technical Project Manager",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
      initials: "KS"
    },
    metrics: [
      {
        id: "active_projects",
        label: "Active Projects",
        value: "8 Accounts",
        sub: "6 Client • 2 Internal R&D",
        trend: "Healthy",
        trendDirection: "up",
        color: "blue",
        icon: "FolderKanban",
        sparkline: [6, 7, 7, 8, 8, 8, 8]
      },
      {
        id: "hours_logged_pm",
        label: "Weekly Logged Hours",
        value: "342 / 360 h",
        sub: "95% Target Achieved",
        trend: "On-Track",
        trendDirection: "up",
        color: "emerald",
        icon: "Clock",
        sparkline: [310, 320, 335, 340, 338, 342, 342]
      },
      {
        id: "project_billability",
        label: "Resource Billability",
        value: "89.2%",
        sub: "4 Developers on Bench",
        trend: "+2.4%",
        trendDirection: "up",
        color: "indigo",
        icon: "TrendingUp",
        sparkline: [82, 84, 85, 86, 88, 89, 89.2]
      },
      {
        id: "overdue_milestones",
        label: "Overdue Items",
        value: "1 Milestone",
        sub: "Omega ERP UAT Phase 2",
        trend: "Action",
        trendDirection: "danger",
        color: "amber",
        icon: "AlertTriangle",
        sparkline: [0, 0, 1, 1, 2, 1, 1]
      }
    ],
    announcement: {
      id: "ann-9",
      badge: "Deployment",
      badgeColor: "blue",
      title: "SquadFocus Enterprise v2.4 Deployment to Client Staging Success! 🚀",
      description: "Client UAT kickoff scheduled for Monday 10:00 AM IST. All sprint timesheets must be submitted.",
      date: "05 Nov 2026",
      actionText: "Sprint Metrics",
      link: "#"
    },
    charts: [
      {
        id: "sprint_velocity",
        title: "Sprint Velocity & Points Delivery",
        subtitle: "Committed story points vs delivered across Sprints 20–24",
        type: "area",
        data: [
          { label: "Sprint 20", committed: 48, delivered: 46 },
          { label: "Sprint 21", committed: 52, delivered: 50 },
          { label: "Sprint 22", committed: 50, delivered: 52 },
          { label: "Sprint 23", committed: 55, delivered: 54 },
          { label: "Sprint 24", committed: 60, delivered: 58 }
        ],
        series: [
          { key: "committed", name: "Committed", color: "#94A3B8" },
          { key: "delivered", name: "Delivered", color: "#2563EB" }
        ]
      },
      {
        id: "project_hours_donut",
        title: "Developer Hours by Account",
        subtitle: "Distribution of billable hours this month",
        type: "donut",
        centerText: "974 h",
        centerLabel: "Logged",
        data: [
          { label: "SquadFocus Core", value: 420, color: "#2563EB" },
          { label: "Omega Elevators ERP", value: 310, color: "#0EA5E9" },
          { label: "FinTech Gateway", value: 180, color: "#10B981" },
          { label: "Bench / Upskilling", value: 64, color: "#F59E0B" }
        ]
      }
    ],
    quickActions: [
      { label: "Create Milestone", icon: "Flag", color: "blue", action: "new_milestone" },
      { label: "Allocate Dev", icon: "UserCheck", color: "indigo", action: "allocate_dev" },
      { label: "Approve Timesheet", icon: "CheckSquare", color: "emerald", action: "approve_timesheet" },
      { label: "Velocity Report", icon: "BarChart3", color: "purple", action: "velocity_report" }
    ],
    pendingApprovals: [
      {
        id: "app-17",
        user: "SquadFocus v2.4 Release",
        role: "Client Sign-off",
        title: "Sprint 24 Staging Sign-off and UAT Release Notes",
        time: "40 mins ago",
        status: "PM Approval"
      },
      {
        id: "app-18",
        user: "Rohan Sharma (Dev)",
        role: "Timesheet Audit",
        title: "Weekly Log: 40h Billable to Omega Elevators Account",
        time: "1 hour ago",
        status: "Ready"
      }
    ]
  }
};
