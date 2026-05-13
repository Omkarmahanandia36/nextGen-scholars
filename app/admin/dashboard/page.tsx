'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaCheck, FaTimes, FaPlus, FaSpinner, FaBookOpen, FaUsers, FaVideo, FaGraduationCap, FaEnvelope, FaExclamationCircle, FaFileAlt } from 'react-icons/fa';
import { UploadButton } from '@/utils/uploadthing';
import "@uploadthing/react/styles.css";

interface DashboardStats {
  totalTutors: number;
  totalMeetings: number;
  totalClasses: number;
  totalSubscribers: number;
}

interface Tutor {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  qualification: string;
  specialization: string;
  university: string;
  subjects: string[];
  experience: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

interface Meeting {
  _id: string;
  type: 'call' | 'video' | 'message';
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  message: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
}

interface ClassSchedule {
  _id: string;
  studentName: string;
  email: string;
  phone: string;
  courseId: string;
  courseName: string;
  subjects: string[];
  preferredDays: string[];
  preferredTime: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
}

interface Newsletter {
  _id: string;
  email: string;
  subscribed: boolean;
  subscribedAt: Date;
  updatedAt: Date;
}

interface Material {
  _id: string;
  title: string;
  description?: string;
  type: 'PDF' | 'Video' | 'Link';
  url: string;
  subject: string;
  className: string;
  board?: string;
  folderName?: string;
}

interface Question {
  question: string;
  options: string[];
  correctOption: number;
}

interface Exam {
  _id: string;
  title: string;
  description?: string;
  subject: string;
  className: string;
  board?: string;
  folderName?: string;
  examType?: 'daily' | 'most-probable';
  duration: number;
  questions: Question[];
}

// Custom Toast Component
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-xl text-white font-medium flex items-center space-x-3 z-50 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
    >
      {type === 'success' ? <FaCheck /> : <FaTimes />}
      <span>{message}</span>
    </motion.div>
  );
};

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const [stats, setStats] = useState<DashboardStats>({
    totalTutors: 0,
    totalMeetings: 0,
    totalClasses: 0,
    totalSubscribers: 0,
  });

  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [classes, setClasses] = useState<ClassSchedule[]>([]);
  const [subscribers, setSubscribers] = useState<Newsletter[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [activeTab, setActiveTab] = useState<'tutors' | 'meetings' | 'classes' | 'subscribers' | 'materials' | 'exams'>('tutors');
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [isAddingExam, setIsAddingExam] = useState(false);
  const [materialsSectionDesc, setMaterialsSectionDesc] = useState('Manage and organize educational resources');
  const [newMaterial, setNewMaterial] = useState({ title: '', description: '', type: 'Link' as const, url: '', subject: '', className: '', board: 'CBSE', folderName: '' });
  const [examsSectionDesc, setExamsSectionDesc] = useState('Create and manage online assessments');
  const [newExam, setNewExam] = useState({ 
    title: '', 
    description: '', 
    subject: '', 
    className: '', 
    board: 'CBSE', 
    folderName: '', 
    examType: 'daily' as 'daily' | 'most-probable',
    duration: 30, 
    questions: [{ question: '', options: ['', '', '', ''], correctOption: 0, explanation: '' }] 
  });

  // Filtering states
  const [materialFilter, setMaterialFilter] = useState({ subject: '', className: '' });
  const [examFilter, setExamFilter] = useState({ subject: '', className: '' });

  useEffect(() => {
    verifyAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const verifyAuth = async () => {
    try {
      const response = await fetch('/api/admin/verify');
      const data = await response.json();

      if (!data.success) {
        window.location.href = '/admin/login';
        return;
      }

      await fetchAllData();
    } catch (error) {
      console.error('Auth verification failed:', error);
      window.location.href = '/admin/login';
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllData = async () => {
    try {
      const [tutorsRes, meetingsRes, classesRes, subscribersRes, materialsRes, examsRes] = await Promise.all([
        fetch('/api/tutors').then(res => res.json()),
        fetch('/api/meetings').then(res => res.json()),
        fetch('/api/schedule-class').then(res => res.json()),
        fetch('/api/newsletter').then(res => res.json()),
        fetch('/api/admin/materials').then(res => res.json()),
        fetch('/api/admin/exams').then(res => res.json()),
      ]);

      setTutors(tutorsRes.tutors || []);
      setMeetings(meetingsRes.meetings || []);
      setClasses(classesRes.schedules || []);
      setSubscribers(subscribersRes.subscribers || []);
      setMaterials(Array.isArray(materialsRes) ? materialsRes : []);
      setExams(Array.isArray(examsRes) ? examsRes : []);

      setStats({
        totalTutors: tutorsRes.tutors?.length || 0,
        totalMeetings: meetingsRes.meetings?.length || 0,
        totalClasses: classesRes.schedules?.length || 0,
        totalSubscribers: subscribersRes.subscribers?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Failed to load dashboard data', 'error');
    }
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMaterial),
      });
      if (response.ok) {
        setIsAddingMaterial(false);
        setNewMaterial({ title: '', description: '', type: 'Link', url: '', subject: '', className: '', board: 'CBSE', folderName: '' });
        fetchAllData();
        showToast('Material added successfully');
      } else {
        showToast('Failed to add material', 'error');
      }
    } catch (error) {
      console.error('Error adding material:', error);
      showToast('An error occurred while adding material', 'error');
    }
  };

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExam),
      });
      if (response.ok) {
        setIsAddingExam(false);
        setNewExam({ title: '', description: '', subject: '', className: '', board: 'CBSE', folderName: '', duration: 30, questions: [{ question: '', options: ['', '', '', ''], correctOption: 0 }] });
        fetchAllData();
        showToast('Exam added successfully');
      } else {
        showToast('Failed to add exam', 'error');
      }
    } catch (error) {
      console.error('Error adding exam:', error);
      showToast('An error occurred while adding exam', 'error');
    }
  };

  const handleStatusChange = async (collection: string, id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/${collection}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchAllData();
        showToast(`Status updated to ${newStatus}`);
      } else {
        showToast('Failed to update status', 'error');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showToast('An error occurred while updating status', 'error');
    }
  };

  const handleDelete = async (collection: string, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`/api/${collection}/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchAllData();
        showToast('Item deleted successfully');
      } else {
        const errorData = await response.json().catch(() => ({}));
        showToast(`Failed to delete: ${errorData.error || 'Unknown error'}`, 'error');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      showToast('An error occurred while deleting item', 'error');
    }
  };

  const EmptyState = ({ message, icon: Icon }: { message: string, icon: any }) => (
    <div className="flex flex-col items-center justify-center py-16 text-black">
      <Icon className="text-6xl text-gray-300 mb-4" />
      <p className="text-lg font-bold">{message}</p>
    </div>
  );

  const renderTutors = () => (
    tutors.length === 0 ? <EmptyState message="No tutors found" icon={FaUsers} /> :
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50/50 backdrop-blur-sm">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">Name</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">Contact</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">Qualification</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-transparent">
          {tutors.map((tutor) => (
            <motion.tr key={tutor._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-blue-50/30 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-black">{tutor.fullName}</div>
                <div className="text-xs text-black">{tutor.specialization}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-black">{tutor.email}</div>
                <div className="text-xs text-black">{tutor.phone}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-black">{tutor.qualification}</div>
                <div className="text-xs text-black">{tutor.university}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${tutor.status === 'approved' ? 'bg-green-100 text-green-800 border border-green-200' :
                    tutor.status === 'rejected' ? 'bg-red-100 text-red-800 border border-red-200' :
                      'bg-yellow-100 text-yellow-800 border border-yellow-200'}`}>
                  {tutor.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                <button onClick={() => handleStatusChange('tutors', tutor._id, 'approved')} className="text-green-600 hover:text-green-800 bg-green-50 p-2 rounded-full transition-colors" title="Approve">
                  <FaCheck />
                </button>
                <button onClick={() => handleStatusChange('tutors', tutor._id, 'rejected')} className="text-red-600 hover:text-red-800 bg-red-50 p-2 rounded-full transition-colors" title="Reject">
                  <FaTimes />
                </button>
                <button onClick={() => handleDelete('tutors', tutor._id)} className="text-gray-900 hover:text-gray-700 bg-gray-100 p-2 rounded-full transition-colors" title="Delete">
                  <FaTrash />
                </button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderMeetings = () => (
    meetings.length === 0 ? <EmptyState message="No meetings scheduled" icon={FaVideo} /> :
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50/50 backdrop-blur-sm">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">Name</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">Contact</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">Schedule</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">Type</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-transparent">
          {meetings.map((meeting) => (
            <motion.tr key={meeting._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-blue-50/30 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-black">{meeting.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-black">{meeting.email}</div>
                <div className="text-xs text-black">{meeting.phone}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-black">{meeting.preferredDate || 'N/A'}</div>
                <div className="text-xs text-black">{meeting.preferredTime || ''}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                  {meeting.type}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${meeting.status === 'confirmed' ? 'bg-green-100 text-green-800 border border-green-200' :
                    meeting.status === 'cancelled' ? 'bg-red-100 text-red-800 border border-red-200' :
                      'bg-yellow-100 text-yellow-800 border border-yellow-200'}`}>
                  {meeting.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                <button onClick={() => handleStatusChange('meetings', meeting._id, 'confirmed')} className="text-green-600 hover:text-green-800 bg-green-50 p-2 rounded-full transition-colors" title="Confirm">
                  <FaCheck />
                </button>
                <button onClick={() => handleStatusChange('meetings', meeting._id, 'cancelled')} className="text-red-600 hover:text-red-800 bg-red-50 p-2 rounded-full transition-colors" title="Cancel">
                  <FaTimes />
                </button>
                <button onClick={() => handleDelete('meetings', meeting._id)} className="text-gray-900 hover:text-gray-700 bg-gray-100 p-2 rounded-full transition-colors" title="Delete">
                  <FaTrash />
                </button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderClasses = () => (
    classes.length === 0 ? <EmptyState message="No classes scheduled" icon={FaGraduationCap} /> :
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50/50 backdrop-blur-sm">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">Student</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">Contact</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">Course</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">Schedule</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-transparent">
          {classes.map((classSchedule) => (
            <motion.tr key={classSchedule._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-blue-50/30 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-black">{classSchedule.studentName}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-black">{classSchedule.email}</div>
                <div className="text-xs text-black">{classSchedule.phone}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-black">{classSchedule.courseName}</div>
                <div className="text-xs text-black">{classSchedule.subjects.join(', ')}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-black">{classSchedule.preferredDays.join(', ')}</div>
                <div className="text-xs text-black">{classSchedule.preferredTime}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${classSchedule.status === 'confirmed' ? 'bg-green-100 text-green-800 border border-green-200' :
                    classSchedule.status === 'cancelled' ? 'bg-red-100 text-red-800 border border-red-200' :
                      'bg-yellow-100 text-yellow-800 border border-yellow-200'}`}>
                  {classSchedule.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                <button onClick={() => handleStatusChange('schedule-class', classSchedule._id, 'confirmed')} className="text-green-600 hover:text-green-800 bg-green-50 p-2 rounded-full transition-colors" title="Confirm">
                  <FaCheck />
                </button>
                <button onClick={() => handleStatusChange('schedule-class', classSchedule._id, 'cancelled')} className="text-red-600 hover:text-red-800 bg-red-50 p-2 rounded-full transition-colors" title="Cancel">
                  <FaTimes />
                </button>
                <button onClick={() => handleDelete('schedule-class', classSchedule._id)} className="text-gray-900 hover:text-gray-700 bg-gray-100 p-2 rounded-full transition-colors" title="Delete">
                  <FaTrash />
                </button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderSubscribers = () => (
    subscribers.length === 0 ? <EmptyState message="No subscribers yet" icon={FaEnvelope} /> :
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50/50 backdrop-blur-sm">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">Email</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">Subscribed At</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-transparent">
          {subscribers.map((subscriber) => (
            <motion.tr key={subscriber._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-blue-50/30 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-black">{subscriber.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${subscriber.subscribed ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                  {subscriber.subscribed ? 'Subscribed' : 'Unsubscribed'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-black">
                  {new Date(subscriber.subscribedAt).toLocaleDateString()}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onClick={() => handleDelete('newsletter', subscriber._id)} className="text-gray-900 hover:text-gray-700 bg-gray-100 p-2 rounded-full transition-colors" title="Delete">
                  <FaTrash />
                </button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderMaterials = () => {
    const filteredMaterials = materials.filter(m => {
      const matchSubject = !materialFilter.subject || m.subject === materialFilter.subject;
      const matchClass = !materialFilter.className || m.className === materialFilter.className;
      return matchSubject && matchClass;
    });

    return (
      <div className="text-black">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex-1">
            <h3 className="text-3xl font-black text-black mb-2">Learning Materials</h3>
            <div className="flex items-center space-x-2 group">
              <input 
                type="text" 
                value={materialsSectionDesc}
                onChange={(e) => setMaterialsSectionDesc(e.target.value)}
                placeholder="Enter section description..."
                className="text-sm text-black font-bold bg-transparent border-b border-transparent hover:border-black focus:border-black outline-none transition-all w-full max-w-xl placeholder:text-black/40"
              />
            </div>
          </div>
          <button 
            onClick={() => setIsAddingMaterial(true)} 
            className="bg-black hover:bg-gray-800 transition-all text-white px-8 py-4 rounded-2xl flex items-center font-black shadow-[0_10px_20px_rgba(0,0,0,0.15)] transform hover:-translate-y-1 active:scale-95"
          >
            <FaPlus className="mr-2" /> Add New Material
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 p-4 bg-white/50 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-bold text-black uppercase tracking-tight">Subject:</label>
            <select 
              className="p-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black transition-all text-black font-medium min-w-[150px]"
              value={materialFilter.subject}
              onChange={e => setMaterialFilter({ ...materialFilter, subject: e.target.value })}
            >
              <option value="">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="English">English</option>
              <option value="Computer Science">Computer Science</option>
              <option value="History">History</option>
              <option value="Geography">Geography</option>
              <option value="Economics">Economics</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-bold text-black uppercase tracking-tight">Class:</label>
            <select 
              className="p-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black transition-all text-black font-medium min-w-[150px]"
              value={materialFilter.className}
              onChange={e => setMaterialFilter({ ...materialFilter, className: e.target.value })}
            >
              <option value="">All Classes</option>
              {Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`).map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
          {(materialFilter.subject || materialFilter.className) && (
            <button 
              onClick={() => setMaterialFilter({ subject: '', className: '' })}
              className="text-sm font-bold text-black hover:underline px-2"
            >
              Clear Filters
            </button>
          )}
        </div>

        <AnimatePresence>
          {isAddingMaterial && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-10"
            >
              <form onSubmit={handleAddMaterial} className="p-8 border border-gray-200 rounded-2xl bg-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-black"></div>
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-xl font-bold text-black">Add New Material</h4>
                  <button type="button" onClick={() => setIsAddingMaterial(false)} className="text-gray-400 hover:text-black transition-colors">
                    <FaTimes size={20} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-black uppercase tracking-wider">Title</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Introduction to Calculus" 
                      className="w-full p-3.5 border-2 border-black rounded-xl focus:ring-4 focus:ring-black/5 outline-none text-black placeholder:text-black font-black bg-white" 
                      value={newMaterial.title} 
                      onChange={e => setNewMaterial({ ...newMaterial, title: e.target.value })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-black uppercase tracking-wider">Type</label>
                    <select 
                      className="w-full p-3.5 border-2 border-black rounded-xl focus:ring-4 focus:ring-black/5 outline-none text-black font-black bg-white cursor-pointer" 
                      value={newMaterial.type} 
                      onChange={e => setNewMaterial({ ...newMaterial, type: e.target.value as 'PDF' | 'Video' | 'Link' })}
                    >
                      <option value="PDF" className="font-black text-black">PDF Document</option>
                      <option value="Video" className="font-black text-black">Video Lesson</option>
                      <option value="Link" className="font-black text-black">External Link / URL</option>
                    </select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-black uppercase tracking-wider">Description</label>
                    <textarea 
                      placeholder="Provide a brief overview of this material..." 
                      className="w-full p-3.5 border-2 border-black rounded-xl focus:ring-4 focus:ring-black/5 outline-none text-black placeholder:text-black font-black bg-white min-h-[100px]" 
                      value={newMaterial.description} 
                      onChange={e => setNewMaterial({ ...newMaterial, description: e.target.value })} 
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-black uppercase tracking-wider">
                      {newMaterial.type === 'Link' ? 'External URL' : 'Upload File / URL'}
                    </label>
                    {newMaterial.type === 'Link' ? (
                      <input 
                        type="url" 
                        placeholder="https://example.com/resource" 
                        required 
                        className="w-full p-3.5 border-2 border-black rounded-xl focus:ring-4 focus:ring-black/5 outline-none text-black placeholder:text-black font-black bg-white" 
                        value={newMaterial.url} 
                        onChange={e => setNewMaterial({ ...newMaterial, url: e.target.value })} 
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/30 hover:bg-gray-50 transition-all group">
                        {newMaterial.url ? (
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                              <FaCheck size={20} />
                            </div>
                            <span className="text-sm font-bold text-black">File Ready to Save</span>
                            <button 
                              type="button" 
                              onClick={() => setNewMaterial({ ...newMaterial, url: '' })}
                              className="text-xs text-red-500 font-bold mt-2 hover:underline"
                            >
                              Remove and change
                            </button>
                          </div>
                        ) : (
                          <>
                            <UploadButton
                              endpoint={newMaterial.type === 'PDF' ? "pdfUploader" : "videoUploader"}
                              onClientUploadComplete={(res) => {
                                if (res && res[0]) setNewMaterial({ ...newMaterial, url: res[0].url });
                              }}
                              onUploadError={(error: Error) => showToast(`Upload failed: ${error.message}`, 'error')}
                              appearance={{
                                button: "bg-black px-8 py-3 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-md active:scale-95",
                                allowedContent: "text-xs text-black font-bold mt-3 opacity-60"
                              }}
                            />
                            <p className="mt-3 text-xs text-black font-medium opacity-50">Max file size: {newMaterial.type === 'PDF' ? '16MB' : '128MB'}</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-black uppercase tracking-wider">Subject</label>
                    <select 
                      required 
                      className="w-full p-3.5 border-2 border-black rounded-xl focus:ring-4 focus:ring-black/5 outline-none text-black font-black bg-white cursor-pointer" 
                      value={newMaterial.subject} 
                      onChange={e => setNewMaterial({ ...newMaterial, subject: e.target.value })}
                    >
                      <option value="" disabled className="text-black font-black">Select Subject</option>
                      <option value="Mathematics" className="text-black font-black">Mathematics</option>
                      <option value="Science" className="text-black font-black">Science</option>
                      <option value="Physics" className="text-black font-black">Physics</option>
                      <option value="Chemistry" className="text-black font-black">Chemistry</option>
                      <option value="Biology" className="text-black font-black">Biology</option>
                      <option value="English" className="text-black font-black">English</option>
                      <option value="Computer Science" className="text-black font-black">Computer Science</option>
                      <option value="History" className="text-black font-black">History</option>
                      <option value="Geography" className="text-black font-black">Geography</option>
                      <option value="Economics" className="text-black font-black">Economics</option>
                      <option value="Social Studies" className="text-black font-black">Social Studies</option>
                      <option value="Hindi" className="text-black font-black">Hindi</option>
                      <option value="Sanskrit" className="text-black font-black">Sanskrit</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-black uppercase tracking-wider">Class / Grade</label>
                    <select 
                      required 
                      className="w-full p-3.5 border-2 border-black rounded-xl focus:ring-4 focus:ring-black/5 outline-none text-black font-black bg-white cursor-pointer" 
                      value={newMaterial.className} 
                      onChange={e => setNewMaterial({ ...newMaterial, className: e.target.value })}
                    >
                      <option value="" disabled className="text-black font-black">Select Class</option>
                      {Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`).map(cls => (
                        <option key={cls} value={cls} className="text-black font-black">{cls}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-black uppercase tracking-wider">Board</label>
                    <select 
                      className="w-full p-3.5 border-2 border-black rounded-xl focus:ring-4 focus:ring-black/5 outline-none text-black font-black bg-white cursor-pointer" 
                      value={newMaterial.board} 
                      onChange={e => setNewMaterial({ ...newMaterial, board: e.target.value })}
                    >
                      <option value="CBSE" className="text-black font-black">CBSE</option>
                      <option value="ICSE" className="text-black font-black">ICSE</option>
                      <option value="State Board" className="text-black font-black">State Board</option>
                      <option value="Other" className="text-black font-black">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-black uppercase tracking-wider">Folder (Optional)</label>
                    <input 
                      type="text" 
                      list="board-folders" 
                      placeholder="e.g. Chapter 1" 
                      className="w-full p-3.5 border-2 border-black rounded-xl focus:ring-4 focus:ring-black/5 outline-none text-black placeholder:text-black font-black bg-white" 
                      value={newMaterial.folderName} 
                      onChange={e => setNewMaterial({ ...newMaterial, folderName: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="mt-10 flex justify-end space-x-4 border-t pt-6">
                  <button 
                    type="button" 
                    onClick={() => setIsAddingMaterial(false)} 
                    className="px-6 py-3 rounded-xl text-black font-bold hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-black hover:bg-gray-800 transition-all text-white px-8 py-3 rounded-xl font-bold shadow-lg active:scale-95"
                  >
                    Save Material
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {filteredMaterials.length === 0 ? <EmptyState message={materials.length === 0 ? "No learning materials added yet" : "No materials match your filters"} icon={FaBookOpen} /> :
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-widest">Material Info</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-widest">Details</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-widest">Folder</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-black uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredMaterials.map((m) => (
                    <motion.tr key={m._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-start">
                          <div className={`p-2.5 rounded-lg mr-4 ${
                            m.type === 'PDF' ? 'bg-red-50 text-red-600' : 
                            m.type === 'Video' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                          }`}>
                            {m.type === 'PDF' ? <FaFileAlt /> : m.type === 'Video' ? <FaVideo /> : <FaBookOpen />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-base font-bold text-black mb-1 group-hover:text-black">{m.title}</div>
                            {m.description && <div className="text-sm text-black opacity-60 line-clamp-2 max-w-md font-medium">{m.description}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-black">{m.subject}</span>
                          <span className="text-xs font-bold text-black opacity-60">{m.className} • {m.board || 'Any'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-sm font-bold text-black">{m.folderName || '—'}</div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <a 
                            href={m.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="p-2 text-black hover:bg-black hover:text-white rounded-lg transition-all"
                            title="View Content"
                          >
                            <FaBookOpen size={14} />
                          </a>
                          <button 
                            onClick={() => handleDelete('admin/materials', m._id)} 
                            className="p-2 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all" 
                            title="Delete Material"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        }
      </div>
    );
  };

  const renderExams = () => {
    const filteredExams = exams.filter(e => {
      const matchSubject = !examFilter.subject || e.subject === examFilter.subject;
      const matchClass = !examFilter.className || e.className === examFilter.className;
      return matchSubject && matchClass;
    });

    return (
      <div className="text-black">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex-1">
            <h3 className="text-3xl font-black text-black mb-2">Practice Exams</h3>
            <div className="flex items-center space-x-2 group">
              <input 
                type="text" 
                value={examsSectionDesc}
                onChange={(e) => setExamsSectionDesc(e.target.value)}
                placeholder="Enter section description..."
                className="text-sm text-black font-bold bg-transparent border-b border-transparent hover:border-black focus:border-black outline-none transition-all w-full max-w-xl placeholder:text-black/40"
              />
            </div>
          </div>
          <button 
            onClick={() => setIsAddingExam(true)} 
            className="bg-black hover:bg-gray-800 transition-all text-white px-8 py-4 rounded-2xl flex items-center font-black shadow-[0_10px_20px_rgba(0,0,0,0.15)] transform hover:-translate-y-1 active:scale-95"
          >
            <FaPlus className="mr-2" /> Create New Exam
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 p-4 bg-white/50 backdrop-blur-md rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-black text-black uppercase tracking-tight">Subject:</label>
            <select 
              className="p-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black transition-all text-black font-black min-w-[150px]"
              value={examFilter.subject}
              onChange={e => setExamFilter({ ...examFilter, subject: e.target.value })}
            >
              <option value="">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="English">English</option>
              <option value="Computer Science">Computer Science</option>
              <option value="History">History</option>
              <option value="Geography">Geography</option>
              <option value="Economics">Economics</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-black text-black uppercase tracking-tight">Class:</label>
            <select 
              className="p-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-black transition-all text-black font-black min-w-[150px]"
              value={examFilter.className}
              onChange={e => setExamFilter({ ...examFilter, className: e.target.value })}
            >
              <option value="">All Classes</option>
              {Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`).map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
        </div>

        <AnimatePresence>
          {isAddingExam && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-10"
            >
              <form onSubmit={handleAddExam} className="p-8 border border-gray-200 rounded-2xl bg-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-black"></div>
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-xl font-black text-black">Create New Exam</h4>
                  <button type="button" onClick={() => setIsAddingExam(false)} className="text-gray-400 hover:text-black transition-colors">
                    <FaTimes size={20} />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-black uppercase tracking-wider">Exam Title</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Mid-Term Math Quiz" 
                      className="w-full p-3.5 border-2 border-black rounded-xl focus:ring-4 focus:ring-black/5 outline-none text-black placeholder:text-black font-black bg-white" 
                      value={newExam.title} 
                      onChange={e => setNewExam({ ...newExam, title: e.target.value })} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-black uppercase tracking-wider">Duration (minutes)</label>
                    <input 
                      type="number" 
                      required 
                      className="w-full p-3.5 border-2 border-black rounded-xl focus:ring-4 focus:ring-black/5 outline-none text-black font-black bg-white" 
                      value={newExam.duration} 
                      onChange={e => setNewExam({ ...newExam, duration: parseInt(e.target.value) })} 
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-black text-black uppercase tracking-wider">Description</label>
                    <textarea 
                      placeholder="Provide a brief overview of this exam..." 
                      className="w-full p-3.5 border-2 border-black rounded-xl focus:ring-4 focus:ring-black/5 outline-none text-black placeholder:text-black font-black bg-white min-h-[100px]" 
                      value={newExam.description} 
                      onChange={e => setNewExam({ ...newExam, description: e.target.value })} 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-black text-black uppercase tracking-wider">Subject</label>
                    <select 
                      required 
                      className="w-full p-3.5 border-2 border-black rounded-xl focus:ring-4 focus:ring-black/5 outline-none text-black font-black bg-white cursor-pointer" 
                      value={newExam.subject} 
                      onChange={e => setNewExam({ ...newExam, subject: e.target.value })}
                    >
                      <option value="" disabled className="text-black font-black">Select Subject</option>
                      <option value="Mathematics" className="text-black font-black">Mathematics</option>
                      <option value="Science" className="text-black font-black">Science</option>
                      <option value="Physics" className="text-black font-black">Physics</option>
                      <option value="Chemistry" className="text-black font-black">Chemistry</option>
                      <option value="Biology" className="text-black font-black">Biology</option>
                      <option value="English" className="text-black font-black">English</option>
                      <option value="Computer Science" className="text-black font-black">Computer Science</option>
                      <option value="History" className="text-black font-black">History</option>
                      <option value="Geography" className="text-black font-black">Geography</option>
                      <option value="Economics" className="text-black font-black">Economics</option>
                      <option value="Social Studies" className="text-black font-black">Social Studies</option>
                      <option value="Hindi" className="text-black font-black">Hindi</option>
                      <option value="Sanskrit" className="text-black font-black">Sanskrit</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-black uppercase tracking-wider">Class / Grade</label>
                    <select 
                      required 
                      className="w-full p-3.5 border-2 border-black rounded-xl focus:ring-4 focus:ring-black/5 outline-none text-black font-black bg-white cursor-pointer" 
                      value={newExam.className} 
                      onChange={e => setNewExam({ ...newExam, className: e.target.value })}
                    >
                      <option value="" disabled className="text-black font-black">Select Class</option>
                      {Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`).map(cls => (
                        <option key={cls} value={cls} className="text-black font-black">{cls}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-black uppercase tracking-wider">Exam Type</label>
                    <select 
                      className="w-full p-3.5 border-2 border-black rounded-xl focus:ring-4 focus:ring-black/5 outline-none text-black font-black bg-white cursor-pointer" 
                      value={newExam.examType} 
                      onChange={e => setNewExam({ ...newExam, examType: e.target.value as 'daily' | 'most-probable' })}
                    >
                      <option value="daily" className="text-black font-black">Daily Practice</option>
                      <option value="most-probable" className="text-black font-black">Most Probable (Excel Import)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-black uppercase tracking-wider">Folder / Chapter (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Chapter 1: Force" 
                      className="w-full p-3.5 border-2 border-black rounded-xl focus:ring-4 focus:ring-black/5 outline-none text-black placeholder:text-black font-black bg-white" 
                      value={newExam.folderName} 
                      onChange={e => setNewExam({ ...newExam, folderName: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="mt-8 p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-center">
                  <h5 className="font-black text-black mb-2">Bulk Import from Excel</h5>
                  <p className="text-xs text-black opacity-60 mb-4 font-medium">Download template or upload your file (Format: Question, Opt1, Opt2, Opt3, Opt4, CorrectIdx, Explanation)</p>
                  <input 
                    type="file" 
                    id="excel-upload"
                    className="hidden" 
                    accept=".xlsx, .xls"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = async (evt) => {
                        try {
                          const { read, utils } = await import('xlsx');
                          const bstr = evt.target?.result;
                          const wb = read(bstr, { type: 'binary' });
                          const wsname = wb.SheetNames[0];
                          const ws = wb.Sheets[wsname];
                          const data = utils.sheet_to_json(ws, { header: 1 }) as any[][];
                          const questions = data.slice(1).map(row => ({
                            question: row[0]?.toString() || '',
                            options: [row[1]?.toString() || '', row[2]?.toString() || '', row[3]?.toString() || '', row[4]?.toString() || ''],
                            correctOption: parseInt(row[5]) || 0,
                            explanation: row[6]?.toString() || ''
                          })).filter(q => q.question);
                          setNewExam(prev => ({ ...prev, questions }));
                          showToast(`Imported ${questions.length} questions successfully!`);
                        } catch (err) {
                          showToast('Failed to parse Excel file', 'error');
                        }
                      };
                      reader.readAsBinaryString(file);
                    }}
                  />
                  <button 
                    type="button"
                    onClick={() => document.getElementById('excel-upload')?.click()}
                    className="bg-white border-2 border-black text-black px-6 py-2.5 rounded-xl font-black hover:bg-black hover:text-white transition-all shadow-sm flex items-center mx-auto"
                  >
                    <FaFileAlt className="mr-2" /> Upload Excel File
                  </button>
                </div>

                {/* Questions Section */}
                <div className="mt-8 space-y-6">
                  <div className="flex justify-between items-center border-b pb-4">
                    <h5 className="font-black text-black uppercase tracking-widest text-sm">Exam Questions</h5>
                    <button 
                      type="button"
                      onClick={() => setNewExam({
                        ...newExam,
                        questions: [...newExam.questions, { question: '', options: ['', '', '', ''], correctOption: 0 }]
                      })}
                      className="text-xs font-black bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-all"
                    >
                      + Add Question
                    </button>
                  </div>

                  {newExam.questions.map((q, qIdx) => (
                    <div key={qIdx} className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-4">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-black text-black bg-white px-3 py-1 rounded-full border border-gray-100">Question {qIdx + 1}</span>
                        {newExam.questions.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => {
                              const updated = [...newExam.questions];
                              updated.splice(qIdx, 1);
                              setNewExam({ ...newExam, questions: updated });
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTrash size={12} />
                          </button>
                        )}
                      </div>
                      <input 
                        type="text" 
                        required 
                        placeholder="Enter question text..." 
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none text-black placeholder:text-black font-black bg-white" 
                        value={q.question}
                        onChange={e => {
                          const updated = [...newExam.questions];
                          updated[qIdx].question = e.target.value;
                          setNewExam({ ...newExam, questions: updated });
                        }}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center space-x-3">
                            <input 
                              type="radio" 
                              name={`correct-${qIdx}`} 
                              checked={q.correctOption === oIdx}
                              onChange={() => {
                                const updated = [...newExam.questions];
                                updated[qIdx].correctOption = oIdx;
                                setNewExam({ ...newExam, questions: updated });
                              }}
                              className="w-4 h-4 text-black focus:ring-black"
                            />
                            <input 
                              type="text" 
                              required 
                              placeholder={`Option ${oIdx + 1}`} 
                              className="flex-1 p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none text-black placeholder:text-black font-black bg-white" 
                              value={opt}
                              onChange={e => {
                                const updated = [...newExam.questions];
                                updated[qIdx].options[oIdx] = e.target.value;
                                setNewExam({ ...newExam, questions: updated });
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-10 flex justify-end space-x-4 border-t pt-6">
                  <button 
                    type="button" 
                    onClick={() => setIsAddingExam(false)} 
                    className="px-6 py-3 rounded-xl text-black font-black hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-black hover:bg-gray-800 transition-all text-white px-8 py-3 rounded-xl font-black shadow-lg active:scale-95"
                  >
                    Save Exam
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {filteredExams.length === 0 ? <EmptyState message={exams.length === 0 ? "No exams created yet" : "No exams match your filters"} icon={FaFileAlt} /> :
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam) => (
              <motion.div 
                key={exam._id} 
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-gray-50 rounded-xl text-black group-hover:bg-black group-hover:text-white transition-all">
                    <FaFileAlt />
                  </div>
                  <button 
                    onClick={() => handleDelete('admin/exams', exam._id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
                <h4 className="text-lg font-black text-black mb-2">{exam.title}</h4>
                <div className="space-y-1 mb-4">
                  <p className="text-sm font-black text-black opacity-60">{exam.subject} • {exam.className}</p>
                  <p className="text-xs font-black text-black opacity-40">{exam.questions.length} Questions • {exam.duration} mins</p>
                </div>
                <div className="flex items-center text-xs font-black text-black bg-gray-50 px-3 py-2 rounded-lg">
                  <FaCheck className="mr-2 text-green-500" /> Exam Published
                </div>
              </motion.div>
            ))}
          </div>
        }
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <FaSpinner className="animate-spin text-blue-600 text-4xl mb-4" />
        <h2 className="text-xl font-medium text-black">Loading Dashboard...</h2>
      </div>
    );
  }

  const tabs = [
    { id: 'tutors', label: 'Tutors', icon: FaUsers },
    { id: 'meetings', label: 'Meetings', icon: FaVideo },
    { id: 'classes', label: 'Classes', icon: FaGraduationCap },
    { id: 'subscribers', label: 'Subscribers', icon: FaEnvelope },
    { id: 'materials', label: 'Materials', icon: FaBookOpen },
    { id: 'exams', label: 'Exams', icon: FaFileAlt },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-32 pb-12">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-black">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-black font-medium">Manage your academy's data, users, and content from a centralized platform.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Tutors', value: stats.totalTutors, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
            { label: 'Total Meetings', value: stats.totalMeetings, color: 'from-purple-500 to-purple-600', shadow: 'shadow-purple-500/20' },
            { label: 'Total Classes', value: stats.totalClasses, color: 'from-orange-500 to-orange-600', shadow: 'shadow-orange-500/20' },
            { label: 'Subscribers', value: stats.totalSubscribers, color: 'from-green-500 to-green-600', shadow: 'shadow-green-500/20' }
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`bg-gradient-to-r ${stat.color} rounded-2xl p-6 shadow-lg ${stat.shadow} text-white relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl pointer-events-none"></div>
              <p className="text-sm font-black uppercase tracking-tight opacity-90 mb-1">{stat.label}</p>
              <h3 className="text-4xl font-black">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-2 mb-8 inline-flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-black hover:bg-gray-100 hover:text-black'
              }`}
            >
              <tab.icon className={`mr-2 ${activeTab === tab.id ? 'text-white' : 'text-black'}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white/90 backdrop-blur-xl shadow-xl rounded-2xl border border-gray-100 overflow-hidden"
        >
          <div className="p-6 md:p-8">
            {activeTab === 'tutors' && renderTutors()}
            {activeTab === 'meetings' && renderMeetings()}
            {activeTab === 'classes' && renderClasses()}
            {activeTab === 'subscribers' && renderSubscribers()}
            {activeTab === 'materials' && renderMaterials()}
            {activeTab === 'exams' && renderExams()}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
