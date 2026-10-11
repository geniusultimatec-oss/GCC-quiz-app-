import React, { useState } from 'react';
import { Badge } from '../components/common/Badge';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { AppView, Subject, Chapter } from '../types';
import { storageService } from '../services/storageService';
import {
  Layers,
  ArrowLeft,
  PlusCircle,
  BookOpen,
  FolderPlus,
  Trash2,
  Edit3,
  CheckCircle2,
  ListPlus,
  Sparkles,
} from 'lucide-react';

interface ClassSubjectManagementViewProps {
  subjects: Subject[];
  chapters: Chapter[];
  onNavigate: (view: AppView) => void;
  onRefresh: () => void;
}

export const ClassSubjectManagementView: React.FC<ClassSubjectManagementViewProps> = ({
  subjects,
  chapters,
  onNavigate,
  onRefresh,
}) => {
  const [activeClass, setActiveClass] = useState<number>(10);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [activeSubjectForChapter, setActiveSubjectForChapter] = useState<Subject | null>(null);

  // Subject Form
  const [subName, setSubName] = useState('');
  const [subDesc, setSubDesc] = useState('');
  const [subClasses, setSubClasses] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

  // Chapter Form
  const [chapTitle, setChapTitle] = useState('');
  const [chapTopics, setChapTopics] = useState('');

  // Delete target
  const [deleteSubjectId, setDeleteSubjectId] = useState<string | null>(null);
  const [deleteChapterId, setDeleteChapterId] = useState<string | null>(null);

  const classSubjects = subjects.filter((s) => s.applicableClasses.includes(activeClass));

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subName.trim()) return;

    const newSub: Subject = {
      id: `sub-${Date.now()}`,
      name: subName.trim(),
      applicableClasses: subClasses.length > 0 ? subClasses : [activeClass],
      description: subDesc.trim(),
      color: '#2563EB',
    };

    storageService.saveSubject(newSub);
    setShowSubjectModal(false);
    setSubName('');
    setSubDesc('');
    onRefresh();
  };

  const handleCreateChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapTitle.trim() || !activeSubjectForChapter) return;

    const topicList = chapTopics
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const newChap: Chapter = {
      id: `ch-${Date.now()}`,
      subjectId: activeSubjectForChapter.id,
      classId: activeClass,
      title: chapTitle.trim(),
      order: chapters.length + 1,
      topics: topicList,
    };

    storageService.saveChapter(newChap);
    setShowChapterModal(false);
    setChapTitle('');
    setChapTopics('');
    onRefresh();
  };

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-10 space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('teacher-dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-900 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Teacher Dashboard</span>
        </button>

        <button
          onClick={() => setShowSubjectModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-900 to-indigo-900 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-amber-400" />
          <span>+ Add New Subject</span>
        </button>
      </div>

      {/* Header Card with Class Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-blue-900" />
            <span>Class & Subject Syllabus Manager</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Flexible curriculum structure for Classes 1 to 10 (CBSE, ICSE & State Board compatible)
          </p>
        </div>

        {/* Class Level Selector Tabs */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
            Select Class to Manage Curriculum:
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((cls) => {
              const isSelected = activeClass === cls;
              return (
                <button
                  key={cls}
                  onClick={() => setActiveClass(cls)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 border ${
                    isSelected
                      ? 'bg-blue-900 text-white border-blue-900 shadow-md'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Class {cls}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Subjects & Chapters for Active Class */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900">
            Subjects for Class {activeClass} ({classSubjects.length})
          </h3>
        </div>

        {classSubjects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No subjects assigned to Class {activeClass}</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add a new subject using the button above and select Class {activeClass}.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {classSubjects.map((sub) => {
              const subChapters = chapters.filter(
                (c) => c.subjectId === sub.id && c.classId === activeClass
              );

              return (
                <div
                  key={sub.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4"
                >
                  {/* Subject Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-700"></span>
                        <h4 className="text-base font-black text-slate-900">{sub.name}</h4>
                        <Badge variant="blue" size="sm">
                          Class {activeClass}
                        </Badge>
                      </div>
                      {sub.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{sub.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveSubjectForChapter(sub);
                          setShowChapterModal(true);
                        }}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold rounded-xl border border-blue-200 flex items-center gap-1 cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Add Chapter</span>
                      </button>

                      <button
                        onClick={() => setDeleteSubjectId(sub.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Chapters List */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Chapters & Topics ({subChapters.length}):
                    </p>

                    {subChapters.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">
                        No chapters added yet for Class {activeClass}. Click "+ Add Chapter" to add the syllabus.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {subChapters.map((chap, cIdx) => (
                          <div
                            key={chap.id}
                            className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 flex flex-col justify-between"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-bold text-slate-900">
                                {cIdx + 1}. {chap.title}
                              </span>
                              <button
                                onClick={() => setDeleteChapterId(chap.id)}
                                className="text-slate-400 hover:text-rose-600 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {chap.topics && chap.topics.length > 0 && (
                              <div className="flex flex-wrap items-center gap-1">
                                {chap.topics.map((t, tIdx) => (
                                  <span
                                    key={tIdx}
                                    className="text-[10px] font-medium bg-white text-slate-600 px-2 py-0.5 rounded-md border border-slate-200"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Subject Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900">Add New Academic Subject</h3>

            <form onSubmit={handleCreateSubject} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science, Sanskrit, Coding"
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Description</label>
                <input
                  type="text"
                  placeholder="Brief syllabus overview..."
                  value={subDesc}
                  onChange={(e) => setSubDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Applicable Classes</label>
                <div className="grid grid-cols-5 gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => {
                    const checked = subClasses.includes(c);
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setSubClasses((prev) =>
                            checked ? prev.filter((x) => x !== c) : [...prev, c]
                          );
                        }}
                        className={`py-1.5 rounded-lg font-bold border transition ${
                          checked
                            ? 'bg-blue-900 text-white border-blue-900'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        Cl. {c}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 text-white rounded-xl font-bold"
                >
                  Create Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Chapter Modal */}
      {showChapterModal && activeSubjectForChapter && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900">
              Add Chapter to {activeSubjectForChapter.name} (Class {activeClass})
            </h3>

            <form onSubmit={handleCreateChapter} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Chapter Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Light - Reflection & Refraction"
                  value={chapTitle}
                  onChange={(e) => setChapTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">
                  Topics (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mirror Formula, Lens Formula, Refraction Index"
                  value={chapTopics}
                  onChange={(e) => setChapTopics(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChapterModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 text-white rounded-xl font-bold"
                >
                  Add Chapter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Subject Confirm */}
      <ConfirmModal
        isOpen={Boolean(deleteSubjectId)}
        title="Delete Subject?"
        message="Are you sure you want to delete this subject? All associated questions will remain in the database."
        variant="danger"
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={() => {
          if (deleteSubjectId) {
            storageService.deleteSubject(deleteSubjectId);
            setDeleteSubjectId(null);
            onRefresh();
          }
        }}
        onCancel={() => setDeleteSubjectId(null)}
      />

      {/* Delete Chapter Confirm */}
      <ConfirmModal
        isOpen={Boolean(deleteChapterId)}
        title="Delete Chapter?"
        message="Are you sure you want to delete this chapter from the syllabus?"
        variant="danger"
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={() => {
          if (deleteChapterId) {
            storageService.deleteChapter(deleteChapterId);
            setDeleteChapterId(null);
            onRefresh();
          }
        }}
        onCancel={() => setDeleteChapterId(null)}
      />
    </div>
  );
};
