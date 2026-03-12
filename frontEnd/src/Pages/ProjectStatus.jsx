import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { HiOutlineArrowTopRightOnSquare, HiOutlineCalendarDays, HiOutlineClipboardDocumentCheck, HiOutlineLink, HiPencil, HiTrash, HiXMark } from 'react-icons/hi2';

const COLUMNS = [
  { key: 'todo', title: 'To-Do' },
  { key: 'in-progress', title: 'In Progress' },
  { key: 'completed', title: 'Completed' }
];

const emptyForm = {
  title: '',
  description: '',
  priority: 'medium',
  status: 'todo',
  dueDate: ''
};

const emptyLinks = {
  github: '',
  liveDemo: ''
};

const toInputDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const normalizeTask = (task, index) => ({
  id: String(task?.id || `${Date.now()}-${index}`),
  title: String(task?.title || '').trim(),
  description: String(task?.description || '').trim(),
  priority: ['low', 'medium', 'high'].includes(task?.priority) ? task.priority : 'medium',
  status: ['todo', 'in-progress', 'completed'].includes(task?.status) ? task.status : 'todo',
  dueDate: task?.dueDate ? toInputDate(task.dueDate) : '',
  createdAt: task?.createdAt || new Date().toISOString()
});

const getStageTimelineDates = (stage) => {
  if (stage.timelineType === 'range') {
    const start = stage.startDate ? new Date(stage.startDate) : null;
    const end = stage.endDate ? new Date(stage.endDate) : null;
    return { start, end };
  }
  return { start: null, end: null };
};

