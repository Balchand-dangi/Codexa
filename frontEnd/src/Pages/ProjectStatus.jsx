import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { HiPencil, HiTrash, HiOutlineCalendarDays, HiOutlineClipboardDocumentCheck, HiXMark } from 'react-icons/hi2';

const COLUMNS = [
    { key: 'todo', title: 'To-Do' },
    { key: 'in-progress', title: 'In Progress' },
    { key: 'completed', title: 'Completed' }
];

const PRIORITY_STYLES = {
    low: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    medium: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    high: 'bg-red-500/15 text-red-300 border border-red-500/30'
};

const toInputDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
};

const normalizeTask = (task, index) => {
    const validStatus = new Set(['todo', 'in-progress', 'completed']);
    const validPriority = new Set(['low', 'medium', 'high']);

    const status = validStatus.has(task?.status)
        ? task.status
        : task?.completed
            ? 'completed'
            : 'todo';

    return {
        id: String(task?.id || `${Date.now()}-${index}`),
        title: String(task?.title || '').trim(),
        description: String(task?.description || '').trim(),
        priority: validPriority.has(task?.priority) ? task.priority : 'medium',
        status,
        dueDate: task?.dueDate ? toInputDate(task.dueDate) : '',
        createdAt: task?.createdAt || new Date().toISOString()
    };
};

const emptyForm = {
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    dueDate: ''
};

