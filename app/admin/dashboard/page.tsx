'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTrash, FaCheck, FaTimes } from 'react-icons/fa';

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

export default function AdminDashboard() {
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
  const [materials, setMaterials] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'tutors' | 'meetings' | 'classes' | 'subscribers' | 'materials' | 'exams'>('tutors');
  const [isAddingMaterial, setIsAddingMaterial] = useState(false);
  const [isAddingExam, setIsAddingExam] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ title: '', type: 'pdf', url: '', subject: '', class: '' });
  const [newExam, setNewExam] = useState({ title: '', subject: '', class: '', duration: 30, questions: [{ question: '', options: ['', '', '', ''], correctOption: 0 }] });

  useEffect(() => {
    verifyAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyAuth = async () => {
    try {
      const response = await fetch('/api/admin/verify');
      const data = await response.json();
      
      if (!data.success) {
        window.location.href = '/admin/login';
        return;
      }
      
      fetchAllData();
    } catch (error) {
      console.error('Auth verification failed:', error);
      window.location.href = '/admin/login';
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
        setNewMaterial({ title: '', type: 'pdf', url: '', subject: '', class: '' });
        fetchAllData();
      }
    } catch (error) {
      console.error('Error adding material:', error);
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
        setNewExam({ title: '', subject: '', class: '', duration: 30, questions: [{ question: '', options: ['', '', '', ''], correctOption: 0 }] });
        fetchAllData();
      }
    } catch (error) {
      console.error('Error adding exam:', error);
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
        fetchAllData(); // Refresh data after status change
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDelete = async (collection: string, id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const url = collection.startsWith('admin/') ? `/api/${collection}/${id}` : `/api/${collection}/${id}`;
      const response = await fetch(url, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchAllData(); // Refresh data after deletion
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const renderTutors = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qualification</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {tutors.map((tutor) => (
            <tr key={tutor._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{tutor.fullName}</div>
                <div className="text-sm text-gray-500">{tutor.specialization}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{tutor.email}</div>
                <div className="text-sm text-gray-500">{tutor.phone}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{tutor.qualification}</div>
                <div className="text-sm text-gray-500">{tutor.university}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${tutor.status === 'approved' ? 'bg-green-100 text-green-800' : 
                    tutor.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'}`}>
                  {tutor.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button onClick={() => handleStatusChange('tutors', tutor._id, 'approved')} 
                        className="text-green-600 hover:text-green-900">
                  <FaCheck />
                </button>
                <button onClick={() => handleStatusChange('tutors', tutor._id, 'rejected')}
                        className="text-red-600 hover:text-red-900">
                  <FaTimes />
                </button>
                <button onClick={() => handleDelete('tutors', tutor._id)}
                        className="text-red-600 hover:text-red-900">
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderMeetings = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {meetings.map((meeting) => (
            <tr key={meeting._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{meeting.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{meeting.email}</div>
                <div className="text-sm text-gray-500">{meeting.phone}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{meeting.preferredDate}</div>
                <div className="text-sm text-gray-500">{meeting.preferredTime}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {meeting.type}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${meeting.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                    meeting.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'}`}>
                  {meeting.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button onClick={() => handleStatusChange('meetings', meeting._id, 'confirmed')}
                        className="text-green-600 hover:text-green-900">
                  <FaCheck />
                </button>
                <button onClick={() => handleStatusChange('meetings', meeting._id, 'cancelled')}
                        className="text-red-600 hover:text-red-900">
                  <FaTimes />
                </button>
                <button onClick={() => handleDelete('meetings', meeting._id)}
                        className="text-red-600 hover:text-red-900">
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderClasses = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {classes.map((classSchedule) => (
            <tr key={classSchedule._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{classSchedule.studentName}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{classSchedule.email}</div>
                <div className="text-sm text-gray-500">{classSchedule.phone}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{classSchedule.courseName}</div>
                <div className="text-sm text-gray-500">{classSchedule.subjects.join(', ')}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{classSchedule.preferredDays.join(', ')}</div>
                <div className="text-sm text-gray-500">{classSchedule.preferredTime}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${classSchedule.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                    classSchedule.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'}`}>
                  {classSchedule.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button onClick={() => handleStatusChange('schedule-class', classSchedule._id, 'confirmed')}
                        className="text-green-600 hover:text-green-900">
                  <FaCheck />
                </button>
                <button onClick={() => handleStatusChange('schedule-class', classSchedule._id, 'cancelled')}
                        className="text-red-600 hover:text-red-900">
                  <FaTimes />
                </button>
                <button onClick={() => handleDelete('schedule-class', classSchedule._id)}
                        className="text-red-600 hover:text-red-900">
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderSubscribers = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscribed At</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {subscribers.map((subscriber) => (
            <tr key={subscriber._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{subscriber.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${subscriber.subscribed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {subscriber.subscribed ? 'Subscribed' : 'Unsubscribed'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {new Date(subscriber.subscribedAt).toLocaleDateString()}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onClick={() => handleDelete('newsletter', subscriber._id)}
                        className="text-red-600 hover:text-red-900">
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderMaterials = () => (
    <div>
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-medium">Learning Materials</h3>
        <button onClick={() => setIsAddingMaterial(true)} className="bg-blue-600 text-white px-4 py-2 rounded">Add Material</button>
      </div>

      {isAddingMaterial && (
        <form onSubmit={handleAddMaterial} className="mb-6 p-4 border rounded bg-gray-50">
          <div className="grid grid-cols-2 gap-4">
            <input type="text" placeholder="Title" required className="p-2 border rounded" value={newMaterial.title} onChange={e => setNewMaterial({...newMaterial, title: e.target.value})} />
            <select className="p-2 border rounded" value={newMaterial.type} onChange={e => setNewMaterial({...newMaterial, type: e.target.value as any})}>
              <option value="pdf">PDF</option>
              <option value="video">Video</option>
              <option value="note">Note</option>
            </select>
            <input type="text" placeholder="URL" required className="p-2 border rounded" value={newMaterial.url} onChange={e => setNewMaterial({...newMaterial, url: e.target.value})} />
            <input type="text" placeholder="Subject" required className="p-2 border rounded" value={newMaterial.subject} onChange={e => setNewMaterial({...newMaterial, subject: e.target.value})} />
            <input type="text" placeholder="Class" required className="p-2 border rounded" value={newMaterial.class} onChange={e => setNewMaterial({...newMaterial, class: e.target.value})} />
          </div>
          <div className="mt-4 flex space-x-2">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
            <button type="button" onClick={() => setIsAddingMaterial(false)} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject/Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {materials.map((m) => (
              <tr key={m._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{m.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 uppercase">{m.type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.subject} - {m.class}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => handleDelete('admin/materials', m._id)} className="text-red-600 hover:text-red-900"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderExams = () => (
    <div>
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-medium">Practice Exams</h3>
        <button onClick={() => setIsAddingExam(true)} className="bg-blue-600 text-white px-4 py-2 rounded">Add Exam</button>
      </div>

      {isAddingExam && (
        <form onSubmit={handleAddExam} className="mb-6 p-4 border rounded bg-gray-50">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input type="text" placeholder="Exam Title" required className="p-2 border rounded" value={newExam.title} onChange={e => setNewExam({...newExam, title: e.target.value})} />
            <input type="text" placeholder="Subject" required className="p-2 border rounded" value={newExam.subject} onChange={e => setNewExam({...newExam, subject: e.target.value})} />
            <input type="text" placeholder="Class" required className="p-2 border rounded" value={newExam.class} onChange={e => setNewExam({...newExam, class: e.target.value})} />
            <input type="number" placeholder="Duration (mins)" required className="p-2 border rounded" value={newExam.duration} onChange={e => setNewExam({...newExam, duration: parseInt(e.target.value)})} />
          </div>
          
          <div className="space-y-4 mb-4">
            <h4 className="font-medium">Questions</h4>
            {newExam.questions.map((q, idx) => (
              <div key={idx} className="p-3 border rounded bg-white">
                <input type="text" placeholder={`Question ${idx + 1}`} required className="w-full p-2 border rounded mb-2" value={q.question} onChange={e => {
                  const qs = [...newExam.questions];
                  qs[idx].question = e.target.value;
                  setNewExam({...newExam, questions: qs});
                }} />
                <div className="grid grid-cols-2 gap-2">
                  {q.options.map((opt, oIdx) => (
                    <input key={oIdx} type="text" placeholder={`Option ${oIdx + 1}`} required className="p-2 border rounded" value={opt} onChange={e => {
                      const qs = [...newExam.questions];
                      qs[idx].options[oIdx] = e.target.value;
                      setNewExam({...newExam, questions: qs});
                    }} />
                  ))}
                </div>
                <select className="mt-2 p-2 border rounded" value={q.correctOption} onChange={e => {
                  const qs = [...newExam.questions];
                  qs[idx].correctOption = parseInt(e.target.value);
                  setNewExam({...newExam, questions: qs});
                }}>
                  <option value={0}>Option 1 is correct</option>
                  <option value={1}>Option 2 is correct</option>
                  <option value={2}>Option 3 is correct</option>
                  <option value={3}>Option 4 is correct</option>
                </select>
              </div>
            ))}
            <button type="button" onClick={() => setNewExam({...newExam, questions: [...newExam.questions, { question: '', options: ['', '', '', ''], correctOption: 0 }]})} className="text-blue-600 text-sm underline">+ Add Question</button>
          </div>

          <div className="mt-4 flex space-x-2">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Save Exam</button>
            <button type="button" onClick={() => setIsAddingExam(false)} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject/Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {exams.map((e) => (
              <tr key={e._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{e.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{e.subject} - {e.class}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{e.questions.length}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => handleDelete('admin/exams', e._id)} className="text-red-600 hover:text-red-900"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 pt-40">
      <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-500 truncate">
                    Total Tutors
                  </div>
                  <div className="mt-1 text-3xl font-semibold text-gray-900">
                    {stats.totalTutors}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-500 truncate">
                    Total Meetings
                  </div>
                  <div className="mt-1 text-3xl font-semibold text-gray-900">
                    {stats.totalMeetings}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-500 truncate">
                    Total Classes
                  </div>
                  <div className="mt-1 text-3xl font-semibold text-gray-900">
                    {stats.totalClasses}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-500 truncate">
                    Newsletter Subscribers
                  </div>
                  <div className="mt-1 text-3xl font-semibold text-gray-900">
                    {stats.totalSubscribers}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="px-4 sm:px-0 mt-6">
          <div className="border-b border-gray-200 overflow-x-auto">
            <nav className="-mb-px flex space-x-8 min-w-max">
              <button
                onClick={() => setActiveTab('tutors')}
                className={`${
                  activeTab === 'tutors'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Tutors
              </button>
              <button
                onClick={() => setActiveTab('meetings')}
                className={`${
                  activeTab === 'meetings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Meetings
              </button>
              <button
                onClick={() => setActiveTab('classes')}
                className={`${
                  activeTab === 'classes'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Classes
              </button>
              <button
                onClick={() => setActiveTab('subscribers')}
                className={`${
                  activeTab === 'subscribers'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Subscribers
              </button>
              <button
                onClick={() => setActiveTab('materials')}
                className={`${
                  activeTab === 'materials'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Materials
              </button>
              <button
                onClick={() => setActiveTab('exams')}
                className={`${
                  activeTab === 'exams'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Exams
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="mt-6 bg-white shadow rounded-lg p-4">
          {activeTab === 'tutors' && renderTutors()}
          {activeTab === 'meetings' && renderMeetings()}
          {activeTab === 'classes' && renderClasses()}
          {activeTab === 'subscribers' && renderSubscribers()}
          {activeTab === 'materials' && renderMaterials()}
          {activeTab === 'exams' && renderExams()}
        </div>
      </main>
    </div>
  );
}
      </main>
    </div>
  );
}