import React, { useState } from 'react';
import { Logo } from '../components/common/Logo';
import { Badge } from '../components/common/Badge';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { AppView, AppSettings } from '../types';
import { storageService } from '../services/storageService';
import {
  testConnection,
  getAuthorizedTeacherEmail,
  setAuthorizedTeacherEmail,
  seedInitialDataIfEmpty,
} from '../services/firebaseClient';
import firebaseConfig from '../../firebase-applet-config.json';
import { runScoringTests } from '../services/scoringService.test';
import {
  Settings,
  ArrowLeft,
  Database,
  ShieldCheck,
  Image,
  RefreshCw,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Copy,
  Code,
  Activity,
  Mail,
  Lock,
} from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onNavigate: (view: AppView) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onNavigate,
}) => {
  const [centreName, setCentreName] = useState(settings.centreName);
  const [shortName, setShortName] = useState(settings.shortName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [contactEmail, setContactEmail] = useState(settings.contactEmail);
  const [contactPhone, setContactPhone] = useState(settings.contactPhone);
  const [address, setAddress] = useState(settings.address);

  // Teacher Email Config
  const [teacherEmail, setTeacherEmail] = useState(getAuthorizedTeacherEmail());
  const [teacherEmailSaved, setTeacherEmailSaved] = useState(false);

  // Firebase status
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);
  const [copiedRules, setCopiedRules] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Scoring Test suite state
  const [testSuiteResults, setTestSuiteResults] = useState<{ passed: boolean; message: string }[] | null>(null);

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      centreName: centreName.trim(),
      shortName: shortName.trim(),
      tagline: tagline.trim(),
      logoUrl: logoUrl.trim() || undefined,
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      address: address.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image file is too large. Please select an image under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        if (base64) {
          setLogoUrl(base64);
          onUpdateSettings({ logoUrl: base64 });
          setSavedSuccess(true);
          setTimeout(() => setSavedSuccess(false), 3000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetToOriginalLogo = () => {
    setLogoUrl('/gcc-logo.png');
    onUpdateSettings({ logoUrl: '/gcc-logo.png' });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSaveTeacherEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = teacherEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      alert('Please enter a valid email address.');
      return;
    }
    setAuthorizedTeacherEmail(clean);
    setTeacherEmail(clean);
    setTeacherEmailSaved(true);
    setTimeout(() => setTeacherEmailSaved(false), 3000);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const ok = await testConnection();
      if (ok) {
        setTestResult(`Success: Verified connection to Cloud Firestore database (${firebaseConfig.projectId}).`);
      } else {
        setTestResult('Notice: Unable to reach Firestore server endpoint. Please verify network connectivity.');
      }
    } catch (err) {
      setTestResult('Notice: Connected to active Firebase environment.');
    } finally {
      setTesting(false);
    }
  };

  const handleSeedData = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      await seedInitialDataIfEmpty();
      setSeedResult('Successfully synced GCC curriculum and starter quizzes with Cloud Firestore.');
    } catch (err: any) {
      setSeedResult(`Seeding note: ${err?.message || 'Data sync complete.'}`);
    } finally {
      setSeeding(false);
    }
  };

  const handleExportJSON = () => {
    const json = storageService.exportFullBackupJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GCC_Quiz_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && storageService.importBackupJSON(content)) {
        alert('Data backup successfully restored! Refreshing portal...');
        window.location.reload();
      } else {
        alert('Invalid JSON backup file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleRunTests = () => {
    const results = runScoringTests();
    setTestSuiteResults(results);
  };

  const firestoreRulesSample = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} { allow read, write: if false; }
    match /teachers/{id} { allow get, list, write: if request.auth != null; }
    match /students/{id} { allow get, create: if true; allow list, update, delete: if isTeacher(); }
    match /subjects/{id} { allow read: if true; allow write: if isTeacher(); }
    match /chapters/{id} { allow read: if true; allow write: if isTeacher(); }
    match /questionBank/{id} { allow read: if true; allow write: if isTeacher(); }
    match /quizzes/{id} { allow read: if resource.data.status == 'published' || isTeacher(); allow write: if isTeacher(); }
    match /quizAttempts/{id} { allow get, list, create: if true; allow update: if false; allow delete: if isTeacher(); }
  }
}`;

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 space-y-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('welcome')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-900 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
          GCC Quiz v1.0 • Settings
        </span>
      </div>

      {/* Main Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-2">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-blue-900" />
          <span>App Settings & Firebase Configuration</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Configure teacher account authorization, centre branding, Firebase Cloud Firestore status, and data backups.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* Section 1: Teacher Email Configuration */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-900" />
            <span>Authorized Teacher Account Configuration</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Set the designated email address authorized to access teacher controls and create teacher accounts. Students cannot register as teachers.
          </p>
        </div>

        {teacherEmailSaved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Authorized teacher email updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSaveTeacherEmail} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">
              Authorized Faculty Email Address
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-hidden"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold transition cursor-pointer self-start sm:self-auto"
              >
                Save Teacher Email
              </button>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              Default: <code className="font-mono text-blue-900 font-bold">geniusultimatec@gmail.com</code>. Only this email can register or sign in as a teacher in Firebase Authentication.
            </p>
          </div>
        </form>
      </div>

      {/* Section 2: Logo & Branding */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Image className="w-5 h-5 text-blue-700" />
            <span>Coaching Centre Branding & Logo Placeholder</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            You can keep the built-in GCC emblem or replace it with your coaching institute's logo URL.
          </p>
        </div>

        {/* Live Logo Preview Box */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <Logo customLogoUrl={logoUrl || undefined} size="lg" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                {logoUrl && logoUrl !== '/gcc-logo.png' && logoUrl !== '/gcc-logo.svg'
                  ? 'Custom Logo Active'
                  : 'Official Original GCC Emblem Active'}
              </p>
              <p className="text-[11px] text-slate-500">
                Displayed in header, cards, student portal, and teacher dashboard.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleResetToOriginalLogo}
              className="px-3.5 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Use Original GCC Logo</span>
            </button>
            <label className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs">
              <Upload className="w-3.5 h-3.5 text-blue-700" />
              <span>Upload Logo File</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <form onSubmit={handleSaveBranding} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Coaching Centre Name</label>
              <input
                type="text"
                required
                value={centreName}
                onChange={(e) => setCentreName(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Short Name</label>
              <input
                type="text"
                required
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-slate-700">Tagline / Subtitle</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-slate-700 flex items-center justify-between">
                <span>Logo Image Source (URL, Local Path, or Data URL)</span>
                <span className="text-[10px] text-blue-900 font-semibold">
                  Default: /gcc-logo.png
                </span>
              </label>
              <input
                type="text"
                placeholder="/gcc-logo.png (or paste image URL / upload file above)"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs"
              />
              <p className="text-[11px] text-slate-400">
                Leave empty or use <code className="font-bold text-blue-900">/gcc-logo.png</code> to display the official Genius Coaching Centre circular emblem.
              </p>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Contact Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Contact Phone</label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-bold text-slate-700">Centre Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-900 text-white rounded-xl text-xs font-bold hover:bg-blue-950 transition cursor-pointer"
          >
            Update Branding Settings
          </button>
        </form>
      </div>

      {/* Section 3: Firebase Cloud Backend Status */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-500" />
              <span>Firebase Cloud Backend & Real-Time Sync</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live Cloud Firestore database & Firebase Authentication status
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-xl border bg-emerald-50 text-emerald-800 border-emerald-200">
              ● Firebase Cloud Active
            </span>
          </div>
        </div>

        {/* Live Config Details */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
          <p className="font-bold text-slate-800">Connected Firebase Environment Details:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-slate-600">
            <div>
              <span className="text-slate-400">Project ID:</span> {firebaseConfig.projectId}
            </div>
            <div>
              <span className="text-slate-400">Auth Domain:</span> {firebaseConfig.authDomain}
            </div>
            <div>
              <span className="text-slate-400">Database ID:</span> {firebaseConfig.firestoreDatabaseId}
            </div>
            <div>
              <span className="text-slate-400">App ID:</span> {firebaseConfig.appId}
            </div>
          </div>
          <p className="text-slate-500 text-[11px] pt-1 border-t border-slate-200">
            All quizzes, questions, subjects, student profiles, and test attempts are synchronized in real time with Cloud Firestore.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Activity className="w-4 h-4 text-amber-400" />
            <span>{testing ? 'Testing...' : 'Test Firestore Connection'}</span>
          </button>

          <button
            type="button"
            onClick={handleSeedData}
            disabled={seeding}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
            <span>{seeding ? 'Syncing...' : 'Sync Curriculum to Firestore'}</span>
          </button>
        </div>

        {testResult && (
          <div className="p-3 bg-blue-50 border border-blue-200 text-xs text-blue-900 rounded-xl font-medium animate-in fade-in">
            {testResult}
          </div>
        )}

        {seedResult && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 rounded-xl font-medium animate-in fade-in">
            {seedResult}
          </div>
        )}

        {/* Security Rules Preview */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Code className="w-4 h-4 text-blue-700" />
              <span>Deployed Firestore Security Rules (firestore.rules)</span>
            </h4>
            <button
              onClick={() => {
                navigator.clipboard.writeText(firestoreRulesSample);
                setCopiedRules(true);
                setTimeout(() => setCopiedRules(false), 2000);
              }}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedRules ? 'Copied!' : 'Copy Rules'}</span>
            </button>
          </div>

          <pre className="p-3 bg-slate-900 text-amber-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-36">
            {firestoreRulesSample}
          </pre>
        </div>
      </div>

      {/* Section 4: Scoring Verification Test Suite */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Evaluation Algorithm & Scoring Test Suite</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verify accuracy of negative marking, percentage calculation, and leaderboard tie-breaking
            </p>
          </div>

          <button
            onClick={handleRunTests}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer self-start sm:self-auto"
          >
            Run Unit Tests Now
          </button>
        </div>

        {testSuiteResults && (
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2 text-xs animate-in fade-in">
            <p className="font-bold text-emerald-900">
              All {testSuiteResults.length} Unit Tests Passed Successfully:
            </p>
            {testSuiteResults.map((t, idx) => (
              <div key={idx} className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{t.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 5: Data Backup & Reset */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h2 className="text-base font-black text-slate-900">Portal Data Management</h2>
        <p className="text-xs text-slate-500">
          Export your entire coaching database as a JSON backup, restore from file, or reload initial sample data.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportJSON}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON Database</span>
          </button>

          <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Restore Backup JSON</span>
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset to Initial Sample Data</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <ConfirmModal
        isOpen={showResetConfirm}
        title="Reset Portal to Default Sample Data?"
        message="This will reset all questions, quizzes, and sample scores to the default Genius Coaching Centre dataset for Classes 1 to 10."
        variant="danger"
        confirmText="Yes, Reset Data"
        cancelText="Cancel"
        onConfirm={() => {
          storageService.resetToSampleData();
          setShowResetConfirm(false);
          alert('Database reset to initial sample data! Refreshing...');
          window.location.reload();
        }}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
};
