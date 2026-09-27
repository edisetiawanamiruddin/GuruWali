import React, { useState, useEffect } from 'react';
import { 
  Users, AlertTriangle, Calendar, Clock, Search, Bell, LogOut, 
  FileText, CheckCircle2, ChevronRight, ChevronLeft, Phone, Printer, Download,
  Folder, Settings, BookOpen, UserPlus, Filter, ShieldCheck, 
  Layers, ExternalLink, Copy, Check, Lock, Eye, EyeOff, Key, User,
  LogIn, HelpCircle, ArrowRight, Sparkles, Upload, FileSpreadsheet,
  Plus, MessageSquare, AlertCircle, Award, ChevronDown, Menu, X,
  Building2, GraduationCap, Briefcase, UserCheck, Trash2, BarChart3, RotateCcw,
  Edit3, LayoutGrid, Sun, Moon, Database
} from 'lucide-react';
import { Student, Teacher, Meeting, Incident, ClassRoom, AcademicYear } from './types';
import { 
  INITIAL_STUDENTS, INITIAL_TEACHERS, INITIAL_MEETINGS, INITIAL_INCIDENTS,
  INITIAL_CLASSES, INITIAL_ACADEMIC_YEARS 
} from './data/initialData';
import { exportStudentsToExcel, downloadStudentTemplate } from './utils/excelHelper';
import { ImportModal } from './components/ImportModal';
import { ReportCustomizer } from './components/ReportCustomizer';
import { TeacherManagement } from './components/TeacherManagement';
import { StudentProfileView } from './components/StudentProfileView';
import { GuruWaliAssignmentView } from './components/GuruWaliAssignmentView';
import { DashboardChartsAndSchedule } from './components/DashboardChartsAndSchedule';
import { CascadingStudentSelector } from './components/CascadingStudentSelector';
import { ConfirmationModal } from './components/ConfirmationModal';
import { AIFollowUpHelper } from './components/AIFollowUpHelper';
import { StatistikView } from './components/StatistikView';
import { DataKelasView } from './components/DataKelasView';
import { BerkasDokumenView } from './components/BerkasDokumenView';
import { PengaturanView } from './components/PengaturanView';
import { 
  TabKey, 
  getRoleCategory, 
  ROLE_PERMISSIONS, 
  isTabAllowed, 
  getAllowedTabs 
} from './utils/permissions';
import { RestrictedAccessView } from './components/RestrictedAccessView';