function ProjectStatus({ user }) {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [projectTitle, setProjectTitle] = useState('Project Tasks');
  const [links, setLinks] = useState(emptyLinks);
  const [tasks, setTasks] = useState([]);
  const [globalStages, setGlobalStages] = useState([]);
  const [stageSubmissions, setStageSubmissions] = useState([]);
  const [workflow, setWorkflow] = useState({ isActive: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [draggingId, setDraggingId] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [dragStageId, setDragStageId] = useState(null);
  const [submissionModalStage, setSubmissionModalStage] = useState(null);
  const [submissionImage, setSubmissionImage] = useState('');
  const [submissionLoading, setSubmissionLoading] = useState(false);

  const loadProjectStatus = async () => {
    setLoading(true);
    try {
      let res;
      let ownerView = true;
      try {
        res = await axios.get(`/api/my-projects/${projectId}/status`, { withCredentials: true });
      } catch {
        res = await axios.get(`/api/admin/projects/${projectId}/status`, { withCredentials: true });
        ownerView = false;
      }

      const apiTasks = Array.isArray(res.data?.status?.tasks) ? res.data.status.tasks : [];
      setProjectTitle(res.data?.projectTitle || 'Project Tasks');
      setLinks({
        github: String(res.data?.links?.github || '').trim(),
        liveDemo: String(res.data?.links?.liveDemo || '').trim()
      });
      setTasks(apiTasks.map(normalizeTask).filter(t => t.title));
      setGlobalStages((res.data?.globalStages || []).sort((a, b) => a.order - b.order));
      setStageSubmissions(Array.isArray(res.data?.status?.stageSubmissions) ? res.data.status.stageSubmissions : []);
      setWorkflow(res.data?.workflow || { isActive: false });
      setReadOnly(!ownerView);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to load project status');
      navigate('/MyProjects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) loadProjectStatus();
  }, [projectId]);

  useEffect(() => {
    document.body.style.overflow = openModal || submissionModalStage ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [openModal, submissionModalStage]);

  const submissionByStageId = useMemo(() => {
    const map = new Map();
    stageSubmissions.forEach(sub => map.set(sub.stageId, sub));
    return map;
  }, [stageSubmissions]);

  const stageStates = useMemo(() => {
    const now = Date.now();
    return globalStages.map((stage) => {
      const submission = submissionByStageId.get(stage.stageId);
      const { start, end } = getStageTimelineDates(stage);
      const startMs = start?.getTime();
      const endMs = end?.getTime();

      let state = 'upcoming';
      let note = 'Locked';

      if (submission?.status === 'approved') {
        state = 'completed';
        note = 'Approved';
      } else if (submission?.status === 'pending') {
        state = 'pending-review';
        note = 'Awaiting admin approval';
      } else if (submission?.status === 'rejected') {
        state = 'in-progress';
        note = submission.adminFeedback ? `Rejected: ${submission.adminFeedback}` : 'Rejected: fix and resubmit';
      } else if (stage.timelineType === 'range') {
        if (startMs && now < startMs) {
          state = 'upcoming';
          note = 'Not started yet';
        } else if (startMs && endMs && now >= startMs && now <= endMs) {
          state = 'in-progress';
          note = 'Active stage';
        } else if (endMs && now > endMs) {
          state = 'pending';
          note = 'Timeline expired, pending completion';
        } else {
          state = 'in-progress';
          note = 'Active stage';
        }
      } else {
        state = 'in-progress';
        note = `Duration based: ${stage.durationDays} day(s)`;
      }

      return { ...stage, state, note, submission };
    });
  }, [globalStages, submissionByStageId]);

  const stageCounts = useMemo(() => {
    return stageStates.reduce((acc, stage) => {
      acc[stage.state] = (acc[stage.state] || 0) + 1;
      return acc;
    }, {});
  }, [stageStates]);

  const stageProgress = useMemo(() => {
    const total = stageStates.length;
    const done = stageStates.filter(s => s.state === 'completed').length;
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }, [stageStates]);

  const overallStats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const progress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
    return { totalTasks, completedTasks, progress };
  }, [tasks]);

  const tasksByColumn = useMemo(() => ({
    todo: tasks.filter(t => t.status === 'todo'),
    'in-progress': tasks.filter(t => t.status === 'in-progress'),
    completed: tasks.filter(t => t.status === 'completed')
  }), [tasks]);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(max-width: 768px), (pointer: coarse)');
    const updateIsMobile = () => setIsMobile(mediaQuery.matches);

    updateIsMobile();
    mediaQuery.addEventListener('change', updateIsMobile);
    return () => mediaQuery.removeEventListener('change', updateIsMobile);
  }, []);

  const openCreateModal = () => {
    setEditingTaskId(null);
    setForm(emptyForm);
    setOpenModal(true);
  };

  const openEditModal = (task) => {
    setEditingTaskId(task.id);
    setForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'medium',
      status: task.status || 'todo',
      dueDate: task.dueDate || ''
    });
    setOpenModal(true);
  };

  const closeTaskModal = () => {
    setOpenModal(false);
    setEditingTaskId(null);
    setForm(emptyForm);
  };

  const handleSubmitTask = (e) => {
    e.preventDefault();
    const title = form.title.trim();
    if (!title) return toast.error('Task title is required');

    if (editingTaskId) {
      setTasks(prev => prev.map(task => (
        task.id === editingTaskId ? { ...task, ...form, title, description: form.description.trim() } : task
      )));
    } else {
      setTasks(prev => [...prev, {
        id: Date.now().toString(),
        title,
        description: form.description.trim(),
        priority: form.priority,
        status: form.status,
        dueDate: form.dueDate,
        createdAt: new Date().toISOString()
      }]);
    }
    closeTaskModal();
  };

  const handleDropTask = (columnKey) => {
    if (!draggingId || readOnly) return;
    setTasks(prev => prev.map(task => (task.id === draggingId ? { ...task, status: columnKey } : task)));
    setDraggingId(null);
  };

  const saveTaskBoard = async () => {
    if (readOnly) return;
    setSaving(true);
    try {
      const payload = {
        tasks: tasks.map((t, index) => normalizeTask(t, index)).map(t => ({ ...t, dueDate: t.dueDate || null }))
      };
      await axios.patch(`/api/my-projects/${projectId}/status`, payload, { withCredentials: true });
      toast.success(`Saved (${overallStats.progress}% completed)`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save tasks');
    } finally {
      setSaving(false);
    }
  };

  const saveProjectLinks = async () => {
    if (readOnly) return;
    setSaving(true);
    try {
      await axios.patch(
        `/api/my-projects/${projectId}/status`,
        {
          links: {
            github: links.github.trim(),
            liveDemo: links.liveDemo.trim()
          }
        },
        { withCredentials: true }
      );
      toast.success('Project links updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update project links');
    } finally {
      setSaving(false);
    }
  };

  const openSubmissionModal = (stage) => {
    if (readOnly) return;
    if (!workflow.isActive) {
      toast.error('Accept latest workflow update first');
      return;
    }
    if (!['in-progress', 'pending'].includes(stage.state)) {
      toast.error('Only active or pending stages can be submitted');
      return;
    }

    setSubmissionModalStage(stage);
    setSubmissionImage('');
  };

  const onStageDropToCompleted = () => {
    if (!dragStageId || readOnly) return;
    const stage = stageStates.find(s => s.stageId === dragStageId);
    setDragStageId(null);
    if (!stage) return;
    if (!workflow.isActive) {
      toast.error('Accept latest workflow update first');
      return;
    }
    if (!['in-progress', 'pending'].includes(stage.state)) {
      toast.error('Only active or pending stages can be submitted');
      return;
    }
    openSubmissionModal(stage);
  };

  const handleProofUpload = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    const maxBytes = 1 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error('Image must be less than 1 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setSubmissionImage(reader.result?.toString() || '');
    reader.readAsDataURL(file);
  };

  const submitStageProof = async () => {
    if (!submissionModalStage) return;
    if (!submissionImage) {
      toast.error('Image proof is required');
      return;
    }
    setSubmissionLoading(true);
    try {
      await axios.post(
        `/api/my-projects/${projectId}/stages/${submissionModalStage.stageId}/submit`,
        { proofImage: submissionImage },
        { withCredentials: true }
      );
      toast.success('Submission sent to admin for approval');
      setSubmissionModalStage(null);
      setSubmissionImage('');
      loadProjectStatus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit stage proof');
    } finally {
      setSubmissionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 px-4 flex items-center justify-center text-slate-300">
        Loading project status...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 px-4 pb-10">
      <div className="max-w-7xl mx-auto space-y-6">


        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
            <h2 className="text-white font-semibold text-lg">Global Stages Tracker</h2>
            <div className="text-sm text-slate-300">
              Workflow: {workflow.isActive ? <span className="text-emerald-400 font-semibold">Active</span> : <span className="text-amber-300 font-semibold">Pending acceptance</span>}
            </div>
          </div>

          <div className="mb-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Stage completion</span>
              <span className="text-emerald-400 font-bold">{stageProgress}%</span>
            </div>
            <div className="mt-2 h-2.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-2.5 bg-emerald-500 transition-all duration-500" style={{ width: `${stageProgress}%` }} />
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {stageStates.map((stage, idx) => (
              <div
                key={stage.stageId}
                draggable={!isMobile && !readOnly && workflow.isActive && ['in-progress', 'pending'].includes(stage.state)} onDragStart={() => setDragStageId(stage.stageId)}
                onDragEnd={() => setDragStageId(null)}
                className={`relative min-w-[260px] rounded-xl border p-3 ${stage.state === 'completed' ? 'bg-emerald-500/10 border-emerald-500/30' :
                  stage.state === 'in-progress' ? 'bg-violet-500/10 cursor-move border-violet-500/30' :
                    stage.state === 'pending' ? 'bg-blue-500/10 cursor-move border-blue-500/30' :
                      stage.state === 'pending-review' ? 'bg-amber-500/10 border-amber-500/30' :
                        'bg-slate-900/60 border-slate-700'
                  }`}
              >
                {stage.state === 'in-progress' && (
                  <span className="absolute top-2 right-2 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-800 animate-pulse"></span>
                )}
                <p className="text-xs text-slate-400 mb-1">Stage {idx + 1}</p>
                <span><h3 className="text-white font-semibold">{stage.title}</h3></span>
                {!readOnly && workflow.isActive && ['in-progress', 'pending'].includes(stage.state) && (
                  <span onClick={() => openSubmissionModal(stage)} className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-400 cursor-pointer">
                    <HiOutlineClipboardDocumentCheck className="w-4 h-4" />
                    Submit proof
                  </span>
                )}
                <p className="text-xs text-slate-300 mt-1">{stage.description || 'No description provided'}</p>
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                  <HiOutlineCalendarDays className="w-4 h-4" />
                  {stage.timelineType === 'duration'
                    ? `${stage.durationDays} day(s)`
                    : `${formatDate(stage.startDate)} -> ${formatDate(stage.endDate)}`}
                </p>
                <p className="text-xs text-slate-400 mt-1">Marks: {stage.marks}</p>
                <p className="text-xs mt-2 text-slate-200">{stage.note}</p>
                {stage.guidelines && <p className="text-xs text-slate-400 mt-2">Guidelines: {stage.guidelines}</p>}
              </div>
            ))}
          </div>

          <div
            className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-200"
            onDragOver={(e) => e.preventDefault()}
            onDrop={onStageDropToCompleted}
          >
            Drag active stage here to mark Completed or from the stage itself (proof image required)
            <span className="ml-2 text-xs text-slate-300">
              Pending: {stageCounts.pending || 0} | In Progress: {stageCounts['in-progress'] || 0} | Completed: {stageCounts.completed || 0}
            </span>
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-violet-600/30 border border-violet-500/40 flex items-center justify-center">
                <HiOutlineClipboardDocumentCheck className="w-6 h-6 text-violet-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{projectTitle}</h1>
                <p className="text-slate-400 text-sm">Project task board</p>
              </div>

            
            </div>

	            <div className="flex gap-2">
              <button onClick={() => navigate(-1)} className="px-4 py-2 cursor-pointer text-slate-200 bg-slate-700 rounded-xl hover:bg-slate-600 transition">
                ← Back
              </button>
              <button onClick={openCreateModal} disabled={readOnly} className="cursor-pointer px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition disabled:opacity-50">
                + Add task
              </button>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-400">GitHub</span>
                <div className="mt-2 relative">
                  <HiOutlineLink className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={links.github}
                    onChange={(e) => setLinks(prev => ({ ...prev, github: e.target.value }))}
                    readOnly={readOnly}
                    placeholder="https://github.com/username/repo"
                    className="w-full bg-slate-900/70 border border-slate-700 text-slate-100 rounded-xl pl-10 pr-3 py-2.5 read-only:opacity-70"
                  />
                </div>
              </label>

              <label className="block">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-400">Live Demo</span>
                <div className="mt-2 relative">
                  <HiOutlineLink className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={links.liveDemo}
                    onChange={(e) => setLinks(prev => ({ ...prev, liveDemo: e.target.value }))}
                    readOnly={readOnly}
                    placeholder="https://your-demo-site.com"
                    className="w-full bg-slate-900/70 border border-slate-700 text-slate-100 rounded-xl pl-10 pr-3 py-2.5 read-only:opacity-70"
                  />
                </div>
              </label>
            </div>

            {!readOnly && (
              <div className="flex items-end">
                <button
                  onClick={saveProjectLinks}
                  disabled={saving}
                  className="w-full lg:w-auto px-4 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Update Links'}
                </button>
              </div>
            )}
          </div>

          {(links.github || links.liveDemo) && (
            <div className="mt-4 flex flex-wrap gap-3">
              {links.github && (
                <a
                  href={links.github}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-600 text-slate-100 bg-slate-900/70 hover:border-slate-500 transition"
                >
                  GitHub
                  <HiOutlineArrowTopRightOnSquare className="w-4 h-4" />
                </a>
              )}
              {links.liveDemo && (
                <a
                  href={links.liveDemo}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-500/40 text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20 transition"
                >
                  Live Demo
                  <HiOutlineArrowTopRightOnSquare className="w-4 h-4" />
                </a>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {COLUMNS.map(column => (
            <div
              key={column.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDropTask(column.key)}
              className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 min-h-[180px]"
            >
              <div className="flex items-center  justify-between mb-3">
                <h2 className="text-xl font-bold text-white">{column.title}</h2>
                <span className="text-xs text-slate-300 bg-slate-700 px-2 py-1 rounded-full">{tasksByColumn[column.key].length}</span>
              </div>
              <div className="space-y-3">
                {tasksByColumn[column.key].map(task => (
                  <div
                    key={task.id}
                    draggable={!readOnly}
                    onDragStart={() => setDraggingId(task.id)}
                    onDragEnd={() => setDraggingId(null)}
                    className={`rounded-xl  border p-3 cursor-move ${draggingId === task.id ? 'border-violet-500' : 'border-slate-700'}`}
                  >
                    <h3 className="text-white  font-semibold">{task.title}</h3>
                    {task.description && <p className="text-slate-400 text-sm mt-1">{task.description}</p>}
                    <div className="flex items-center justify-between gap-2 mt-3">
                      <span className="text-xs px-2 py-1 rounded-md capitalize bg-violet-500/15 text-violet-300 border border-violet-500/30">{task.priority}</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <HiOutlineCalendarDays className="w-4 h-4" />
                        {task.dueDate || 'No due date'}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => openEditModal(task)} disabled={readOnly} className="px-3 py-1.5 bg-violet-500/20 text-violet-300 border border-violet-500/40 rounded-lg text-sm disabled:opacity-50">
                        <span className="inline-flex items-center gap-1"><HiPencil className="w-4 h-4" /> Edit</span>
                      </button>
                      <button
                        onClick={() => setTasks(prev => prev.filter(t => t.id !== task.id))}
                        disabled={readOnly}
                        className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl text-sm disabled:opacity-50 inline-flex items-center gap-1"
                      >
                        <HiTrash className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={() => navigate(-1)} className="px-6 py-2.5 bg-red-800/90 text-white rounded-xl hover:bg-red-800 transition">
            Cancel
          </button>
          <button onClick={saveTaskBoard} disabled={saving || readOnly} title='Save all your tasks' className="px-6 py-2.5 bg-green-700 text-white rounded-xl hover:bg-green-700/80 transition disabled:opacity-50">
            {readOnly ? 'Read Only (Admin/team member)' : saving ? 'Saving...' : 'Save Board'}
          </button>
        </div>
      </div>

      {openModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700/90 rounded-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">{editingTaskId ? 'Edit Task' : 'Add Task'}</h2>
              <button onClick={closeTaskModal} className="text-slate-400 hover:bg-slate-800 hover:text-white/90 rounded p-0.5">
                <HiXMark className="w-7 h-7" />
              </button>
            </div>
            <form onSubmit={handleSubmitTask} className="space-y-4">
              <input value={form.title} onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Title" required className="w-full bg-slate-800 border border-slate-600 text-slate-100 rounded-md px-3 py-2" />
              <textarea value={form.description} onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Description" className="w-full min-h-24 bg-slate-800 border border-slate-600 text-slate-100 rounded-md px-3 py-2" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select value={form.priority} onChange={(e) => setForm(prev => ({ ...prev, priority: e.target.value }))} className="bg-slate-800 border border-slate-600 text-slate-100 rounded-md px-3 py-2">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <select value={form.status} onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))} className="bg-slate-800 border border-slate-600 text-slate-100 rounded-md px-3 py-2">
                  <option value="todo">To-Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <input type="date" value={form.dueDate} onChange={(e) => setForm(prev => ({ ...prev, dueDate: e.target.value }))} className="bg-slate-800 border border-slate-600 text-slate-100 rounded-md px-3 py-2" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={closeTaskModal} className="px-4 py-2.5 bg-red-800/90 text-white rounded-md hover:bg-red-800 transition">Cancel</button>
                <button type="submit" className="px-4 py-2.5 bg-violet-700 text-white rounded-md hover:bg-violet-800 transition">{editingTaskId ? 'Update Task' : 'Create Task'}</button>
                
              </div>
            </form>
          </div>
        </div>
      )}

      {submissionModalStage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Submit Stage Proof</h2>
              <button onClick={() => setSubmissionModalStage(null)} className="text-slate-400 hover:text-white">
                <HiXMark className="w-7 h-7" />
              </button>
            </div>
            <p className="text-slate-300 text-sm mb-3">Stage: <span className="font-semibold">{submissionModalStage.title}</span></p>
            <input type="file" accept="image/*" onChange={(e) => handleProofUpload(e.target.files?.[0])} className="w-full text-sm cursor-pointer border border-slate-600 text-slate-300 rounded-md px-3 py-2" />
            {submissionImage && <img src={submissionImage} alt="Proof preview" className="mt-3 max-h-60 rounded border border-slate-700" />}
            <div className="flex gap-2 mt-4 justify-end">
              <button onClick={() => setSubmissionModalStage(null)} className="px-4 py-2 bg-slate-700 text-slate-100 cursor-pointer rounded-lg">Cancel</button>
              <button onClick={submitStageProof} disabled={submissionLoading} className="px-4 py-2 bg-emerald-600 cursor-pointer text-white rounded-lg">
                {submissionLoading ? 'Submitting...' : 'Submit for Approval'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectStatus;