function ProjectStatus({user}) {
    const { projectId } = useParams();
    const navigate = useNavigate();

    const [projectTitle, setProjectTitle] = useState('Project Tasks');
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [readOnly, setReadOnly] = useState(false);
    const [draggingId, setDraggingId] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
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
                setTasks(apiTasks.map(normalizeTask).filter(t => t.title));
                setReadOnly(!ownerView);
            } catch (err) {
                toast.error(err.response?.data?.message || 'Unable to load project tasks');
                navigate('/MyProjects');
            } finally {
                setLoading(false);
            }
        };

        if (projectId) {
            loadProjectStatus();
        }
    }, [projectId, navigate]);

    // stop background scrolling when modal is open
    useEffect(() => {
        document.body.style.overflow = openModal ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [openModal]);

    const overallStats = useMemo(() => {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const progress = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
        return { totalTasks, completedTasks, progress };
    }, [tasks]);

    const displayedTasks = useMemo(() => {
        let result = tasks;
        if (priorityFilter !== 'all') {
            result = result.filter(t => t.priority === priorityFilter);
        }

        result = [...result].sort((a, b) => {
            if (sortBy === 'oldest') {
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            }
            if (sortBy === 'due-soon') {
                const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
                const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
                return aDue - bDue;
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        return result;
    }, [tasks, priorityFilter, sortBy]);

    const tasksByColumn = useMemo(() => {
        return {
            todo: displayedTasks.filter(t => t.status === 'todo'),
            'in-progress': displayedTasks.filter(t => t.status === 'in-progress'),
            completed: displayedTasks.filter(t => t.status === 'completed')
        };
    }, [displayedTasks]);

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

    const closeModal = () => {
        setOpenModal(false);
        setEditingTaskId(null);
        setForm(emptyForm);
    };

    const handleSubmitTask = (e) => {
        e.preventDefault();
        const title = form.title.trim();
        if (!title) {
            toast.error('Task title is required');
            return;
        }

        if (editingTaskId) {
            setTasks(prev => prev.map(task => (
                task.id === editingTaskId
                    ? {
                        ...task,
                        title,
                        description: form.description.trim(),
                        priority: form.priority,
                        status: form.status,
                        dueDate: form.dueDate
                    }
                    : task
            )));
        } else {
            setTasks(prev => [
                ...prev,
                {
                    id: Date.now().toString(),
                    title,
                    description: form.description.trim(),
                    priority: form.priority,
                    status: form.status,
                    dueDate: form.dueDate,
                    createdAt: new Date().toISOString()
                }
            ]);
        }

        closeModal();
    };

    const deleteTask = (taskId) => {
        setTasks(prev => prev.filter(task => task.id !== taskId));
    };

    const confirmDeleteTask = async (task) => {
        if (readOnly) return;
        const confirmed = await new Promise(resolve => {
            toast((t) => (
                <div className="flex flex-col gap-2">
                    <p className="font-semibold text-slate-800">Delete task?</p>
                    <p className="text-sm text-slate-600">
                        "<span className="font-bold text-red-600">{task.title}</span>" will be permanently removed.
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                resolve(true);
                            }}
                            className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600"
                        >
                            Yes, Delete
                        </button>
                        <button
                            onClick={() => {
                                toast.dismiss(t.id);
                                resolve(false);
                            }}
                            className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-300"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ), { duration: 10000 });
        });

        if (!confirmed) return;
        deleteTask(task.id);
        toast.success('Task deleted');
    };

    const handleDragStart = (taskId) => {
        setDraggingId(taskId);
    };

    const handleDrop = (columnKey) => {
        if (!draggingId || readOnly) return;
        setTasks(prev => prev.map(task => (
            task.id === draggingId ? { ...task, status: columnKey } : task
        )));
        setDraggingId(null);
    };

    const handleSave = async () => {
        if (readOnly) return;
        setSaving(true);
        try {
            const payload = {
                tasks: tasks.map((t, index) => normalizeTask(t, index)).map(t => ({
                    ...t,
                    dueDate: t.dueDate || null
                }))
            };
            await axios.patch(`/api/my-projects/${projectId}/status`, payload, { withCredentials: true });
            toast.success(`Saved (${overallStats.progress}% completed)`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save tasks');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 px-4 flex items-center justify-center text-slate-300">
                Loading project tasks...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 px-4 pb-10">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-violet-600/30 border border-violet-500/40 flex items-center justify-center">
                                <HiOutlineClipboardDocumentCheck className="w-6 h-6 text-violet-300" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">{projectTitle}</h1>
                                <p className="text-slate-400 text-sm">Task board for student project execution</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => navigate(-1)}
                                className="px-4 py-2 text-slate-200 bg-slate-700 rounded-xl hover:bg-slate-600 transition"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={openCreateModal}
                                disabled={readOnly}
                                className="px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition disabled:opacity-50"
                            >
                                + Add task
                            </button>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-300 font-semibold">Overall Progress Tracker</span>
                            <span className="text-emerald-400 font-bold">{overallStats.progress}%</span>
                        </div>
                        <div className="mt-2 h-3 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-3 bg-emerald-500 transition-all duration-500" style={{ width: `${overallStats.progress}%` }} />
                        </div>
                        <p className="mt-2 text-xs text-slate-400">
                            {overallStats.completedTasks}/{overallStats.totalTasks} tasks completed
                        </p>
                    </div>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 sm:items-center">
                    <div>
                        <label className="text-xs text-slate-300 block mb-1">Priority filter</label>
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="bg-slate-800 border border-slate-600 text-slate-100 rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="all">All</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-slate-300 block mb-1">Sort by</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="bg-slate-800 border border-slate-600 text-slate-100 rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="newest">Newest first</option>
                            <option value="oldest">Oldest first</option>
                            <option value="due-soon">Due soon</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    {COLUMNS.map(column => (
                        <div
                            key={column.key}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDrop(column.key)}
                            className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 min-h-[200px]"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-xl font-bold text-white">{column.title}</h2>
                                <span className="text-xs text-slate-300 bg-slate-700 px-2 py-1 rounded-full">
                                    {tasksByColumn[column.key].length}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {tasksByColumn[column.key].map(task => (
                                    <div
                                        key={task.id}
                                        draggable={!readOnly}
                                        onDragStart={() => handleDragStart(task.id)}
                                        onDragEnd={() => setDraggingId(null)}
                                        className={`rounded-xl border p-3 cursor-move bg-slate-900/70 ${draggingId === task.id ? 'border-violet-500' : 'border-slate-700'

                                            }`
                                        }
                                    >
                                        <h3 className="text-white font-semibold">{task.title}</h3>
                                        {task.description && <p className="text-slate-400 text-sm mt-1">{task.description}</p>}

                                        <div className="flex items-center justify-between gap-2 mt-3">
                                            <span className={`text-xs px-2 py-1 rounded-md capitalize ${PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium}`}>
                                                {task.priority}
                                            </span>
                                            <span className="text-xs text-slate-400 flex items-center gap-1">
                                                <HiOutlineCalendarDays className="w-4 h-4" />
                                                {task.dueDate ? task.dueDate : 'No due date'}
                                            </span>
                                        </div>

                                        <div className="flex gap-2 mt-3">
                                            <button
                                                onClick={() => openEditModal(task)}
                                                disabled={readOnly}
                                                className="px-3 py-1.5 bg-violet-500/20 cursor-pointer text-violet-300 border border-violet-500/40 rounded-lg text-sm hover:bg-violet-500 hover:text-white transition disabled:opacity-50"
                                            >
                                                <span className="inline-flex  items-center gap-1"><HiPencil className="w-4 h-4" /> Edit</span>
                                            </button>
                                            <button
                                                onClick={() => confirmDeleteTask(task)}
                                                disabled={readOnly}
                                                className="cursor-pointer px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500 hover:text-white transition-all text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 h-9"
                                            >
                                                <HiTrash className="w-4 h-4 flex-shrink-0" />
                                                <span>Delete</span>
                                            </button>

                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => user.role === 'user' ? navigate('/MyProjects') : navigate(-1)}
                        className="px-6 py-2.5 bg-slate-700 text-slate-200 rounded-xl hover:bg-slate-600 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || readOnly}
                        title='click to save your data'
                        className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition disabled:opacity-50"
                    >
                        {readOnly ? 'Read Only (Admin)' : saving ? 'Saving...' : 'Save Board'}
                    </button>
                </div>
            </div>

            {openModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-xl bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-3xl font-bold text-white">{editingTaskId ? 'Edit Task' : 'Add Task'}</h2>
                            <button onClick={closeModal} className="text-slate-400 hover:bg-slate-700 cursor-pointer hover:text-white rounded p-0.5">
                                <HiXMark className="w-7 h-7" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitTask} className="space-y-4">
                            <div>
                                <label className="text-sm font-semibold text-slate-200">Title</label>
                                <input
                                    value={form.title}
                                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                                    className="mt-1 w-full bg-slate-900/70 border border-slate-600 text-slate-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-200">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                                    className="mt-1 w-full bg-slate-900/70 border border-slate-600 text-slate-100 rounded-md px-3 py-2 min-h-28 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-slate-200">Priority</label>
                                    <select
                                        value={form.priority}
                                        onChange={(e) => setForm(prev => ({ ...prev, priority: e.target.value }))}
                                        className="mt-1 w-full bg-slate-900/70 border border-slate-600 text-slate-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-slate-200">Status</label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => setForm(prev => ({ ...prev, status: e.target.value }))}
                                        className="mt-1 w-full bg-slate-900/70 border border-slate-600 text-slate-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                    >
                                        <option value="todo">To-Do</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-200">Due date</label>
                                <input
                                    type="date"
                                    value={form.dueDate}
                                    onChange={(e) => setForm(prev => ({ ...prev, dueDate: e.target.value }))}
                                    className="mt-1 w-full bg-slate-900/70 border border-slate-600 text-slate-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button type="submit" className="px-4 py-2.5 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition">
                                    {editingTaskId ? 'Update Task' : 'Create Task'}
                                </button>
                                <button type="button" onClick={closeModal} className="px-4 py-2.5 bg-slate-700 text-slate-100 rounded-md hover:bg-slate-600 transition">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProjectStatus;