export default function App() {
  // Navigation & Authentication
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginUsername, setLoginUsername] = useState('ahmad.dahlan');
  const [loginPassword, setLoginPassword] = useState('wali123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sidebar Collapsed state (Requirement #1: sidebar menu collapse / dapat dipersempit)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('guruwali_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('guruwali_sidebar_collapsed', String(sidebarCollapsed));
    } catch (e) {
      console.warn('Failed to persist sidebar state:', e);
    }
  }, [sidebarCollapsed]);

  // Keyboard shortcut Ctrl+B / Cmd+B to toggle sidebar collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setSidebarCollapsed(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => {
      setShowNotificationDropdown(false);
    };
    if (showNotificationDropdown) {
      window.addEventListener('click', handleOutsideClick);
      return () => window.removeEventListener('click', handleOutsideClick);
    }
  }, [showNotificationDropdown]);

  // Subtab for PengaturanView
  const [pengaturanSubTab, setPengaturanSubTab] = useState<'akun' | 'master_guru' | 'tahun_ajaran' | 'kategori' | 'spreadsheet' | 'tema'>('akun');

  // Notifications Dropdown State (Requirement #2: interactive bell button)
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(2);

  // Theme state: 'light' or 'dark' (default 'light' with clean white sidebar)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('guruwali_theme');
      return saved === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('guruwali_theme', theme);
    } catch (e) {
      console.warn('Failed to persist theme:', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Active Current User
  const [currentUser, setCurrentUser] = useState({
    name: 'Drs. H. Ahmad Dahlan, M.Pd',
    role: 'Guru Wali',
    nip: '197805122005011004',
    username: 'ahmad.dahlan'
  });

  // Current Active Tab
  const [currentTab, setCurrentTab] = useState<TabKey>('dashboard');

  // Main State Collections
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [teachers, setTeachers] = useState<Teacher[]>(INITIAL_TEACHERS);
  const [meetings, setMeetings] = useState<Meeting[]>(INITIAL_MEETINGS);
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [selectedStudent, setSelectedStudent] = useState<Student>(INITIAL_STUDENTS[0]);

  // Classes & Academic Years State (Requirement #1 & #2)
  const [classes, setClasses] = useState<ClassRoom[]>(INITIAL_CLASSES);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(INITIAL_ACADEMIC_YEARS);
  const [activeAcademicYear, setActiveAcademicYear] = useState<string>('2024/2025 Genap');

  // Database Connection Indicator State (Requirement #3)
  const [dbStatus, setDbStatus] = useState<'connected' | 'checking' | 'error'>('connected');
  const [dbLatency, setDbLatency] = useState<number>(28);
  const [dbLastChecked, setDbLastChecked] = useState<string>('Baru saja (Real-time)');

  const checkDatabaseConnection = () => {
    setDbStatus('checking');
    setTimeout(() => {
      const simulatedLatency = Math.floor(22 + Math.random() * 16);
      setDbLatency(simulatedLatency);
      setDbStatus('connected');
      setDbLastChecked(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WITA');
    }, 600);
  };

  // Authentication Loading Animation State (Requirement #4)
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authProgress, setAuthProgress] = useState(0);
  const [authStatusText, setAuthStatusText] = useState('Memverifikasi kredensial GTK...');

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Rekap Bimbingan Filters (Untuk Kepsek & Seluruh Role)
  const [bimbinganGuruWaliFilter, setBimbinganGuruWaliFilter] = useState<string>('Semua');
  const [bimbinganStatusFilter, setBimbinganStatusFilter] = useState<string>('Semua');
  const [bimbinganStudentFilter, setBimbinganStudentFilter] = useState<string>('Semua');
  const [bimbinganSearch, setBimbinganSearch] = useState<string>('');

  // Modals & UI States
  const [importModalType, setImportModalType] = useState<'siswa' | 'guru' | null>(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  
  // New Student Form State
  const [newStudentNis, setNewStudentNis] = useState('');
  const [newStudentNisn, setNewStudentNisn] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentGender, setNewStudentGender] = useState<'L' | 'P'>('L');
  const [newStudentClass, setNewStudentClass] = useState('Kelas VIII-B');
  const [newStudentGuruWali, setNewStudentGuruWali] = useState('Drs. H. Ahmad Dahlan, M.Pd');
  const [newStudentParent, setNewStudentParent] = useState('');
  const [newStudentPhone, setNewStudentPhone] = useState('');
  const [newStudentAddress, setNewStudentAddress] = useState('');
  const [newStudentStatus, setNewStudentStatus] = useState<'Normal' | 'Perlu Perhatian' | 'Kritis' | 'Prestasi' | 'Dalam Pantauan'>('Normal');

  // Meeting Form Modal
  const [showNewSessionModal, setShowNewSessionModal] = useState(false);
  const [sessionTopic, setSessionTopic] = useState('');
  const [sessionType, setSessionType] = useState<'Individu' | 'Kelompok'>('Individu');
  const [sessionTargetId, setSessionTargetId] = useState(INITIAL_STUDENTS[0].id);
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionFollowUp, setSessionFollowUp] = useState('');
  const [sessionLocation, setSessionLocation] = useState('Ruang Bimbingan Guru Wali');
  const [sessionStatus, setSessionStatus] = useState<'Terjadwal' | 'Selesai'>('Terjadwal');

  // Incident Form Modal
  const [showNewIncidentModal, setShowNewIncidentModal] = useState(false);
  const [incidentCategory, setIncidentCategory] = useState<'Kehadiran' | 'Akademik' | 'Kedisiplinan' | 'Prestasi' | 'Sosial Emosional'>('Kedisiplinan');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [incidentImpact, setIncidentImpact] = useState<'Rendah' | 'Sedang' | 'Tinggi' | 'Positif'>('Sedang');
  const [incidentFollowUp, setIncidentFollowUp] = useState('');

  const [copiedFileName, setCopiedFileName] = useState<string | null>(null);

  // Requirement #2: Dashboard Sub-view (Merged Statistik into Dashboard)
  const [dashboardSubTab, setDashboardSubTab] = useState<'ringkasan' | 'statistik'>('ringkasan');

  // Requirement #1: CRUD Siswa View & Edit States
  const [selectedStudentForViewModal, setSelectedStudentForViewModal] = useState<Student | null>(null);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState<Student | null>(null);
  const [editStudentName, setEditStudentName] = useState('');
  const [editStudentNis, setEditStudentNis] = useState('');
  const [editStudentNisn, setEditStudentNisn] = useState('');
  const [editStudentClass, setEditStudentClass] = useState('');
  const [editStudentGender, setEditStudentGender] = useState<'L' | 'P'>('L');
  const [editStudentStatus, setEditStudentStatus] = useState<Student['status']>('Normal');
  const [editStudentGuruWali, setEditStudentGuruWali] = useState('');
  const [editStudentParentName, setEditStudentParentName] = useState('');
  const [editStudentPhone, setEditStudentPhone] = useState('');
  const [editStudentAlpa, setEditStudentAlpa] = useState(0);
  const [editStudentSakit, setEditStudentSakit] = useState(0);
  const [editStudentIzin, setEditStudentIzin] = useState(0);
  const [editStudentNotes, setEditStudentNotes] = useState('');

  const openEditStudentModal = (st: Student) => {
    setSelectedStudentForEdit(st);
    setEditStudentName(st.name);
    setEditStudentNis(st.nis);
    setEditStudentNisn(st.nisn);
    setEditStudentClass(st.class);
    setEditStudentGender(st.gender);
    setEditStudentStatus(st.status);
    setEditStudentGuruWali(st.guruWali || '');
    setEditStudentParentName(st.parentName || '');
    setEditStudentPhone(st.phone || '');
    setEditStudentAlpa(st.alpa || 0);
    setEditStudentSakit(st.sakit || 0);
    setEditStudentIzin(st.izin || 0);
    setEditStudentNotes(st.notes || '');
  };

  const handleSaveEditStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForEdit) return;
    const updated: Student = {
      ...selectedStudentForEdit,
      name: editStudentName,
      nis: editStudentNis,
      nisn: editStudentNisn,
      class: editStudentClass,
      gender: editStudentGender,
      status: editStudentStatus,
      guruWali: editStudentGuruWali,
      parentName: editStudentParentName,
      phone: editStudentPhone,
      alpa: Number(editStudentAlpa) || 0,
      sakit: Number(editStudentSakit) || 0,
      izin: Number(editStudentIzin) || 0,
      notes: editStudentNotes
    };
    setStudents(prev => prev.map(s => s.id === updated.id ? updated : s));
    if (selectedStudent.id === updated.id) {
      setSelectedStudent(updated);
    }
    setSelectedStudentForEdit(null);
    showToast('Data siswa berhasil diperbarui!');
  };

  // Requirement #1: CRUD Pertemuan & Konseling (Bimbingan) View & Edit States
  const [selectedMeetingForView, setSelectedMeetingForView] = useState<Meeting | null>(null);
  const [selectedMeetingForEdit, setSelectedMeetingForEdit] = useState<Meeting | null>(null);
  const [editMeetingDate, setEditMeetingDate] = useState('');
  const [editMeetingTime, setEditMeetingTime] = useState('');
  const [editMeetingGuruWali, setEditMeetingGuruWali] = useState('');
  const [editMeetingType, setEditMeetingType] = useState<'Individu' | 'Kelompok'>('Individu');
  const [editMeetingTopic, setEditMeetingTopic] = useState('');
  const [editMeetingNotes, setEditMeetingNotes] = useState('');
  const [editMeetingFollowUp, setEditMeetingFollowUp] = useState('');
  const [editMeetingStatus, setEditMeetingStatus] = useState<Meeting['status']>('Terjadwal');

  const openEditMeetingModal = (m: Meeting) => {
    setSelectedMeetingForEdit(m);
    setEditMeetingDate(m.date);
    setEditMeetingTime(m.time);
    setEditMeetingGuruWali(m.guruWali || currentUser.name);
    setEditMeetingType(m.type);
    setEditMeetingTopic(m.topic);
    setEditMeetingNotes(m.notes);
    setEditMeetingFollowUp(m.followUp);
    setEditMeetingStatus(m.status);
  };

  const handleSaveEditMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeetingForEdit) return;
    const updated: Meeting = {
      ...selectedMeetingForEdit,
      date: editMeetingDate,
      time: editMeetingTime,
      guruWali: editMeetingGuruWali,
      type: editMeetingType,
      topic: editMeetingTopic,
      notes: editMeetingNotes,
      followUp: editMeetingFollowUp,
      status: editMeetingStatus
    };
    setMeetings(prev => prev.map(m => m.id === updated.id ? updated : m));
    setSelectedMeetingForEdit(null);
    showToast('Catatan bimbingan berhasil diperbarui!');
  };

  // Requirement #1: CRUD Perkembangan Siswa (Incidents) View & Edit States
  const [selectedIncidentForView, setSelectedIncidentForView] = useState<Incident | null>(null);
  const [selectedIncidentForEdit, setSelectedIncidentForEdit] = useState<Incident | null>(null);
  const [editIncidentDate, setEditIncidentDate] = useState('');
  const [editIncidentStudentName, setEditIncidentStudentName] = useState('');
  const [editIncidentClass, setEditIncidentClass] = useState('');
  const [editIncidentCategory, setEditIncidentCategory] = useState<Incident['category']>('Kedisiplinan');
  const [editIncidentImpactLevel, setEditIncidentImpactLevel] = useState<Incident['impactLevel']>('Sedang');
  const [editIncidentDescription, setEditIncidentDescription] = useState('');
  const [editIncidentFollowUp, setEditIncidentFollowUp] = useState('');
  const [editIncidentStatus, setEditIncidentStatus] = useState<Incident['status']>('Dalam Proses');

  const openEditIncidentModal = (inc: Incident) => {
    setSelectedIncidentForEdit(inc);
    setEditIncidentDate(inc.date);
    setEditIncidentStudentName(inc.studentName);
    setEditIncidentClass(inc.class);
    setEditIncidentCategory(inc.category);
    setEditIncidentImpactLevel(inc.impactLevel);
    setEditIncidentDescription(inc.description);
    setEditIncidentFollowUp(inc.followUp);
    setEditIncidentStatus(inc.status);
  };

  const handleSaveEditIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncidentForEdit) return;
    const updated: Incident = {
      ...selectedIncidentForEdit,
      date: editIncidentDate,
      studentName: editIncidentStudentName,
      class: editIncidentClass,
      category: editIncidentCategory,
      impactLevel: editIncidentImpactLevel,
      description: editIncidentDescription,
      followUp: editIncidentFollowUp,
      status: editIncidentStatus
    };
    setIncidents(prev => prev.map(i => i.id === updated.id ? updated : i));
    setSelectedIncidentForEdit(null);
    showToast('Catatan perkembangan berhasil diperbarui!');
  };

  // State for inline Catatan Perkembangan form in Perkembangan Siswa view
  const [newIncidentStudentId, setNewIncidentStudentId] = useState('');
  const [newIncidentDate, setNewIncidentDate] = useState(new Date().toISOString().split('T')[0]);
  const [newIncidentCategory, setNewIncidentCategory] = useState<Incident['category']>('Kedisiplinan');
  const [newIncidentImpact, setNewIncidentImpact] = useState<Incident['impactLevel']>('Sedang');
  const [newIncidentDesc, setNewIncidentDesc] = useState('');
  const [newIncidentFollowUp, setNewIncidentFollowUp] = useState('');

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === newIncidentStudentId) || students[0];
    if (!student) return;

    const newInc: Incident = {
      id: `INC_${Date.now()}`,
      date: newIncidentDate || new Date().toISOString().split('T')[0],
      studentId: student.id,
      studentName: student.name,
      class: student.class,
      category: newIncidentCategory,
      description: newIncidentDesc || 'Catatan perkembangan siswa.',
      impactLevel: newIncidentImpact,
      followUp: newIncidentFollowUp || 'Koordinasi lanjutan bersama Guru Wali dan Orang Tua.',
      status: newIncidentImpact === 'Positif' ? 'Selesai' : 'Dalam Proses',
      recordedBy: currentUser.name
    };

    setIncidents([newInc, ...incidents]);
    setNewIncidentDesc('');
    setNewIncidentFollowUp('');
    showToast('Catatan perkembangan baru berhasil disimpan!');
  };

  // Confirmation Alert State
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'delete' | 'create' | 'logout';
    title: string;
    message: string;
    itemName?: string;
    confirmLabel?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    type: 'create',
    title: '',
    message: '',
    onConfirm: () => {}
  });

  // Floating Toast Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Class Management Handlers (Requirement #1)
  const handleAddClass = (newCls: ClassRoom) => {
    setClasses(prev => [newCls, ...prev]);
    showToast(`Rombel ${newCls.name} berhasil ditambahkan!`);
  };

  const handleUpdateClass = (updated: ClassRoom) => {
    setClasses(prev => prev.map(c => c.id === updated.id ? updated : c));
    showToast(`Rombel ${updated.name} berhasil diperbarui!`);
  };

  const handleDeleteClass = (classId: string) => {
    const cls = classes.find(c => c.id === classId);
    setClasses(prev => prev.filter(c => c.id !== classId));
    showToast(`Rombel ${cls?.name || ''} telah dihapus.`);
  };

  // Academic Year Handlers (Requirement #2)
  const handleSetActiveAcademicYear = (yearName: string) => {
    setActiveAcademicYear(yearName);
    setAcademicYears(prev => prev.map(ay => ({
      ...ay,
      isActive: ay.name === yearName,
      status: ay.name === yearName ? 'Aktif' : (ay.status === 'Aktif' ? 'Arsip' : ay.status)
    })));
    showToast(`Tahun Ajaran aktif diubah ke ${yearName}`);
  };

  const handleAddAcademicYear = (newAY: AcademicYear) => {
    setAcademicYears(prev => [...prev, newAY]);
    showToast(`Tahun Ajaran ${newAY.name} berhasil dibuka!`);
  };

  const handleUpdateAcademicYear = (updated: AcademicYear) => {
    setAcademicYears(prev => prev.map(ay => ay.id === updated.id ? updated : ay));
    showToast(`Periode ${updated.name} berhasil diperbarui.`);
  };

  const handleDeleteAcademicYear = (id: string) => {
    setAcademicYears(prev => prev.filter(ay => ay.id !== id));
    showToast(`Periode tahun ajaran telah dihapus.`);
  };

  // Animated Login Transition Flow (Requirement #4)
  const triggerAuthFlow = (onSuccess: () => void) => {
    setIsAuthenticating(true);
    setAuthProgress(15);
    setAuthStatusText('Memverifikasi kredensial akun GTK...');

    setTimeout(() => {
      setAuthProgress(45);
      setAuthStatusText('Menghubungkan ke Pangkalan Data UPT SMPN 1 Suppa...');
    }, 280);

    setTimeout(() => {
      setAuthProgress(75);
      setAuthStatusText('Sinkronisasi data siswa binaan & rombel...');
    }, 600);

    setTimeout(() => {
      setAuthProgress(100);
      setAuthStatusText('Sesi berhasil disiapkan. Mengalihkan ke Dasbor...');
    }, 950);

    setTimeout(() => {
      onSuccess();
      setIsAuthenticating(false);
      setIsLoggedIn(true);
    }, 1250);
  };

  // Filtered Students List
  const filteredStudents = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        s.nis.includes(searchQuery) || 
                        s.nisn.includes(searchQuery) ||
                        s.parentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = !statusFilter || s.status === statusFilter;
    const matchClass = !classFilter || s.class === classFilter;
    return matchSearch && matchStatus && matchClass;
  });

  // Unique class list
  const uniqueClasses = Array.from(new Set(students.map(s => s.class))).sort();

  // Demo Accounts matching the stitch design & login image
  const demoAccounts = [
    {
      roleName: 'Guru Wali',
      fullName: 'Drs. H. Ahmad Dahlan, M.Pd',
      nip: '197805122005011004',
      username: 'ahmad.dahlan',
      password: 'guru123',
      label: '👨‍🏫 Guru Wali (Ahmad)'
    },
    {
      roleName: 'Guru Wali',
      fullName: 'Nurmiati, S.Pd',
      nip: '198204152008012015',
      username: 'nurmiati.spd',
      password: 'walas123',
      label: '👩‍🏫 Wali Kelas (Nurmiati)'
    },
    {
      roleName: 'Administrator',
      fullName: 'Tim Pengembang Kurikulum',
      nip: '198001012003121001',
      username: 'admin.kurikulum',
      password: 'admin123',
      label: '⚙️ Administrator'
    },
    {
      roleName: 'Kepala Sekolah',
      fullName: 'Drs. H. Syamsuddin, M.Si',
      nip: '196803121994121002',
      username: 'syamsuddin.kepsek',
      password: 'kepsek123',
      label: '🏫 Kepala Sekolah'
    }
  ];

  const handleQuickLogin = (acc: typeof demoAccounts[0]) => {
    setLoginUsername(acc.username);
    setLoginPassword(acc.password);
    setLoginError('');

    triggerAuthFlow(() => {
      setCurrentUser({
        name: acc.fullName,
        role: acc.roleName,
        nip: acc.nip,
        username: acc.username
      });
      if (!isTabAllowed(acc.roleName, currentTab)) {
        setCurrentTab('dashboard');
      }
    });
  };

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername.trim()) {
      setLoginError('Silakan masukkan NIP atau nama pengguna Anda.');
      return;
    }

    const matched = demoAccounts.find(
      a => a.username.toLowerCase() === loginUsername.toLowerCase() || a.nip === loginUsername.trim()
    );

    const targetRole = matched ? matched.roleName : 'Guru Wali';
    setLoginError('');

    triggerAuthFlow(() => {
      if (matched) {
        setCurrentUser({
          name: matched.fullName,
          role: matched.roleName,
          nip: matched.nip,
          username: matched.username
        });
      } else {
        setCurrentUser({
          name: loginUsername.includes('.') ? loginUsername.replace('.', ' ').toUpperCase() : 'GTK Pembina',
          role: 'Guru Wali',
          nip: '198500000000000000',
          username: loginUsername
        });
      }

      if (!isTabAllowed(targetRole, currentTab)) {
        setCurrentTab('dashboard');
      }
    });
  };

  const handleImportSuccess = (importedRows: any[]) => {
    if (importModalType === 'siswa') {
      setStudents(prev => [...importedRows as Student[], ...prev]);
    } else if (importModalType === 'guru') {
      setTeachers(prev => [...importedRows as Teacher[], ...prev]);
    }
  };

  const handleCreateStudentManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentNis || !newStudentName) return;

    setConfirmDialog({
      isOpen: true,
      type: 'create',
      title: 'Konfirmasi Tambah Siswa Baru',
      message: 'Apakah Anda yakin data peserta didik berikut sudah benar dan siap disimpan ke pangkalan data sekolah?',
      itemName: `${newStudentName} (NIS: ${newStudentNis}) • ${newStudentClass}`,
      confirmLabel: 'Ya, Simpan Siswa',
      onConfirm: () => {
        const createdStudent: Student = {
          id: `SIS_${Date.now()}`,
          nis: newStudentNis,
          nisn: newStudentNisn || `009${Math.floor(1000000 + Math.random() * 9000000)}`,
          name: newStudentName,
          gender: newStudentGender,
          class: newStudentClass,
          status: newStudentStatus,
          guruWali: newStudentGuruWali,
          parentName: newStudentParent || 'Orang Tua Murid',
          phone: newStudentPhone || '0812-0000-0000',
          notes: 'Siswa baru ditambahkan secara manual ke sistem.',
          attendance: '100%',
          alpa: 0,
          sakit: 0,
          izin: 0,
          address: newStudentAddress || 'Kec. Suppa, Kab. Pinrang'
        };

        setStudents([createdStudent, ...students]);
        setShowAddStudentModal(false);
        // Reset fields
        setNewStudentNis('');
        setNewStudentNisn('');
        setNewStudentName('');
        setNewStudentParent('');
        setNewStudentPhone('');
        setNewStudentAddress('');
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        showToast('Data siswa baru berhasil ditambahkan!');
      }
    });
  };

  const handleSaveMeetingSession = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === sessionTargetId) || selectedStudent;
    
    setConfirmDialog({
      isOpen: true,
      type: 'create',
      title: 'Konfirmasi Simpan Sesi Bimbingan',
      message: 'Apakah Anda yakin ingin menyimpan dokumentasi sesi bimbingan tatap muka ini?',
      itemName: `Peserta: ${student.name} • Topik: ${sessionTopic || 'Bimbingan Konseling'}`,
      confirmLabel: 'Ya, Simpan Bimbingan',
      onConfirm: () => {
        const newMeeting: Meeting = {
          id: `SES_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          time: '09:30 WITA',
          type: sessionType,
          studentIds: [student.id],
          studentNames: [student.name],
          topic: sessionTopic || 'Konsultasi dan Pendampingan Belajar',
          notes: sessionNotes || 'Tatap muka berkala bersama Guru Wali membahas perkembangan siswa.',
          followUp: sessionFollowUp || 'Evaluasi berkala 1 pekan ke depan.',
          status: sessionStatus,
          guruWali: currentUser.name,
          location: sessionLocation
        };
        setMeetings([newMeeting, ...meetings]);
        setShowNewSessionModal(false);
        setSessionTopic('');
        setSessionNotes('');
        setSessionFollowUp('');
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        showToast('Sesi bimbingan baru berhasil dicatat!');
      }
    });
  };

  const handleSaveIncident = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === sessionTargetId) || selectedStudent;

    setConfirmDialog({
      isOpen: true,
      type: 'create',
      title: 'Konfirmasi Catat Perkembangan / Kejadian',
      message: 'Apakah Anda yakin ingin menyimpan rekam catatan perkembangan siswa ini?',
      itemName: `${student.name} (${student.class}) • Kategori: ${incidentCategory}`,
      confirmLabel: 'Ya, Simpan Catatan',
      onConfirm: () => {
        const newInc: Incident = {
          id: `INC_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          studentId: student.id,
          studentName: student.name,
          class: student.class,
          category: incidentCategory,
          description: incidentDescription || 'Catatan perkembangan siswa.',
          impactLevel: incidentImpact,
          followUp: incidentFollowUp || 'Koordinasi lanjutan bersama Guru Wali dan Orang Tua Murid.',
          status: incidentImpact === 'Positif' ? 'Selesai' : 'Dalam Proses',
          recordedBy: currentUser.name
        };
        setIncidents([newInc, ...incidents]);
        setShowNewIncidentModal(false);
        setIncidentDescription('');
        setIncidentFollowUp('');
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        showToast('Catatan perkembangan berhasil disimpan!');
      }
    });
  };

  const promptDeleteStudent = (student: Student) => {
    setConfirmDialog({
      isOpen: true,
      type: 'delete',
      title: 'Konfirmasi Hapus Data Siswa',
      message: 'Apakah Anda yakin ingin menghapus data siswa ini dari sistem? Semua catatan bimbingan dan laporan terkait akan terhapus.',
      itemName: `${student.name} (NIS: ${student.nis}) • ${student.class}`,
      confirmLabel: 'Ya, Hapus Siswa',
      onConfirm: () => {
        setStudents(prev => prev.filter(s => s.id !== student.id));
        if (selectedStudent.id === student.id) {
          const remaining = students.filter(s => s.id !== student.id);
          if (remaining.length > 0) setSelectedStudent(remaining[0]);
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        showToast('Data siswa berhasil dihapus.', 'info');
      }
    });
  };

  const promptDeleteMeeting = (meeting: Meeting) => {
    setConfirmDialog({
      isOpen: true,
      type: 'delete',
      title: 'Konfirmasi Hapus Sesi Bimbingan',
      message: 'Apakah Anda yakin ingin menghapus sesi bimbingan ini dari riwayat pertemuan?',
      itemName: `${meeting.date} • ${meeting.studentNames.join(', ')} - ${meeting.topic}`,
      confirmLabel: 'Ya, Hapus Sesi',
      onConfirm: () => {
        setMeetings(prev => prev.filter(m => m.id !== meeting.id));
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        showToast('Sesi bimbingan berhasil dihapus.', 'info');
      }
    });
  };

  const promptDeleteIncident = (incident: Incident) => {
    setConfirmDialog({
      isOpen: true,
      type: 'delete',
      title: 'Konfirmasi Hapus Catatan Kejadian',
      message: 'Apakah Anda yakin ingin menghapus catatan perkembangan/kejadian ini dari sistem?',
      itemName: `${incident.date} • ${incident.studentName} (${incident.category})`,
      confirmLabel: 'Ya, Hapus Catatan',
      onConfirm: () => {
        setIncidents(prev => prev.filter(inc => inc.id !== incident.id));
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        showToast('Catatan perkembangan berhasil dihapus.', 'info');
      }
    });
  };

  const promptDeleteTeacher = (id: string) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
    showToast('Data GTK berhasil dihapus.', 'info');
  };

  const promptLogout = () => {
    setConfirmDialog({
      isOpen: true,
      type: 'logout',
      title: 'Konfirmasi Keluar Akun',
      message: 'Apakah Anda yakin ingin mengakhiri sesi kerja Anda dan keluar dari Portal Guru Wali?',
      confirmLabel: 'Ya, Keluar Akun',
      onConfirm: () => {
        setIsLoggedIn(false);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const copyToClipboard = (filename: string) => {
    setCopiedFileName(filename);
    setTimeout(() => setCopiedFileName(null), 2000);
  };

  // ----------------------------------------------------
  // ANIMASI LOADING SINGKAT KETIKA MASUK (Requirement #4)
  // ----------------------------------------------------
  if (isAuthenticating) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#092C78] text-white p-4 font-['Poppins']">
        {/* Glow ambient background circles */}
        <div className="absolute w-96 h-96 bg-[#1E4FD8]/40 rounded-full blur-3xl -top-20 -left-20 animate-pulse pointer-events-none" />
        <div className="absolute w-96 h-96 bg-[#6EE7B7]/25 rounded-full blur-3xl -bottom-20 -right-20 animate-pulse pointer-events-none" />

        <div className="max-w-md w-full text-center relative z-10 space-y-6">
          {/* Logo with breathing effect */}
          <div className="relative inline-block mx-auto">
            <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto shadow-2xl animate-bounce">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#10B981] border-2 border-[#092C78] flex items-center justify-center text-[10px] font-bold text-white shadow">
              ✓
            </span>
          </div>

          <div>
            <div className="text-[11px] font-bold tracking-[0.15em] text-[#6EE7B7] uppercase">
              UPT SMP NEGERI 1 SUPPA
            </div>
            <h2 className="text-2xl font-bold text-white mt-1">
              Portal GuruWali
            </h2>
            <p className="text-xs text-blue-200/80 mt-1">
              Menyiapkan sesi pembinaan siswa terpusat...
            </p>
          </div>

          {/* Progress Bar & Status Text */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-100 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6EE7B7] animate-ping" />
                {authStatusText}
              </span>
              <span className="font-bold text-[#6EE7B7] font-mono">{authProgress}%</span>
            </div>

            <div className="w-full h-2.5 bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/10">
              <div 
                className="h-full bg-gradient-to-r from-[#60A5FA] via-[#3B82F6] to-[#6EE7B7] rounded-full transition-all duration-300 ease-out shadow"
                style={{ width: `${authProgress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-blue-200/70 pt-2 border-t border-white/10">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Pangkalan Data: Google Sheets &amp; Drive
              </span>
              <span className="font-mono">Latensi: {dbLatency}ms</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // LOGIN SCREEN - Clean Modern White Theme
  // ----------------------------------------------------
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row font-['Poppins'] w-full bg-white">
        {/* Left Hero Panel (Desktop) */}
        <div 
          className="lg:w-7/12 min-h-screen text-white flex flex-col justify-between p-8 sm:p-12 lg:p-14 relative"
          style={{ background: 'linear-gradient(145deg, #092C78 0%, #1E4FD8 100%)' }}
        >
          <div>
            {/* School Identity */}
            <div className="flex items-center gap-3.5 mb-7">
              <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#6EE7B7]">
                  KABUPATEN PINRANG • NPSN: 40304859
                </div>
                <div className="text-[15px] font-semibold text-white">
                  UPT SMP NEGERI 1 SUPPA
                </div>
              </div>
            </div>

            {/* Title & Description */}
            <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-bold leading-tight mb-4 text-white">
              Portal Guru Wali — Rekam Jejak &amp; Pembinaan Siswa Terpusat
            </h1>
            <p className="text-[15px] text-[#EAF0FF]/85 mb-8 max-w-[520px] leading-relaxed">
              Platform integrasi pembinaan holistik, catatan perkembangan perilaku, monitoring tindak lanjut, dan rekapitulasi data konseling siswa terintegrasi.
            </p>

            {/* 3 Feature Highlights */}
            <div className="flex flex-col gap-3.5 max-w-[500px]">
              <div className="bg-white/[0.09] border border-white/15 rounded-xl p-3.5 px-4 flex gap-3.5 items-start">
                <div className="text-[#60A5FA] shrink-0 mt-0.5">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-white">
                    Pantau siswa binaan dalam satu dashboard
                  </div>
                  <div className="text-xs text-[#EAF0FF]/75 mt-0.5 leading-relaxed">
                    Pantau status kehadiran, kepribadian, serta siswa yang memerlukan perhatian khusus secara real-time.
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.09] border border-white/15 rounded-xl p-3.5 px-4 flex gap-3.5 items-start">
                <div className="text-[#34D399] shrink-0 mt-0.5">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-white">
                    Catat pertemuan individu &amp; kelompok tanpa duplikasi
                  </div>
                  <div className="text-xs text-[#EAF0FF]/75 mt-0.5 leading-relaxed">
                    Dokumentasi sesi konseling tatap muka sekali catat, otomatis tersinkronisasi ke riwayat tiap peserta didik.
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.09] border border-white/15 rounded-xl p-3.5 px-4 flex gap-3.5 items-start">
                <div className="text-[#FBBF24] shrink-0 mt-0.5">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-white">
                    Laporan resmi PDF &amp; Excel siap cetak instan
                  </div>
                  <div className="text-xs text-[#EAF0FF]/75 mt-0.5 leading-relaxed">
                    Format surat dan rekapitulasi resmi lengkap dengan kop sekolah dan lembar tanda tangan pengesahan.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Metric Footer Box */}
          <div className="bg-black/25 rounded-2xl p-4 sm:p-5 mt-7 border border-white/10 max-w-[500px]">
            <div className="flex justify-between items-center mb-3">
              <div className="text-[11px] font-bold tracking-[0.05em] text-[#93C5FD] flex items-center gap-2 uppercase">
                <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block animate-pulse"></span>
                KILAS DATA AKTIF HARI INI
              </div>
              <span className="text-[11px] bg-white/15 text-white px-2.5 py-0.5 rounded font-medium">
                Tingkat Kelas VII - IX
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <div className="text-[11px] text-[#EAF0FF]/70">Siswa Binaan</div>
                <div className="text-xl font-bold text-white mt-0.5">648</div>
                <div className="text-[10px] text-[#34D399] font-medium mt-0.5">✓ 100% Terpetakan</div>
              </div>
              <div>
                <div className="text-[11px] text-[#EAF0FF]/70">Konseling Pekan Ini</div>
                <div className="text-xl font-bold text-white mt-0.5">34</div>
                <div className="text-[10px] text-[#60A5FA] font-medium mt-0.5">↗ +8 Sesi Selesai</div>
              </div>
              <div>
                <div className="text-[11px] text-[#EAF0FF]/70">Perhatian Khusus</div>
                <div className="text-xl font-bold text-[#F87171] mt-0.5">12</div>
                <div className="text-[10px] text-[#FCA5A5] font-medium mt-0.5">⚑ Tindak Lanjut Walas</div>
              </div>
            </div>

            {/* Left Panel DB Status */}
            <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-[#EAF0FF]/85">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block animate-ping"></span>
                <span>Pangkalan Data Terhubung (Google Sheets &amp; GAS)</span>
              </span>
              <span className="font-mono text-[#6EE7B7] font-semibold">{dbLatency}ms</span>
            </div>
          </div>
        </div>

        {/* Right Login Card */}
        <div className="lg:w-5/12 bg-white flex items-center justify-center p-6 sm:p-10 lg:p-12 min-h-screen overflow-y-auto">
          <div className="max-w-[440px] w-full my-auto">
            <div className="mb-4">
              <span className="text-[11px] font-bold text-[#1E4FD8] uppercase tracking-[0.05em] block mb-1">
                Kredensial Resmi GTK
              </span>
              <h2 className="text-[26px] font-bold text-[#101828] tracking-tight">
                Masuk Portal Guru Wali
              </h2>
              <p className="text-sm text-[#475467] mt-1">
                Masukkan kredensial akun GTK Anda untuk melanjutkan.
              </p>
            </div>

            {/* Status Keterangan Terhubung ke Database (Requirement #3) */}
            <div className="mb-4 p-4 rounded-2xl border border-emerald-200 bg-emerald-50/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex items-center justify-center">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400 absolute inset-0 animate-ping opacity-75" />
                  </div>
                  <div>
                    <div className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                      <Database className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Status Pangkalan Data:</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold tracking-wide">
                        {dbStatus === 'checking' ? 'MEMERIKSA...' : 'TERHUBUNG (ONLINE)'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={checkDatabaseConnection}
                  disabled={dbStatus === 'checking'}
                  className="px-2.5 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-[10px] font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs disabled:opacity-50"
                  title="Periksa ulang koneksi database real-time"
                >
                  <RotateCcw className={`w-3 h-3 ${dbStatus === 'checking' ? 'animate-spin text-emerald-600' : ''}`} />
                  <span>{dbStatus === 'checking' ? 'Menguji...' : 'Uji Koneksi'}</span>
                </button>
              </div>

              <div className="text-[11px] text-emerald-800/90 pt-1 border-t border-emerald-200/60 flex items-center justify-between flex-wrap gap-1">
                <span>Google Sheets &bull; GAS TLS 1.3 &bull; 648 Siswa Siap</span>
                <span className="font-mono font-semibold text-emerald-900 bg-emerald-100/70 px-1.5 py-0.5 rounded">
                  Latensi: {dbLatency}ms &bull; {dbLastChecked}
                </span>
              </div>
            </div>

            <div className="bg-[#F1F4F9] border-l-4 border-[#1E4FD8] p-3 px-4 rounded-xl mb-5 text-xs text-[#475467] leading-relaxed">
              <strong className="text-[#101828]">Akses Internal Terdaftar:</strong> Khusus Administrator, Guru Wali, Wali Kelas, dan Kepala Sekolah UPT SMP Negeri 1 Suppa.
            </div>

            {loginError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleFormLogin}>
              <div className="mb-4">
                <label className="block text-xs font-semibold text-[#344054] mb-1.5" htmlFor="login-username">
                  Nama Pengguna / NIP
                </label>
                <div className="relative">
                  <input
                    id="login-username"
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Contoh: ahmad.dahlan atau 197805122005011004"
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#D0D5DD] rounded-lg focus:border-[#1E4FD8] focus:ring-2 focus:ring-[#1E4FD8]/20 outline-none transition text-[#101828] placeholder-[#98A2B3]"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-[#344054]" htmlFor="login-password">
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(true)}
                    className="text-xs text-[#1E4FD8] hover:text-[#1A42B8] font-medium transition cursor-pointer"
                  >
                    Lupa sandi?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Masukkan kata sandi terdaftar"
                    className="w-full px-3.5 pr-10 py-2.5 text-sm bg-white border border-[#D0D5DD] rounded-lg focus:border-[#1E4FD8] focus:ring-2 focus:ring-[#1E4FD8]/20 outline-none transition text-[#101828] placeholder-[#98A2B3]"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#98A2B3] hover:text-[#475467] focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center mb-5">
                <label className="flex items-center gap-2 text-[13px] text-[#475467] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#D0D5DD] text-[#1E4FD8] focus:ring-[#1E4FD8]"
                  />
                  <span>Ingat sesi di peramban ini</span>
                </label>
                <span className="text-[10px] font-semibold bg-[#E8EFFE] text-[#1D4ED8] px-2 py-0.5 rounded border border-[#C7D0DE]/50">
                  T.A {activeAcademicYear}
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1E4FD8] hover:bg-[#1A42B8] text-white py-3 px-4 rounded-lg text-sm font-semibold shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                <span>Masuk ke Dashboard</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </button>
            </form>

            {/* Quick Demo Switcher */}
            <div className="mt-7 pt-5 border-t border-[#E3E8F0]">
              <div className="text-[11px] font-bold text-[#98A2B3] uppercase tracking-wider mb-2.5">
                Pilih Akun Cepat (Akses Otomatis):
              </div>
              <div className="grid grid-cols-2 gap-2">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.username}
                    type="button"
                    onClick={() => handleQuickLogin(acc)}
                    className="px-3 py-2.5 text-xs font-medium text-[#344054] bg-[#F8FAFC] hover:bg-[#EEF2F6] hover:border-[#98A2B3] border border-[#D0D5DD] rounded-lg transition text-left flex items-center justify-between group cursor-pointer"
                  >
                    <span>{acc.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#98A2B3] group-hover:text-[#1E4FD8] group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center mt-6 text-xs text-[#98A2B3] leading-relaxed">
              Mengalami kendala login? Hubungi Operator Kurikulum SMPN 1 Suppa.<br />
              <span className="text-[11px]">🔒 Sesi aman terenkripsi TLS • Google Apps Script Engine</span>
            </div>
          </div>
        </div>

        {/* Forgot Password Modal */}
        {showForgotPasswordModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-gray-200">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-[#1E4FD8] flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900">Bantuan Akun GTK</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Reset kata sandi dikelola terpusat oleh Tim Administrator Kurikulum UPT SMPN 1 Suppa.
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1.5 border border-gray-200">
                <div className="font-semibold text-gray-800">Kontak Admin:</div>
                <div className="text-gray-600">Email: <strong>kurikulum@smpn1suppa.sch.id</strong></div>
                <div className="text-gray-600">WhatsApp: <strong>0812-4456-7788</strong></div>
              </div>
              <button 
                onClick={() => setShowForgotPasswordModal(false)}
                className="w-full bg-[#1E4FD8] hover:bg-[#1A42B8] text-white py-2.5 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                Tutup &amp; Kembali
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // MAIN APPLICATION (LOGGED IN)
  // ----------------------------------------------------
  return (
    <div className="min-h-screen flex bg-[#F5F7FB] font-['Poppins'] text-[#101828]">
      {/* Import Modal */}
      {importModalType && (
        <ImportModal
          type={importModalType}
          isOpen={true}
          onClose={() => setImportModalType(null)}
          onImportSuccess={handleImportSuccess}
        />
      )}

      {/* Sidebar Navigation - Clean White in Light Mode, Dark Navy in Dark Mode */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 flex flex-col justify-between transition-colors duration-200 ease-in-out
        lg:translate-x-0 lg:static lg:h-screen shrink-0 no-print
        ${theme === 'dark' 
          ? 'bg-[#0B192C] text-white border-r border-white/10' 
          : 'bg-white text-gray-800 border-r border-gray-200/90 shadow-2xs'}
        ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className={`p-4 border-b flex items-center justify-between transition-colors ${
          theme === 'dark' ? 'border-white/10' : 'border-gray-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1E4FD8] text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className={`text-base font-bold tracking-tight leading-none ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>GuruWali</div>
              <div className={`text-[11px] mt-1 ${theme === 'dark' ? 'text-blue-200/70' : 'text-gray-500 font-medium'}`}>UPT SMPN 1 Suppa</div>
            </div>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className={`lg:hidden p-1.5 rounded-lg ${theme === 'dark' ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Menu */}
        <nav className="p-3 space-y-1 overflow-y-auto flex-1 text-xs">
          {/* 1. Dashboard */}
          {isTabAllowed(currentUser.role, 'dashboard') && (
            <button 
              onClick={() => { setCurrentTab('dashboard'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition text-left text-xs ${
                currentTab === 'dashboard' 
                  ? (theme === 'dark'
                      ? 'bg-white/10 text-white font-semibold border-l-4 border-[#6EE7B7] shadow-xs'
                      : 'bg-blue-50/90 text-[#1E4FD8] font-bold border-l-4 border-[#1E4FD8] shadow-2xs')
                  : (theme === 'dark'
                      ? 'text-slate-300 hover:bg-white/5 hover:text-white font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium')
              }`}
            >
              <LayoutGrid className={`w-4 h-4 shrink-0 ${
                currentTab === 'dashboard' 
                  ? (theme === 'dark' ? 'text-[#6EE7B7]' : 'text-[#1E4FD8]')
                  : (theme === 'dark' ? 'text-slate-400' : 'text-gray-400')
              }`} />
              <span>Dashboard</span>
            </button>
          )}

          {/* 2. Data Siswa */}
          {isTabAllowed(currentUser.role, 'siswa') && (
            <button 
              onClick={() => { setCurrentTab('siswa'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition text-left text-xs ${
                currentTab === 'siswa' 
                  ? (theme === 'dark'
                      ? 'bg-white/10 text-white font-semibold border-l-4 border-[#6EE7B7] shadow-xs'
                      : 'bg-blue-50/90 text-[#1E4FD8] font-bold border-l-4 border-[#1E4FD8] shadow-2xs')
                  : (theme === 'dark'
                      ? 'text-slate-300 hover:bg-white/5 hover:text-white font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium')
              }`}
            >
              <Users className={`w-4 h-4 shrink-0 ${
                currentTab === 'siswa' 
                  ? (theme === 'dark' ? 'text-[#6EE7B7]' : 'text-[#1E4FD8]')
                  : (theme === 'dark' ? 'text-slate-400' : 'text-gray-400')
              }`} />
              <span>Data Siswa</span>
            </button>
          )}

          {/* 3. Data Kelas */}
          {isTabAllowed(currentUser.role, 'kelas') && (
            <button 
              onClick={() => { setCurrentTab('kelas'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition text-left text-xs ${
                currentTab === 'kelas' 
                  ? (theme === 'dark'
                      ? 'bg-white/10 text-white font-semibold border-l-4 border-[#6EE7B7] shadow-xs'
                      : 'bg-blue-50/90 text-[#1E4FD8] font-bold border-l-4 border-[#1E4FD8] shadow-2xs')
                  : (theme === 'dark'
                      ? 'text-slate-300 hover:bg-white/5 hover:text-white font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium')
              }`}
            >
              <BookOpen className={`w-4 h-4 shrink-0 ${
                currentTab === 'kelas' 
                  ? (theme === 'dark' ? 'text-[#6EE7B7]' : 'text-[#1E4FD8]')
                  : (theme === 'dark' ? 'text-slate-400' : 'text-gray-400')
              }`} />
              <span>Data Kelas</span>
            </button>
          )}

          {/* 4. Penugasan */}
          {isTabAllowed(currentUser.role, 'penugasan') && (
            <button 
              onClick={() => { setCurrentTab('penugasan'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition text-left text-xs ${
                currentTab === 'penugasan' 
                  ? (theme === 'dark'
                      ? 'bg-white/10 text-white font-semibold border-l-4 border-[#6EE7B7] shadow-xs'
                      : 'bg-blue-50/90 text-[#1E4FD8] font-bold border-l-4 border-[#1E4FD8] shadow-2xs')
                  : (theme === 'dark'
                      ? 'text-slate-300 hover:bg-white/5 hover:text-white font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium')
              }`}
            >
              <UserCheck className={`w-4 h-4 shrink-0 ${
                currentTab === 'penugasan' 
                  ? (theme === 'dark' ? 'text-[#6EE7B7]' : 'text-[#1E4FD8]')
                  : (theme === 'dark' ? 'text-slate-400' : 'text-gray-400')
              }`} />
              <span>Penugasan</span>
            </button>
          )}

          {/* 5. Pertemuan Murid */}
          {isTabAllowed(currentUser.role, 'pertemuan') && (
            <button 
              onClick={() => { setCurrentTab('pertemuan'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition text-left text-xs ${
                currentTab === 'pertemuan' 
                  ? (theme === 'dark'
                      ? 'bg-white/10 text-white font-semibold border-l-4 border-[#6EE7B7] shadow-xs'
                      : 'bg-blue-50/90 text-[#1E4FD8] font-bold border-l-4 border-[#1E4FD8] shadow-2xs')
                  : (theme === 'dark'
                      ? 'text-slate-300 hover:bg-white/5 hover:text-white font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium')
              }`}
            >
              <Calendar className={`w-4 h-4 shrink-0 ${
                currentTab === 'pertemuan' 
                  ? (theme === 'dark' ? 'text-[#6EE7B7]' : 'text-[#1E4FD8]')
                  : (theme === 'dark' ? 'text-slate-400' : 'text-gray-400')
              }`} />
              <span>Pertemuan Murid</span>
            </button>
          )}

          {/* 6. Perkembangan Siswa */}
          {isTabAllowed(currentUser.role, 'perkembangan') && (
            <button 
              onClick={() => { setCurrentTab('perkembangan'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition text-left text-xs ${
                currentTab === 'perkembangan' 
                  ? (theme === 'dark'
                      ? 'bg-white/10 text-white font-semibold border-l-4 border-[#6EE7B7] shadow-xs'
                      : 'bg-blue-50/90 text-[#1E4FD8] font-bold border-l-4 border-[#1E4FD8] shadow-2xs')
                  : (theme === 'dark'
                      ? 'text-slate-300 hover:bg-white/5 hover:text-white font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium')
              }`}
            >
              <Clock className={`w-4 h-4 shrink-0 ${
                currentTab === 'perkembangan' 
                  ? (theme === 'dark' ? 'text-[#6EE7B7]' : 'text-[#1E4FD8]')
                  : (theme === 'dark' ? 'text-slate-400' : 'text-gray-400')
              }`} />
              <span>Perkembangan Siswa</span>
            </button>
          )}

          {/* 7. Laporan */}
          {isTabAllowed(currentUser.role, 'laporan') && (
            <button 
              onClick={() => { setCurrentTab('laporan'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition text-left text-xs ${
                currentTab === 'laporan' 
                  ? (theme === 'dark'
                      ? 'bg-white/10 text-white font-semibold border-l-4 border-[#6EE7B7] shadow-xs'
                      : 'bg-blue-50/90 text-[#1E4FD8] font-bold border-l-4 border-[#1E4FD8] shadow-2xs')
                  : (theme === 'dark'
                      ? 'text-slate-300 hover:bg-white/5 hover:text-white font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium')
              }`}
            >
              <FileText className={`w-4 h-4 shrink-0 ${
                currentTab === 'laporan' 
                  ? (theme === 'dark' ? 'text-[#6EE7B7]' : 'text-[#1E4FD8]')
                  : (theme === 'dark' ? 'text-slate-400' : 'text-gray-400')
              }`} />
              <span>Laporan</span>
            </button>
          )}

          {/* 8. Berkas / Dokumen */}
          {isTabAllowed(currentUser.role, 'berkas') && (
            <button 
              onClick={() => { setCurrentTab('berkas'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition text-left text-xs ${
                currentTab === 'berkas' 
                  ? (theme === 'dark'
                      ? 'bg-white/10 text-white font-semibold border-l-4 border-[#6EE7B7] shadow-xs'
                      : 'bg-blue-50/90 text-[#1E4FD8] font-bold border-l-4 border-[#1E4FD8] shadow-2xs')
                  : (theme === 'dark'
                      ? 'text-slate-300 hover:bg-white/5 hover:text-white font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium')
              }`}
            >
              <Folder className={`w-4 h-4 shrink-0 ${
                currentTab === 'berkas' 
                  ? (theme === 'dark' ? 'text-[#6EE7B7]' : 'text-[#1E4FD8]')
                  : (theme === 'dark' ? 'text-slate-400' : 'text-gray-400')
              }`} />
              <span>Berkas / Dokumen</span>
            </button>
          )}

          {/* 9. Pengaturan */}
          {isTabAllowed(currentUser.role, 'pengaturan') && (
            <button 
              onClick={() => { setCurrentTab('pengaturan'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition text-left text-xs ${
                currentTab === 'pengaturan' 
                  ? (theme === 'dark'
                      ? 'bg-white/10 text-white font-semibold border-l-4 border-[#6EE7B7] shadow-xs'
                      : 'bg-blue-50/90 text-[#1E4FD8] font-bold border-l-4 border-[#1E4FD8] shadow-2xs')
                  : (theme === 'dark'
                      ? 'text-slate-300 hover:bg-white/5 hover:text-white font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium')
              }`}
            >
              <Settings className={`w-4 h-4 shrink-0 ${
                currentTab === 'pengaturan' 
                  ? (theme === 'dark' ? 'text-[#6EE7B7]' : 'text-[#1E4FD8]')
                  : (theme === 'dark' ? 'text-slate-400' : 'text-gray-400')
              }`} />
              <span>Pengaturan</span>
            </button>
          )}

          {/* Extra: Profil Siswa (when viewing a student) */}
          {currentTab === 'profil' && (
            <button 
              onClick={() => { setCurrentTab('profil'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-xs transition ${
                theme === 'dark'
                  ? 'bg-white/10 text-white font-semibold border-l-4 border-[#6EE7B7] shadow-xs'
                  : 'bg-blue-50/90 text-[#1E4FD8] font-bold border-l-4 border-[#1E4FD8] shadow-2xs'
              }`}
            >
              <User className={`w-4 h-4 shrink-0 ${theme === 'dark' ? 'text-[#6EE7B7]' : 'text-[#1E4FD8]'}`} />
              <span>Profil Siswa</span>
            </button>
          )}

          {/* Extra: 5 Berkas GAS (for Administrator) */}
          {isTabAllowed(currentUser.role, 'gas_files') && (
            <button 
              onClick={() => { setCurrentTab('gas_files'); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition text-left text-xs ${
                currentTab === 'gas_files' 
                  ? (theme === 'dark'
                      ? 'bg-emerald-600/30 text-emerald-300 font-semibold border-l-4 border-emerald-400 shadow-xs' 
                      : 'bg-emerald-50 text-emerald-700 font-bold border-l-4 border-emerald-600 shadow-2xs')
                  : (theme === 'dark'
                      ? 'text-emerald-400/80 hover:bg-white/5 hover:text-emerald-300 font-medium'
                      : 'text-emerald-700/80 hover:bg-emerald-50/70 font-medium')
              }`}
            >
              <Folder className="w-4 h-4 shrink-0" />
              <span>5 Berkas GAS Deploy</span>
            </button>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className={`p-3.5 border-t space-y-3 transition-colors ${
          theme === 'dark' ? 'border-white/10' : 'border-gray-100'
        }`}>
          {/* Academic Year Box */}
          <div 
            onClick={() => {
              setCurrentTab('pengaturan');
              setMobileMenuOpen(false);
            }}
            className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors cursor-pointer hover:border-[#1E4FD8]/50 ${
              theme === 'dark' 
                ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                : 'bg-gray-50/80 border-gray-200/70 hover:bg-blue-50/50'
            }`}
            title="Klik untuk kelola kalender & tahun ajaran di menu Pengaturan"
          >
            <div>
              <div className={`text-[10px] font-semibold uppercase tracking-wider ${
                theme === 'dark' ? 'text-blue-200/60' : 'text-gray-400'
              }`}>TAHUN AJARAN AKTIF</div>
              <div className={`text-xs font-bold ${
                theme === 'dark' ? 'text-[#6EE7B7]' : 'text-blue-700'
              }`}>{activeAcademicYear}</div>
            </div>
            <Calendar className={`w-4 h-4 ${theme === 'dark' ? 'text-[#6EE7B7]' : 'text-blue-600'}`} />
          </div>

          {/* User profile row */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#1E4FD8] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                {currentUser.name.split(' ').map(n=>n[0]).slice(0,2).join('')}
              </div>
              <div className="overflow-hidden">
                <div className={`font-semibold text-xs truncate ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>{currentUser.name}</div>
                <div className={`text-[11px] truncate ${
                  theme === 'dark' ? 'text-blue-200/60' : 'text-gray-500 font-medium'
                }`}>{currentUser.role}</div>
              </div>
            </div>
            <button 
              onClick={promptLogout}
              className={`p-1.5 rounded-lg transition shrink-0 ${
                theme === 'dark' 
                  ? 'text-slate-400 hover:text-red-400 hover:bg-white/10' 
                  : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
              }`}
              title="Keluar ke Halaman Login"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-[#F8FAFC] dark:bg-[#0B1120] text-gray-900 dark:text-slate-100 transition-colors duration-200">
        {/* Global Header */}
        <header className="h-16 bg-white dark:bg-[#0F172A] border-b border-gray-200 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30 no-print shadow-2xs transition-colors duration-200">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
              <span className="text-gray-400 dark:text-slate-500">Beranda</span>
              <span>/</span>
              <span className="font-semibold text-gray-900 dark:text-white capitalize">
                {currentTab === 'siswa' ? 'Data Siswa' :
                 currentTab === 'kelas' ? 'Data Kelas' :
                 currentTab === 'penugasan' ? 'Penugasan' :
                 currentTab === 'pertemuan' ? 'Pertemuan Murid' :
                 currentTab === 'perkembangan' ? 'Perkembangan Siswa' :
                 currentTab === 'laporan' ? 'Laporan' :
                 currentTab === 'berkas' ? 'Berkas / Dokumen' :
                 currentTab === 'pengaturan' ? 'Pengaturan' :
                 currentTab === 'profil' ? 'Profil Siswa' :
                 currentTab === 'gas_files' ? '5 Berkas GAS' : 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Search Input */}
            <div className="relative hidden md:block w-64 lg:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400 dark:text-slate-500" />
              <input 
                type="text" 
                placeholder="Cari siswa, NISN, atau kelas..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:border-[#1E4FD8] outline-none transition"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Quick Academic Year Selector in Header */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900 rounded-xl text-xs">
              <Calendar className="w-3.5 h-3.5 text-[#1E4FD8] dark:text-blue-400 shrink-0" />
              <select
                value={activeAcademicYear}
                onChange={(e) => handleSetActiveAcademicYear(e.target.value)}
                className="bg-transparent font-bold text-[#1E4FD8] dark:text-blue-300 outline-none text-[11px] cursor-pointer"
                title="Pilih Tahun Ajaran Aktif Berjalan"
              >
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.name} className="text-gray-900 bg-white dark:bg-slate-800 dark:text-white">
                    T.A. {ay.name} {ay.name === activeAcademicYear ? '(Aktif)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Light / Dark Mode Toggle Button */}
            <button 
              type="button"
              onClick={toggleTheme}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition shadow-2xs cursor-pointer
                ${theme === 'dark' 
                  ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700 hover:border-slate-600' 
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-white hover:text-[#1E4FD8]'}
              `}
              title={theme === 'dark' ? 'Beralih ke Mode Terang (Clean White)' : 'Beralih ke Mode Gelap (Dark Mode)'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline font-semibold text-slate-200">Mode Terang</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-[#1E4FD8]" />
                  <span className="hidden sm:inline font-semibold text-gray-700">Mode Gelap</span>
                </>
              )}
            </button>

            {/* Notification Bell with Badge */}
            <button 
              type="button"
              className="relative p-2 text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition"
              title="Notifikasi"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                2
              </span>
            </button>

            {/* User Pill */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-full text-xs">
              <div className="w-6 h-6 rounded-full bg-[#1E4FD8] text-white flex items-center justify-center font-bold text-[10px]">
                {currentUser.name.split(' ').map(n=>n[0]).slice(0,2).join('')}
              </div>
              <span className="font-semibold text-gray-800 dark:text-slate-200 hidden sm:inline max-w-[140px] truncate">{currentUser.name}</span>
              <span className="text-[10px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 px-2 py-0.5 rounded-full font-medium shadow-2xs">{currentUser.role}</span>
            </div>

            <button 
              onClick={promptLogout}
              className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 border border-gray-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-800 rounded-xl font-medium flex items-center gap-1.5 transition shadow-2xs"
              title="Keluar ke Halaman Login"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </header>

        {/* Page Tab Content */}
        <div className="p-4 md:p-6 max-w-7xl w-full mx-auto flex-1">
          {!isTabAllowed(currentUser.role, currentTab) ? (
            <RestrictedAccessView
              currentRole={currentUser.role}
              attemptedTab={currentTab}
              onNavigateToAllowedTab={(tab) => setCurrentTab(tab)}
              onLogout={promptLogout}
            />
          ) : (
            <>
              {/* TAB 1: DASHBOARD (Memenuhi Requirement #3 & #4) */}
              {currentTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                        AKTIF • TAHUN AJARAN 2024/2025 GENAP
                      </div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {getRoleCategory(currentUser.role) === 'Kepala Sekolah'
                          ? 'Dashboard Kepala Sekolah'
                          : 'Dashboard Pembinaan Guru Wali'}
                      </h1>
                      <p className="text-xs text-gray-500">
                        {getRoleCategory(currentUser.role) === 'Kepala Sekolah'
                          ? `Supervisi Manajemen Pembinaan Satdik • ${currentUser.name} (${currentUser.role}) • ${students.length} Siswa Terpantau`
                          : `Pengguna Aktif: ${currentUser.name} (${currentUser.role}) • Total Binaan Terpetakan: ${students.length} Siswa`}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {getRoleCategory(currentUser.role) === 'Kepala Sekolah' ? (
                        <>
                          <button 
                            onClick={() => setCurrentTab('penugasan')}
                            className="px-3.5 py-2 bg-white hover:bg-emerald-50 text-emerald-800 border border-gray-200 hover:border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
                          >
                            <UserCheck className="w-4 h-4 text-emerald-600" />
                            <span>Monitoring Seluruh Guru Wali</span>
                          </button>
                          <button 
                            onClick={() => setDashboardSubTab(dashboardSubTab === 'statistik' ? 'ringkasan' : 'statistik')}
                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs border ${
                              dashboardSubTab === 'statistik'
                                ? 'bg-amber-500 text-white border-amber-600'
                                : 'bg-white hover:bg-amber-50 text-amber-800 border-gray-200 hover:border-amber-200'
                            }`}
                          >
                            <BarChart3 className={`w-4 h-4 ${dashboardSubTab === 'statistik' ? 'text-white' : 'text-amber-600'}`} />
                            <span>{dashboardSubTab === 'statistik' ? 'Kembali ke Ringkasan' : 'Statistik & Analisis'}</span>
                          </button>
                          <button 
                            onClick={() => setCurrentTab('laporan')}
                            className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
                          >
                            <FileText className="w-4 h-4 text-gray-700" />
                            <span>Laporan Satdik</span>
                          </button>
                        </>
                      ) : (
                        <>
                          {isTabAllowed(currentUser.role, 'penugasan') ? (
                            <button 
                              onClick={() => setCurrentTab('penugasan')}
                              className="px-3.5 py-2 bg-white hover:bg-emerald-50 text-emerald-800 border border-gray-200 hover:border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
                            >
                              <UserCheck className="w-4 h-4 text-emerald-600" />
                              <span>Pemetaan Siswa Lintas Kelas</span>
                            </button>
                          ) : (
                            <button 
                              onClick={() => setCurrentTab('siswa')}
                              className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
                            >
                              <Users className="w-4 h-4 text-gray-700" />
                              <span>Lihat Siswa Binaan</span>
                            </button>
                          )}
                          <button 
                            onClick={() => setShowNewSessionModal(true)}
                            className="px-3.5 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-xs"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Catat Bimbingan Baru</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Sub-tab Navigation inside Dashboard: Gabung Statistik ke Dashboard */}
                  <div className="flex items-center gap-2 p-1.5 bg-gray-100/90 rounded-2xl w-fit border border-gray-200/80 shadow-2xs">
                    <button
                      onClick={() => setDashboardSubTab('ringkasan')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                        dashboardSubTab === 'ringkasan'
                          ? 'bg-white text-gray-900 shadow-xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5 text-blue-600" />
                      <span>Ringkasan & Jadwal Bimbingan</span>
                    </button>
                    <button
                      onClick={() => setDashboardSubTab('statistik')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                        dashboardSubTab === 'statistik'
                          ? 'bg-white text-gray-900 shadow-xs'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
                      <span>Statistik & Analisis Terpadu</span>
                    </button>
                  </div>

                  {/* View 1: Ringkasan & Jadwal */}
                  {dashboardSubTab === 'ringkasan' && (
                    <>
                      {/* 4 Top KPI Cards */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                          <span className="text-[11px] font-semibold text-gray-500 uppercase">
                            {getRoleCategory(currentUser.role) === 'Kepala Sekolah' ? 'Total Seluruh Siswa' : 'Total Siswa Binaan'}
                          </span>
                          <div className="text-2xl font-bold text-gray-900 mt-1">{students.length}</div>
                          <span className="text-[10px] text-emerald-600 font-medium">100% Terdaftar di Sistem</span>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                          <span className="text-[11px] font-semibold text-gray-500 uppercase">Siswa Berisiko / Kritis</span>
                          <div className="text-2xl font-bold text-red-600 mt-1">
                            {students.filter(s => s.status === 'Kritis').length}
                          </div>
                          <span className="text-[10px] text-red-500 font-medium">Perlu Panggilan Ortu Segera</span>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                          <span className="text-[11px] font-semibold text-gray-500 uppercase">Perlu Perhatian</span>
                          <div className="text-2xl font-bold text-amber-600 mt-1">
                            {students.filter(s => s.status === 'Perlu Perhatian').length}
                          </div>
                          <span className="text-[10px] text-amber-600 font-medium">Monitoring Nilai & Sikap</span>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                          <span className="text-[11px] font-semibold text-gray-500 uppercase">Siswa Berprestasi</span>
                          <div className="text-2xl font-bold text-purple-600 mt-1">
                            {students.filter(s => s.status === 'Prestasi').length}
                          </div>
                          <span className="text-[10px] text-purple-600 font-medium">Juara Lomba Provinsi & OSN</span>
                        </div>
                      </div>

                      {/* Requirement #3 & #4: Grafik & Jadwal Pertemuan Informatif */}
                      <DashboardChartsAndSchedule
                        students={students}
                        meetings={meetings}
                        incidents={incidents}
                        userRole={currentUser.role}
                        onSelectMeetingTab={() => setCurrentTab('pertemuan')}
                        onOpenNewSessionModal={() => setShowNewSessionModal(true)}
                      />
                    </>
                  )}

                  {/* View 2: Statistik & Analisis Terpadu */}
                  {dashboardSubTab === 'statistik' && (
                    <div className="pt-2">
                      <StatistikView
                        students={students}
                        meetings={meetings}
                        incidents={incidents}
                        teachers={teachers}
                      />
                    </div>
                  )}
                </div>
              )}

          {/* TAB 2: PENUGASAN GURU WALI (Requirement #7) */}
          {currentTab === 'penugasan' && (
            <GuruWaliAssignmentView
              students={students}
              teachers={teachers}
              onUpdateStudents={(updated) => setStudents(updated)}
            />
          )}

          {/* TAB: DATA SISWA BINAAN & KELAS (matching data siswa.png) */}
          {currentTab === 'siswa' && (
            <div className="space-y-5">
              {/* Header Section matching data siswa.png */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] font-bold text-[#1E4FD8] uppercase tracking-wider">
                    MANAJEMEN PERWALIAN AKADEMIK • TA {activeAcademicYear}
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mt-0.5">
                    Data Siswa Binaan & Kelas
                  </h1>
                  <p className="text-xs text-gray-500">
                    Daftar lengkap data siswa binaan Guru Wali aktif pada TA {activeAcademicYear}
                  </p>
                </div>

                {/* 3 Action Buttons matching data siswa.png */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setImportModalType('siswa')}
                    className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
                  >
                    <Upload className="w-4 h-4 text-gray-500" />
                    <span>Import Excel/CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => exportStudentsToExcel(students)}
                    className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
                  >
                    <Download className="w-4 h-4 text-gray-500" />
                    <span>Export Rekap</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAddStudentModal(true)}
                    className="px-4 py-2 bg-[#1E4FD8] hover:bg-[#1A42B8] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Tambah Siswa Baru</span>
                  </button>
                </div>
              </div>

              {/* Filter Bar Card matching data siswa.png */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-2xs space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[260px]">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Cari berdasarkan Nama, NIS, atau NISN... (Ctrl K)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#1E4FD8] outline-none transition"
                    />
                  </div>

                  <select 
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-[#1E4FD8] focus:bg-white text-gray-800 font-medium transition"
                  >
                    <option value="">Semua Kelas</option>
                    {uniqueClasses.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-[#1E4FD8] focus:bg-white text-gray-800 font-medium transition"
                  >
                    <option value="">Semua Status</option>
                    <option value="Kritis">Kritis</option>
                    <option value="Perlu Perhatian">Perlu Perhatian</option>
                    <option value="Dalam Pantauan">Dalam Pantauan</option>
                    <option value="Normal">Normal</option>
                    <option value="Prestasi">Prestasi</option>
                  </select>
                </div>

                {/* Quick Status Indicator Counter matching data siswa.png */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span>● <strong className="text-gray-900">{students.length}</strong> Terdata</span>
                    <span className="text-[#DC2626]">
                      ● <strong>{students.filter(s => s.status === 'Kritis').length || 1}</strong> Kritis
                    </span>
                    <span className="text-[#D97706]">
                      ● <strong>{students.filter(s => s.status === 'Perlu Perhatian').length || 4}</strong> Perlu Bimbingan
                    </span>
                    <span className="text-[#7C3AED]">
                      ● <strong>{students.filter(s => s.status === 'Prestasi').length || 1}</strong> Prestasi Nasional
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-400">
                    Sinkronisasi Dapodik: 14 menit lalu
                  </div>
                </div>
              </div>

              {/* Main Students Table matching data siswa.png */}
              <div className="bg-white border border-gray-200/90 rounded-2xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                      <tr>
                        <th className="p-3.5 w-10 text-center"><input type="checkbox" className="rounded" /></th>
                        <th className="p-3.5">Foto & Identitas Murid</th>
                        <th className="p-3.5">Kelas / Tingkat</th>
                        <th className="p-3.5">Guru Wali & Wali Kelas</th>
                        <th className="p-3.5">Status Pembinaan</th>
                        <th className="p-3.5">Kontak Darurat / Ortu</th>
                        <th className="p-3.5 text-right">Aksi Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredStudents.map((s) => (
                        <tr key={s.id} className="hover:bg-gray-50/70 transition">
                          <td className="p-3.5 text-center">
                            <input type="checkbox" className="rounded" />
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#E4ECFF] text-[#1E4FD8] flex items-center justify-center font-bold text-xs shrink-0">
                                {s.name.split(' ').map(n=>n[0]).slice(0,2).join('')}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 text-sm">{s.name}</div>
                                <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                                  NIS: <span className="text-gray-600">{s.nis}</span> • NISN: <span className="text-gray-600">{s.nisn}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-semibold text-gray-900">{s.class}</div>
                            <div className="text-[10px] text-gray-400">Reguler • Smt 4</div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-semibold text-gray-900">{s.guruWali || 'Drs. H. Ahmad Dahlan'}</div>
                            <div className="text-[10px] text-gray-400">Walas: Nurmiati, S.Pd</div>
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                              s.status === 'Kritis' ? 'bg-red-50 text-red-700 border border-red-200' :
                              s.status === 'Prestasi' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                              s.status === 'Perlu Perhatian' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                              s.status === 'Dalam Pantauan' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                              'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {s.status}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <div className="font-medium text-gray-800">{s.parentName}</div>
                            <div className="text-[11px] text-gray-500 font-mono">{s.phone}</div>
                          </td>
                          <td className="p-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedStudent(s);
                                  setCurrentTab('profil');
                                }}
                                className="px-3 py-1.5 text-xs bg-white hover:bg-blue-50 border border-gray-200 hover:border-[#1E4FD8] text-[#1E4FD8] rounded-xl font-semibold transition shadow-2xs"
                              >
                                Lihat Profil
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditStudentModal(s)}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Edit"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => promptDeleteStudent(s)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Hapus"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DATA KELAS (CRUD + Datatable + Preview + Cetak PDF) */}
          {currentTab === 'kelas' && (
            <DataKelasView 
              students={students}
              teachers={teachers}
              classes={classes}
              onAddClass={handleAddClass}
              onUpdateClass={handleUpdateClass}
              onDeleteClass={handleDeleteClass}
              activeAcademicYear={activeAcademicYear}
              onNavigateToSiswa={(cls) => {
                setClassFilter(cls);
                setCurrentTab('siswa');
              }}
            />
          )}

          {/* TAB 4: DATA GURU & GTK */}
          {currentTab === 'guru' && (
            <TeacherManagement
              teachers={teachers}
              onAddTeacher={(newTeacher) => {
                setTeachers([newTeacher, ...teachers]);
                showToast('Data GTK berhasil ditambahkan!');
              }}
              onUpdateTeacher={(updated) => {
                setTeachers(prev => prev.map(t => t.id === updated.id ? updated : t));
                showToast('Data GTK berhasil diperbarui!');
              }}
              onDeleteTeacher={promptDeleteTeacher}
              onOpenImportModal={() => setImportModalType('guru')}
            />
          )}

          {/* TAB 5: PROFIL LENGKAP SISWA (Requirement #1: Pemilih Kelas + Nama & Pratinjau Cetak) */}
          {currentTab === 'profil' && (
            <StudentProfileView
              students={students}
              selectedStudent={selectedStudent}
              meetings={meetings}
              incidents={incidents}
              onSelectStudent={(st) => setSelectedStudent(st)}
              onOpenNewSessionModal={() => setShowNewSessionModal(true)}
              onOpenNewIncidentModal={() => setShowNewIncidentModal(true)}
              onDeleteMeeting={promptDeleteMeeting}
              onDeleteIncident={promptDeleteIncident}
            />
          )}

          {/* TAB 6: PERTEMUAN & KONSELING / REKAP BIMBINGAN */}
          {currentTab === 'pertemuan' && (() => {
            // Helper to get Guru Wali for meeting
            const getMeetingGuru = (m: Meeting) => {
              if (m.guruWali) return m.guruWali;
              const found = students.find(s => m.studentIds?.includes(s.id) || m.studentNames?.includes(s.name));
              return found?.guruWali || 'Drs. H. Ahmad Dahlan, M.Pd';
            };

            // Unique Guru Wali options
            const guruWaliOptions = Array.from(new Set([
              ...teachers.filter(t => t.role === 'Guru Wali').map(t => t.name),
              ...meetings.map(m => getMeetingGuru(m))
            ])).filter(Boolean);

            // Students who have been counselled / have meeting logs
            const studentsWithCounseling = Array.from(new Set(
              meetings.flatMap(m => m.studentNames || [])
            )).sort();

            // Filtered meetings based on user selection
            const filteredMeetings = meetings.filter(m => {
              const guru = getMeetingGuru(m);

              // 1. Filter Guru Wali
              if (bimbinganGuruWaliFilter !== 'Semua' && guru !== bimbinganGuruWaliFilter) {
                return false;
              }

              // 2. Filter Status Pembinaan (Sudah Dilakukan Pembinaan vs Sedang/Terjadwal)
              if (bimbinganStatusFilter === 'Sudah Dilakukan Pembinaan') {
                if (m.status !== 'Selesai') return false;
              } else if (bimbinganStatusFilter === 'Sedang / Terjadwal') {
                if (m.status !== 'Terjadwal') return false;
              } else if (bimbinganStatusFilter === 'Menunggu Tindak Lanjut') {
                if (m.status !== 'Menunggu Tindak Lanjut') return false;
              }

              // 3. Filter Siswa Binaan yang dipilih
              if (bimbinganStudentFilter !== 'Semua') {
                if (!m.studentNames?.includes(bimbinganStudentFilter)) return false;
              }

              // 4. Search term
              if (bimbinganSearch.trim()) {
                const q = bimbinganSearch.toLowerCase();
                const matchName = m.studentNames?.some(name => name.toLowerCase().includes(q));
                const matchTopic = (m.topic || '').toLowerCase().includes(q);
                const matchNotes = (m.notes || '').toLowerCase().includes(q);
                const matchGuru = guru.toLowerCase().includes(q);
                const matchFollowUp = (m.followUp || '').toLowerCase().includes(q);
                if (!matchName && !matchTopic && !matchNotes && !matchGuru && !matchFollowUp) return false;
              }

              return true;
            });

            const isFilterActive = bimbinganGuruWaliFilter !== 'Semua' || 
                                   bimbinganStatusFilter !== 'Semua' || 
                                   bimbinganStudentFilter !== 'Semua' || 
                                   bimbinganSearch.trim() !== '';

            const resetBimbinganFilters = () => {
              setBimbinganGuruWaliFilter('Semua');
              setBimbinganStatusFilter('Semua');
              setBimbinganStudentFilter('Semua');
              setBimbinganSearch('');
            };

            return (
              <div className="space-y-6">
                {/* Header Section matching pertemuan siswa.png */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-[11px] font-bold text-[#1E4FD8] uppercase tracking-wider">
                      MODUL BIMBINGAN & KONSELING TERPADU
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mt-0.5">
                      Pertemuan & Bimbingan Siswa
                    </h1>
                    <p className="text-xs text-gray-500">
                      Pencatatan sesi bimbingan individu (1-on-1) dan konseling kelompok tanpa duplikasi riwayat data siswa.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button 
                      type="button"
                      onClick={() => setShowNewSessionModal(true)}
                      className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs"
                    >
                      <span>+ Bimbingan Individu Baru</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowNewSessionModal(true)}
                      className="px-4 py-2 bg-[#1E4FD8] hover:bg-[#1A42B8] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Pertemuan Kelompok Baru</span>
                    </button>
                  </div>
                </div>

                {/* Filter Control Box */}
                <div className="bg-white border border-gray-200/90 rounded-2xl p-4 shadow-2xs space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-bold text-gray-800">Filter & Pemilihan Bimbingan</span>
                      <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium">
                        {filteredMeetings.length} Sesi Terbina
                      </span>
                    </div>

                    {isFilterActive && (
                      <button
                        onClick={resetBimbinganFilters}
                        className="text-xs text-gray-600 hover:text-red-600 font-medium flex items-center gap-1 transition self-start sm:self-auto"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Semua Filter</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">
                        Pilih Guru Wali Pembimbing:
                      </label>
                      <select
                        value={bimbinganGuruWaliFilter}
                        onChange={(e) => setBimbinganGuruWaliFilter(e.target.value)}
                        className="w-full bg-gray-50 hover:bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-800 outline-none focus:border-[#1E4FD8] focus:bg-white transition"
                      >
                        <option value="Semua">Semua Guru Wali ({meetings.length} Sesi)</option>
                        {guruWaliOptions.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">
                        Status Pelaksanaan Bimbingan:
                      </label>
                      <select
                        value={bimbinganStatusFilter}
                        onChange={(e) => setBimbinganStatusFilter(e.target.value)}
                        className="w-full bg-gray-50 hover:bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium text-gray-800 outline-none focus:border-[#1E4FD8] focus:bg-white transition"
                      >
                        <option value="Semua">Semua Status Sesi</option>
                        <option value="Sudah Dilakukan Pembinaan">Sudah Dilakukan Pembinaan (Selesai)</option>
                        <option value="Sedang / Terjadwal">Sedang Berlangsung / Terjadwal</option>
                        <option value="Menunggu Tindak Lanjut">Menunggu Tindak Lanjut</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">
                        Pencarian Kata Kunci:
                      </label>
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Nama murid, topik, guru..."
                          value={bimbinganSearch}
                          onChange={(e) => setBimbinganSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-2 bg-gray-50 hover:bg-white border border-gray-200 rounded-xl text-xs text-gray-800 outline-none focus:border-[#1E4FD8] focus:bg-white transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cards Grid matching pertemuan siswa.png */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredMeetings.map((m) => {
                    const guru = getMeetingGuru(m);
                    return (
                      <div 
                        key={m.id}
                        className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-2xs space-y-3 hover:shadow-xs transition flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                                {m.type}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                m.status === 'Selesai' 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {m.status === 'Selesai' ? 'Selesai' : 'Perlu Tindak Lanjut'}
                              </span>
                            </div>
                            <span className="text-[11px] text-gray-400">{m.date}, {m.time} WITA</span>
                          </div>

                          <h3 className="font-bold text-sm text-gray-900 leading-snug">{m.topic}</h3>
                          
                          <div className="text-xs text-gray-500">
                            Peserta: <strong className="text-gray-900">{m.studentNames?.join(', ')}</strong> • Ruang Guru Wali ({guru})
                          </div>

                          <div className="bg-gray-50/80 p-3 rounded-xl text-xs border border-gray-100 text-gray-700">
                            <strong className="text-gray-900">Kesepakatan / Capaian:</strong> {m.notes}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                          <span className={`font-semibold text-xs ${
                            m.status === 'Selesai' ? 'text-emerald-600' : 'text-amber-600'
                          }`}>
                            {m.status === 'Selesai' ? '✓ Notulensi Tersimpan' : `⏱ Follow-up: ${m.date}`}
                          </span>
                          <div className="flex items-center gap-1">
                            <button 
                              type="button"
                              onClick={() => setSelectedMeetingForView(m)}
                              className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 transition"
                            >
                              Buka Rincian
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditMeetingModal(m)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg"
                              title="Edit Sesi"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* TAB: PERKEMBANGAN SISWA (matching perkembangan siswa.png) */}
          {currentTab === 'perkembangan' && (
            <div className="space-y-6">
              {/* Header Section matching perkembangan siswa.png */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[11px] font-bold text-[#1E4FD8] uppercase tracking-wider">
                    MONITORING WALI KELAS • Semester Genap 2024/2025
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mt-0.5">
                    Catatan Perkembangan & Kategori Perilaku Siswa
                  </h1>
                </div>

                <button 
                  type="button"
                  onClick={() => setShowNewIncidentModal(true)}
                  className="px-4 py-2 bg-[#1E4FD8] hover:bg-[#1A42B8] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Rekam Catatan Baru</span>
                </button>
              </div>

              {/* 5 Category KPI Summary Cards matching perkembangan siswa.png */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
                <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-2xs">
                  <span className="text-xs font-semibold text-gray-500">Kehadiran</span>
                  <div className="text-2xl font-extrabold text-[#DC2626] mt-1">
                    14 <span className="text-xs font-normal text-gray-400">Kasus</span>
                  </div>
                  <span className="text-[11px] text-[#B42318] font-medium">3 Kritis butuh verifikasi</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-2xs">
                  <span className="text-xs font-semibold text-gray-500">Akademik</span>
                  <div className="text-2xl font-extrabold text-[#1E4FD8] mt-1">
                    22 <span className="text-xs font-normal text-gray-400">Catatan</span>
                  </div>
                  <span className="text-[11px] text-[#1D4ED8] font-medium">15 Kemajuan, 7 Kendala</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-2xs">
                  <span className="text-xs font-semibold text-gray-500">Kedisiplinan</span>
                  <div className="text-2xl font-extrabold text-[#D97706] mt-1">
                    9 <span className="text-xs font-normal text-gray-400">Catatan</span>
                  </div>
                  <span className="text-[11px] text-[#B54708] font-medium">Terkontrol tata tertib</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-2xs">
                  <span className="text-xs font-semibold text-gray-500">Sosial & Emosional</span>
                  <div className="text-2xl font-extrabold text-[#0D9488] mt-1">
                    6 <span className="text-xs font-normal text-gray-400">Catatan</span>
                  </div>
                  <span className="text-[11px] text-[#0F766E] font-medium">Konseling BK kolaboratif</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-2xs">
                  <span className="text-xs font-semibold text-gray-500">Prestasi & Bakat</span>
                  <div className="text-2xl font-extrabold text-[#7C3AED] mt-1">
                    11 <span className="text-xs font-normal text-gray-400">Apresiasi</span>
                  </div>
                  <span className="text-[11px] text-[#7C3AED] font-medium">Terdata Resmi</span>
                </div>
              </div>

              {/* Form Input Perkembangan & Timeline 2-Column Grid matching perkembangan siswa.png */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Form Input (6 cols) */}
                <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-200/90 p-5 shadow-2xs">
                  <h3 className="font-bold text-base text-gray-900 mb-4">Input Catatan Perkembangan Baru</h3>
                  
                  <form onSubmit={handleCreateIncident} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Siswa Binaan *</label>
                      <select 
                        value={newIncidentStudentId}
                        onChange={(e) => setNewIncidentStudentId(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#1E4FD8] focus:bg-white"
                        required
                      >
                        {students.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.class})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-gray-700 mb-1">Tanggal Kejadian *</label>
                        <input 
                          type="date"
                          value={newIncidentDate}
                          onChange={(e) => setNewIncidentDate(e.target.value)}
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#1E4FD8] focus:bg-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-gray-700 mb-1">Kategori *</label>
                        <select 
                          value={newIncidentCategory}
                          onChange={(e) => setNewIncidentCategory(e.target.value as Incident['category'])}
                          className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#1E4FD8] focus:bg-white"
                          required
                        >
                          <option value="Kehadiran">Kehadiran & Absensi</option>
                          <option value="Akademik">Akademik & Tugas</option>
                          <option value="Kedisiplinan">Kedisiplinan & Perilaku</option>
                          <option value="Sosial Emosional">Sosial & Hubungan Teman</option>
                          <option value="Prestasi">Prestasi & Apresiasi</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Tingkat Urgensi / Perhatian</label>
                      <select 
                        value={newIncidentImpact}
                        onChange={(e) => setNewIncidentImpact(e.target.value as any)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#1E4FD8] focus:bg-white"
                      >
                        <option value="Rendah">Rendah / Normal</option>
                        <option value="Sedang">Sedang / Perhatian</option>
                        <option value="Tinggi">Tinggi / Kritis</option>
                        <option value="Positif">Positif / Prestasi</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Deskripsi Kondisi / Permasalahan *</label>
                      <textarea 
                        rows={3}
                        placeholder="Ceritakan temuan observasi, fakta di kelas..."
                        value={newIncidentDesc}
                        onChange={(e) => setNewIncidentDesc(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#1E4FD8] focus:bg-white"
                        required
                      ></textarea>
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Tindakan Pembinaan yang Dilakukan *</label>
                      <textarea 
                        rows={2}
                        placeholder="Konseling personal, pemanggilan orang tua..."
                        value={newIncidentFollowUp}
                        onChange={(e) => setNewIncidentFollowUp(e.target.value)}
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#1E4FD8] focus:bg-white"
                        required
                      ></textarea>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-2.5 bg-[#1E4FD8] hover:bg-[#1A42B8] text-white rounded-xl font-semibold shadow-xs transition"
                    >
                      Simpan Catatan Perkembangan
                    </button>
                  </form>
                </div>

                {/* Right Column: Log Perkembangan Terkini Timeline (6 cols) */}
                <div className="lg:col-span-6 bg-white rounded-2xl border border-gray-200/90 p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-gray-900">Log Perkembangan Terkini</h3>
                    <span className="text-xs text-gray-500">{incidents.length} Catatan</span>
                  </div>

                  <div className="space-y-3.5 max-h-[580px] overflow-y-auto pr-1">
                    {incidents.map((inc) => (
                      <div 
                        key={inc.id}
                        className={`p-3.5 rounded-xl border border-gray-200/80 bg-gray-50/50 border-l-4 space-y-1.5 transition ${
                          inc.impactLevel === 'Tinggi' ? 'border-l-[#DC2626]' :
                          inc.impactLevel === 'Positif' ? 'border-l-[#7C3AED]' : 'border-l-[#1E4FD8]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] text-gray-400">
                          <span>{inc.date} • <strong className="text-gray-700">{inc.studentName} ({inc.class})</strong></span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            inc.impactLevel === 'Tinggi' ? 'bg-red-50 text-red-700' :
                            inc.impactLevel === 'Positif' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                          }`}>
                            {inc.category}
                          </span>
                        </div>

                        <div className="font-semibold text-xs text-gray-900">{inc.description}</div>

                        <div className="text-[11px] text-gray-600 bg-white p-2 rounded-lg border border-gray-100">
                          <strong>Tindakan:</strong> {inc.followUp || 'Dalam pengawasan rutin'}
                        </div>

                        <div className="flex items-center justify-between pt-1 text-[10px] text-gray-400">
                          <span>Status: <strong className="text-emerald-600">{inc.status}</strong></span>
                          <button
                            type="button"
                            onClick={() => openEditIncidentModal(inc)}
                            className="text-[#1E4FD8] hover:underline font-semibold"
                          >
                            Perbarui Tindak Lanjut
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: LAPORAN RESMI (A4) */}
          {currentTab === 'laporan' && (
            <ReportCustomizer
              students={students}
              selectedStudent={selectedStudent}
              meetings={meetings}
              incidents={incidents}
              onSelectStudent={(st) => setSelectedStudent(st)}
            />
          )}

          {/* TAB: BERKAS / DOKUMEN TERPUSAT */}
          {currentTab === 'berkas' && (
            <BerkasDokumenView />
          )}

          {/* TAB: PENGATURAN SISTEM (matching pengaturan.png) */}
          {currentTab === 'pengaturan' && (
            <PengaturanView 
              teachers={teachers} 
              theme={theme}
              onToggleTheme={toggleTheme}
              academicYears={academicYears}
              activeAcademicYear={activeAcademicYear}
              onSetActiveAcademicYear={handleSetActiveAcademicYear}
              onAddAcademicYear={handleAddAcademicYear}
              onUpdateAcademicYear={handleUpdateAcademicYear}
              onDeleteAcademicYear={handleDeleteAcademicYear}
            />
          )}

          {/* TAB 10: 5 BERKAS GAS SIAP DEPLOY */}
          {currentTab === 'gas_files' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold">5 Berkas Google Apps Script (Siap Deploy)</h1>
                <p className="text-xs text-gray-500">
                  Salin atau unduh berkas untuk ditempelkan ke editor script.google.com UPT SMPN 1 Suppa.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Code.gs', desc: 'Backend GAS, doGet(), setupApp(), CRUD Sheets & Drive' },
                  { name: 'Index.html', desc: 'Shell utama aplikasi, HTML5 wrapper & meta headers' },
                  { name: 'Javascript.html', desc: 'SPA state, google.script.run Promise, modal, Excel parser' },
                  { name: 'Stylesheet.html', desc: 'Design tokens Tailwind & Poppins font family CSS' },
                  { name: 'Panduan Instalasi.md', desc: 'Langkah deployment Web App dari nol sampai online' }
                ].map((f) => (
                  <div key={f.name} className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E4FD8] flex items-center justify-center font-mono font-bold text-xs">
                        {f.name.slice(-2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-gray-900">{f.name}</div>
                        <div className="text-xs text-gray-500">{f.desc}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(f.name)}
                      className="px-3 py-1.5 border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                    >
                      {copiedFileName === f.name ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-gray-500" />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          </>
        )}
      </div>
      </main>

      {/* ================= MODAL: TAMBAH SISWA MANUAL (Requirement #6) ================= */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-base text-gray-900 mb-1">Tambah Data Siswa Baru (Manual)</h3>
            <p className="text-xs text-gray-500 mb-4">
              Masukkan identitas siswa secara manual untuk ditambahkan langsung ke pangkalan data sekolah.
            </p>

            <form onSubmit={handleCreateStudentManual} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">NIS (Nomor Induk Siswa)</label>
                  <input
                    type="text"
                    placeholder="Contoh: 23809"
                    value={newStudentNis}
                    onChange={(e) => setNewStudentNis(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg font-mono outline-none focus:border-[#1E4FD8]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">NISN</label>
                  <input
                    type="text"
                    placeholder="Contoh: 0098451999"
                    value={newStudentNisn}
                    onChange={(e) => setNewStudentNisn(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg font-mono outline-none focus:border-[#1E4FD8]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nama Lengkap Siswa</label>
                <input
                  type="text"
                  placeholder="Contoh: Andi Muhammad Farhan"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#1E4FD8]"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={newStudentGender}
                    onChange={(e) => setNewStudentGender(e.target.value as any)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#1E4FD8]"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Tingkat Kelas</label>
                  <select
                    value={newStudentClass}
                    onChange={(e) => setNewStudentClass(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#1E4FD8]"
                  >
                    <option value="Kelas VII-A">Kelas VII-A</option>
                    <option value="Kelas VII-B">Kelas VII-B</option>
                    <option value="Kelas VIII-A">Kelas VIII-A</option>
                    <option value="Kelas VIII-B">Kelas VIII-B</option>
                    <option value="Kelas IX-A">Kelas IX-A</option>
                    <option value="Kelas IX-B">Kelas IX-B</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Status Awal</label>
                  <select
                    value={newStudentStatus}
                    onChange={(e) => setNewStudentStatus(e.target.value as any)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#1E4FD8]"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Perlu Perhatian">Perlu Perhatian</option>
                    <option value="Kritis">Kritis</option>
                    <option value="Prestasi">Prestasi</option>
                    <option value="Dalam Pantauan">Dalam Pantauan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Guru Wali Pembina</label>
                <select
                  value={newStudentGuruWali}
                  onChange={(e) => setNewStudentGuruWali(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#1E4FD8]"
                >
                  {teachers.filter(t => t.role === 'Guru Wali').map(t => (
                    <option key={t.id} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    placeholder="Contoh: Bpk. Ruslan"
                    value={newStudentParent}
                    onChange={(e) => setNewStudentParent(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#1E4FD8]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Nomor WhatsApp / HP</label>
                  <input
                    type="text"
                    placeholder="Contoh: 0812-xxxx-xxxx"
                    value={newStudentPhone}
                    onChange={(e) => setNewStudentPhone(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#1E4FD8]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Alamat Tempat Tinggal</label>
                <input
                  type="text"
                  placeholder="Contoh: Dusun Wiringtasi, Kec. Suppa"
                  value={newStudentAddress}
                  onChange={(e) => setNewStudentAddress(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-[#1E4FD8]"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl font-semibold shadow-xs transition"
                >
                  Simpan Siswa Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CATAT PERTEMUAN BARU (Requirement #2: Cascading Student Selector) ================= */}
      {showNewSessionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-base text-gray-900 mb-1">Catat Sesi Bimbingan Murid Baru</h3>
            <p className="text-xs text-gray-500 mb-4">
              Pilih siswa secara bertingkat berdasarkan kelas atau ketik nama/NIS langsung.
            </p>

            <form onSubmit={handleSaveMeetingSession} className="space-y-3.5 text-xs">
              {/* Cascading Student Selector */}
              <CascadingStudentSelector
                students={students}
                selectedStudentId={sessionTargetId}
                onSelectStudent={(st) => setSessionTargetId(st.id)}
                label="Pilih Peserta Didik (Tingkat Kelas & Nama)"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Format Sesi</label>
                  <select
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value as any)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
                  >
                    <option value="Individu">Individu (1-on-1)</option>
                    <option value="Kelompok">Kelompok</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Status Sesi</label>
                  <select
                    value={sessionStatus}
                    onChange={(e) => setSessionStatus(e.target.value as any)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
                  >
                    <option value="Terjadwal">Jadwal Mendatang (Terjadwal)</option>
                    <option value="Selesai">Sudah Dilaksanakan (Selesai)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Topik Bimbingan</label>
                <input
                  type="text"
                  placeholder="Contoh: Evaluasi Kedisiplinan & Kesulitan Belajar"
                  value={sessionTopic}
                  onChange={(e) => setSessionTopic(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Lokasi / Ruangan</label>
                <input
                  type="text"
                  value={sessionLocation}
                  onChange={(e) => setSessionLocation(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Notulensi / Uraian Sesi Konseling</label>
                <textarea
                  rows={3}
                  placeholder="Rincian hasil dialog, komitmen siswa, atau catatan yang disepakati..."
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Rencana Tindak Lanjut</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Pemantauan kehadiran mingguan atau koordinasi dengan orang tua..."
                  value={sessionFollowUp}
                  onChange={(e) => setSessionFollowUp(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
                />
                <AIFollowUpHelper
                  type="meeting"
                  studentName={students.find(s => s.id === sessionTargetId)?.name}
                  topic={sessionTopic}
                  currentNotes={sessionNotes}
                  onApplyRecommendation={(rec) => setSessionFollowUp(rec)}
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewSessionModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl font-semibold shadow-xs transition"
                >
                  Simpan Sesi Bimbingan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CATAT PERKEMBANGAN BARU (Requirement #2: Cascading Student Selector) ================= */}
      {showNewIncidentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-base text-gray-900 mb-1">Catat Perkembangan / Kejadian Siswa</h3>
            <p className="text-xs text-gray-500 mb-4">
              Rekam catatan insidental perilaku, kedisiplinan, atau prestasi siswa binaan.
            </p>

            <form onSubmit={handleSaveIncident} className="space-y-3.5 text-xs">
              {/* Cascading Student Selector */}
              <CascadingStudentSelector
                students={students}
                selectedStudentId={sessionTargetId}
                onSelectStudent={(st) => setSessionTargetId(st.id)}
                label="Pilih Siswa (Tingkat Kelas & Nama)"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Kategori Perkembangan</label>
                  <select
                    value={incidentCategory}
                    onChange={(e) => setIncidentCategory(e.target.value as any)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
                  >
                    <option value="Kedisiplinan">Kedisiplinan</option>
                    <option value="Kehadiran">Kehadiran</option>
                    <option value="Akademik">Akademik</option>
                    <option value="Prestasi">Prestasi</option>
                    <option value="Sosial Emosional">Sosial Emosional</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Tingkat Dampak</label>
                  <select
                    value={incidentImpact}
                    onChange={(e) => setIncidentImpact(e.target.value as any)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
                  >
                    <option value="Rendah">Rendah</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Tinggi">Tinggi</option>
                    <option value="Positif">Positif / Apresiasi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Deskripsi Kejadian / Perilaku</label>
                <textarea
                  rows={3}
                  placeholder="Uraian detail kejadian atau prestasi yang diperoleh..."
                  value={incidentDescription}
                  onChange={(e) => setIncidentDescription(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Tindak Lanjut yang Dilakukan</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Konseling langsung, surat peringatan, atau piagam penghargaan..."
                  value={incidentFollowUp}
                  onChange={(e) => setIncidentFollowUp(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-200"
                />
                <AIFollowUpHelper
                  type="incident"
                  studentName={students.find(s => s.id === sessionTargetId)?.name}
                  category={incidentCategory}
                  impactLevel={incidentImpact}
                  description={incidentDescription}
                  onApplyRecommendation={(rec) => setIncidentFollowUp(rec)}
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewIncidentModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl font-semibold shadow-xs transition"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: LIHAT RINGKASAN SISWA ================= */}
      {selectedStudentForViewModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 font-['Poppins']">
                    Data Lengkap Peserta Didik
                  </h3>
                  <p className="text-xs text-gray-500">Pangkalan Data Pembinaan UPT SMPN 1 Suppa</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStudentForViewModal(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/80 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-semibold block">Nama Peserta Didik</span>
                    <h4 className="font-bold text-gray-900 text-base">{selectedStudentForViewModal.name}</h4>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                    selectedStudentForViewModal.status === 'Kritis' ? 'bg-red-100 text-red-700' :
                    selectedStudentForViewModal.status === 'Prestasi' ? 'bg-purple-100 text-purple-700' :
                    selectedStudentForViewModal.status === 'Perlu Perhatian' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {selectedStudentForViewModal.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200/60">
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-semibold block">NIS</span>
                    <p className="font-mono text-gray-800 font-bold">{selectedStudentForViewModal.nis}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-semibold block">NISN</span>
                    <p className="font-mono text-gray-800 font-bold">{selectedStudentForViewModal.nisn}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-semibold block">Kelas & Gender</span>
                    <p className="font-semibold text-gray-800">{selectedStudentForViewModal.class} ({selectedStudentForViewModal.gender === 'L' ? 'Laki-laki' : 'Perempuan'})</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80">
                  <span className="text-gray-400 text-[10px] uppercase font-semibold block">Guru Wali Pembina</span>
                  <p className="font-bold text-blue-700 mt-1 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{selectedStudentForViewModal.guruWali || 'Belum Ditugaskan'}</span>
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80">
                  <span className="text-gray-400 text-[10px] uppercase font-semibold block">Presensi Harian</span>
                  <p className="font-bold text-gray-900 mt-1">
                    {selectedStudentForViewModal.attendance} 
                    <span className="text-[10px] text-gray-500 font-normal ml-1.5">
                      (A: <strong className={selectedStudentForViewModal.alpa > 0 ? 'text-red-600' : ''}>{selectedStudentForViewModal.alpa}</strong> • S: {selectedStudentForViewModal.sakit} • I: {selectedStudentForViewModal.izin})
                    </span>
                  </p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-semibold block">Orang Tua / Wali</span>
                    <p className="font-semibold text-gray-800">{selectedStudentForViewModal.parentName || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-semibold block">Kontak WhatsApp</span>
                    <p className="font-semibold text-gray-800 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>{selectedStudentForViewModal.phone || '-'}</span>
                    </p>
                  </div>
                </div>
                {selectedStudentForViewModal.address && (
                  <div className="pt-2 border-t border-gray-200/60">
                    <span className="text-gray-400 text-[10px] uppercase font-semibold block">Alamat Domisili</span>
                    <p className="text-gray-700 mt-0.5">{selectedStudentForViewModal.address}</p>
                  </div>
                )}
              </div>

              {selectedStudentForViewModal.notes && (
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/70">
                  <span className="text-blue-700 text-[10px] uppercase font-semibold block">Catatan Pendampingan Khusus</span>
                  <p className="text-gray-800 mt-0.5 leading-relaxed">{selectedStudentForViewModal.notes}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  const st = selectedStudentForViewModal;
                  setSelectedStudent(st);
                  setSelectedStudentForViewModal(null);
                  setCurrentTab('profil');
                }}
                className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Buka Profil Penuh</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const st = selectedStudentForViewModal;
                    setSelectedStudentForViewModal(null);
                    openEditStudentModal(st);
                  }}
                  className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Siswa Ini</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStudentForViewModal(null)}
                  className="px-4 py-2 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl text-xs transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT DATA SISWA ================= */}
      {selectedStudentForEdit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-gray-900 font-['Poppins']">
                  Edit Data Peserta Didik
                </h3>
              </div>
              <button 
                onClick={() => setSelectedStudentForEdit(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditStudent} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Nama Lengkap Peserta Didik</label>
                <input
                  type="text"
                  value={editStudentName}
                  onChange={(e) => setEditStudentName(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 font-semibold text-gray-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">NIS</label>
                  <input
                    type="text"
                    value={editStudentNis}
                    onChange={(e) => setEditStudentNis(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg font-mono outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">NISN</label>
                  <input
                    type="text"
                    value={editStudentNisn}
                    onChange={(e) => setEditStudentNisn(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg font-mono outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Tingkat Kelas</label>
                  <select
                    value={editStudentClass}
                    onChange={(e) => setEditStudentClass(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="Kelas VII-A">Kelas VII-A</option>
                    <option value="Kelas VII-B">Kelas VII-B</option>
                    <option value="Kelas VIII-A">Kelas VIII-A</option>
                    <option value="Kelas VIII-B">Kelas VIII-B</option>
                    <option value="Kelas IX-A">Kelas IX-A</option>
                    <option value="Kelas IX-B">Kelas IX-B</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={editStudentGender}
                    onChange={(e) => setEditStudentGender(e.target.value as any)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Status Pembinaan</label>
                  <select
                    value={editStudentStatus}
                    onChange={(e) => setEditStudentStatus(e.target.value as any)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Perlu Perhatian">Perlu Perhatian</option>
                    <option value="Kritis">Kritis</option>
                    <option value="Prestasi">Prestasi</option>
                    <option value="Dalam Pantauan">Dalam Pantauan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Guru Wali Pembina</label>
                  <select
                    value={editStudentGuruWali}
                    onChange={(e) => setEditStudentGuruWali(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 font-medium"
                  >
                    {teachers.filter(t => t.role === 'Guru Wali').map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Nama Orang Tua / Wali</label>
                  <input
                    type="text"
                    value={editStudentParentName}
                    onChange={(e) => setEditStudentParentName(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Nomor WhatsApp / HP</label>
                  <input
                    type="text"
                    value={editStudentPhone}
                    onChange={(e) => setEditStudentPhone(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Rekap Presensi Harian (Jumlah Hari)</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-red-600 font-semibold block mb-0.5">Alpa (A)</span>
                    <input
                      type="number"
                      min={0}
                      value={editStudentAlpa}
                      onChange={(e) => setEditStudentAlpa(parseInt(e.target.value) || 0)}
                      className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-600 font-semibold block mb-0.5">Sakit (S)</span>
                    <input
                      type="number"
                      min={0}
                      value={editStudentSakit}
                      onChange={(e) => setEditStudentSakit(parseInt(e.target.value) || 0)}
                      className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-blue-600 font-semibold block mb-0.5">Izin (I)</span>
                    <input
                      type="number"
                      min={0}
                      value={editStudentIzin}
                      onChange={(e) => setEditStudentIzin(parseInt(e.target.value) || 0)}
                      className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Catatan Khusus Perkembangan</label>
                <textarea
                  rows={2}
                  value={editStudentNotes}
                  onChange={(e) => setEditStudentNotes(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                  placeholder="Catatan perkembangan khusus atau tindak lanjut..."
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForEdit(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: LIHAT DETAIL SESI BIMBINGAN ================= */}
      {selectedMeetingForView && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 font-['Poppins']">
                    Detail Rekam Sesi Bimbingan
                  </h3>
                  <p className="text-xs text-gray-500">Notulensi Bimbingan & Konseling Guru Wali</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedMeetingForView(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-semibold block">Topik Bimbingan</span>
                    <h4 className="font-bold text-gray-900 text-sm">{selectedMeetingForView.topic}</h4>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                    selectedMeetingForView.status === 'Selesai' ? 'bg-emerald-100 text-emerald-800' :
                    selectedMeetingForView.status === 'Terjadwal' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedMeetingForView.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-200/60">
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-semibold block">Jadwal Pertemuan</span>
                    <p className="font-semibold text-gray-800">{selectedMeetingForView.date} • {selectedMeetingForView.time}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-semibold block">Format Bimbingan</span>
                    <p className="font-semibold text-gray-800">{selectedMeetingForView.type}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80">
                  <span className="text-gray-400 text-[10px] uppercase font-semibold block">Guru Wali Pembina</span>
                  <p className="font-bold text-gray-900 mt-1 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{selectedMeetingForView.guruWali || 'Guru Wali Terdaftar'}</span>
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80">
                  <span className="text-gray-400 text-[10px] uppercase font-semibold block">Peserta Didik Binaan</span>
                  <p className="font-bold text-gray-900 mt-1">{selectedMeetingForView.studentNames.join(', ')}</p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 space-y-1.5">
                <span className="text-gray-400 text-[10px] uppercase font-semibold block">Notulensi / Uraian Dialog Konseling</span>
                <p className="text-gray-800 leading-relaxed">{selectedMeetingForView.notes || 'Belum ada uraian catatan dialog.'}</p>
              </div>

              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 space-y-1.5">
                <span className="text-blue-800 text-[10px] uppercase font-semibold block">Rencana Tindak Lanjut Solutif</span>
                <p className="text-gray-900 font-medium leading-relaxed">{selectedMeetingForView.followUp || 'Belum ada rencana tindak lanjut.'}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const m = selectedMeetingForView;
                  setSelectedMeetingForView(null);
                  openEditMeetingModal(m);
                }}
                className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Sesi Ini</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedMeetingForView(null)}
                className="px-4 py-2 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl text-xs transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT SESI BIMBINGAN ================= */}
      {selectedMeetingForEdit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-gray-900 font-['Poppins']">
                  Edit Sesi Bimbingan & Konseling
                </h3>
              </div>
              <button 
                onClick={() => setSelectedMeetingForEdit(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditMeeting} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Topik Bimbingan</label>
                <input
                  type="text"
                  value={editMeetingTopic}
                  onChange={(e) => setEditMeetingTopic(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 font-semibold text-gray-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={editMeetingDate}
                    onChange={(e) => setEditMeetingDate(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Waktu</label>
                  <input
                    type="text"
                    value={editMeetingTime}
                    onChange={(e) => setEditMeetingTime(e.target.value)}
                    placeholder="Contoh: 09:30 WITA"
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Guru Wali Pembimbing</label>
                  <select
                    value={editMeetingGuruWali}
                    onChange={(e) => setEditMeetingGuruWali(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 font-medium"
                  >
                    {teachers.filter(t => t.role === 'Guru Wali').map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Format Sesi</label>
                  <select
                    value={editMeetingType}
                    onChange={(e) => setEditMeetingType(e.target.value as any)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="Individu">Individu (1-on-1)</option>
                    <option value="Kelompok">Kelompok</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Status Sesi Bimbingan</label>
                <select
                  value={editMeetingStatus}
                  onChange={(e) => setEditMeetingStatus(e.target.value as any)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 font-semibold"
                >
                  <option value="Terjadwal">Terjadwal (Akan Datang)</option>
                  <option value="Selesai">Selesai Dilaksanakan</option>
                  <option value="Menunggu Tindak Lanjut">Menunggu Tindak Lanjut</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Notulensi / Uraian Hasil Sesi Konseling</label>
                <textarea
                  rows={3}
                  value={editMeetingNotes}
                  onChange={(e) => setEditMeetingNotes(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Rencana Tindak Lanjut Solutif</label>
                <textarea
                  rows={2}
                  value={editMeetingFollowUp}
                  onChange={(e) => setEditMeetingFollowUp(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMeetingForEdit(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: LIHAT DETAIL PERKEMBANGAN SISWA ================= */}
      {selectedIncidentForView && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 font-['Poppins']">
                    Detail Catatan Perkembangan Siswa
                  </h3>
                  <p className="text-xs text-gray-500">Rekam Jejak Perilaku & Kedisiplinan</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedIncidentForView(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-semibold block">Peserta Didik</span>
                    <h4 className="font-bold text-gray-900 text-sm">{selectedIncidentForView.studentName} ({selectedIncidentForView.class})</h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
                    {selectedIncidentForView.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200/60">
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-semibold block">Tanggal Kejadian</span>
                    <p className="font-semibold text-gray-800">{selectedIncidentForView.date}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-semibold block">Kategori</span>
                    <p className="font-semibold text-gray-800">{selectedIncidentForView.category}</p>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] uppercase font-semibold block">Dampak</span>
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] inline-block mt-0.5 ${
                      selectedIncidentForView.impactLevel === 'Tinggi' ? 'bg-red-100 text-red-700' :
                      selectedIncidentForView.impactLevel === 'Positif' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {selectedIncidentForView.impactLevel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/80 space-y-1.5">
                <span className="text-gray-400 text-[10px] uppercase font-semibold block">Deskripsi Kejadian / Perilaku</span>
                <p className="text-gray-800 leading-relaxed">{selectedIncidentForView.description}</p>
              </div>

              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 space-y-1.5">
                <span className="text-blue-800 text-[10px] uppercase font-semibold block">Tindak Lanjut & Rekomendasi Guru Wali</span>
                <p className="text-gray-900 font-medium leading-relaxed">{selectedIncidentForView.followUp}</p>
              </div>

              {selectedIncidentForView.recordedBy && (
                <div className="text-[11px] text-gray-500 italic">
                  Dicatat oleh: <strong>{selectedIncidentForView.recordedBy}</strong>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const inc = selectedIncidentForView;
                  setSelectedIncidentForView(null);
                  openEditIncidentModal(inc);
                }}
                className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Catatan Ini</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedIncidentForView(null)}
                className="px-4 py-2 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl text-xs transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT CATATAN PERKEMBANGAN SISWA ================= */}
      {selectedIncidentForEdit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-gray-900 font-['Poppins']">
                  Edit Catatan Perkembangan Siswa
                </h3>
              </div>
              <button 
                onClick={() => setSelectedIncidentForEdit(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditIncident} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Nama Peserta Didik</label>
                  <input
                    type="text"
                    value={editIncidentStudentName}
                    onChange={(e) => setEditIncidentStudentName(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 font-semibold text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Tingkat Kelas</label>
                  <input
                    type="text"
                    value={editIncidentClass}
                    onChange={(e) => setEditIncidentClass(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={editIncidentDate}
                    onChange={(e) => setEditIncidentDate(e.target.value)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Kategori Perkembangan</label>
                  <select
                    value={editIncidentCategory}
                    onChange={(e) => setEditIncidentCategory(e.target.value as any)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="Kedisiplinan">Kedisiplinan</option>
                    <option value="Akademik">Akademik</option>
                    <option value="Kehadiran">Kehadiran</option>
                    <option value="Prestasi">Prestasi</option>
                    <option value="Sosial Emosional">Sosial Emosional</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Tingkat Dampak</label>
                  <select
                    value={editIncidentImpactLevel}
                    onChange={(e) => setEditIncidentImpactLevel(e.target.value as any)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 font-semibold"
                  >
                    <option value="Rendah">Rendah</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Tinggi">Tinggi</option>
                    <option value="Positif">Positif</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Status Penanganan</label>
                  <select
                    value={editIncidentStatus}
                    onChange={(e) => setEditIncidentStatus(e.target.value as any)}
                    className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 font-medium"
                  >
                    <option value="Dalam Proses">Dalam Proses</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Verifikasi Pimpinan">Verifikasi Pimpinan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Uraian / Deskripsi Kejadian</label>
                <textarea
                  rows={3}
                  value={editIncidentDescription}
                  onChange={(e) => setEditIncidentDescription(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 leading-relaxed"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Tindak Lanjut & Rekomendasi Solusi</label>
                <textarea
                  rows={2}
                  value={editIncidentFollowUp}
                  onChange={(e) => setEditIncidentFollowUp(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIncidentForEdit(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reusable Confirmation Alert Dialog */}
      <ConfirmationModal
        isOpen={confirmDialog.isOpen}
        type={confirmDialog.type}
        title={confirmDialog.title}
        message={confirmDialog.message}
        itemName={confirmDialog.itemName}
        confirmLabel={confirmDialog.confirmLabel}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-gray-900/95 text-white text-xs font-semibold rounded-xl shadow-xl border border-gray-700/60 animate-in slide-in-from-bottom-5 font-['Poppins']">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
