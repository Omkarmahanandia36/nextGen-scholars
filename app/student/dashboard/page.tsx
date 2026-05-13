'use client';

import React, { useState, useEffect } from 'react';
import {
  IoBook, IoDocumentText, IoStatsChart,
  IoNotifications, IoPlay, IoArrowForward
} from 'react-icons/io5';
import Link from 'next/link';

interface Material {
  title: string;
  url: string;
  type: string;
  subject: string;
  createdAt: string;
}

interface Exam {
  title: string;
  subject: string;
}

interface DashboardData {
  user: {
    name: string;
    classLabel: string; // ✅ renamed
    subjects: string[];
  };
  recentMaterials: Material[];
  upcomingExams: Exam[];
  stats: {
    materialsCount: number;
    examsCount: number;
    completedExams: number;
  };
}

export default function StudentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/student/dashboard');
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!data) return <div className="p-6 text-center">No data available</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Main Content */}
      <main className="p-4 md:p-8">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {data.user.name}! 👋
            </h1>
            <p className="text-gray-500">
              {data.user.classLabel} {' • '} {data.user.subjects.join(', ')}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 text-gray-500 hover:text-blue-600 transition-all">
              <IoNotifications className="text-xl" />
            </button>

            <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center text-white font-bold shadow-lg">
              {data.user.name?.charAt(0) || 'S'}
            </div>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Materials"
            value={data.stats.materialsCount}
            icon={<IoBook className="text-blue-500" />}
            color="bg-blue-50"
          />
          <StatCard
            title="Available Exams"
            value={data.stats.examsCount}
            icon={<IoDocumentText className="text-blue-500" />}
            color="bg-blue-50"
          />
          <StatCard
            title="Completed"
            value={data.stats.completedExams}
            icon={<IoStatsChart className="text-purple-500" />}
            color="bg-purple-50"
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Materials */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Recent Materials</h2>
                <Link href="/student/materials" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                  View All
                </Link>
              </div>

              <div className="space-y-4">
                {data.recentMaterials?.length > 0 ? (
                  data.recentMaterials.map((material, i) => (
                    <a
                      key={i}
                      href={material.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-blue-50 transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                          {material.type === 'video'
                            ? <IoPlay className="text-blue-500" />
                            : <IoDocumentText className="text-blue-500" />}
                        </div>

                        <div>
                          <h3 className="font-semibold text-gray-900">{material.title}</h3>
                          <p className="text-xs text-gray-500">
                            {material.subject} {' • '} {new Date(material.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <button className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600">
                        <IoArrowForward className="text-xl" />
                      </button>
                    </a>
                  ))
                ) : (
                  <p className="text-center py-8 text-gray-500">
                    No materials available yet.
                  </p>
                )}
              </div>

            </div>
          </div>

          {/* Right Side */}
          <div className="space-y-6">

            {/* Practice */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-400 p-6 rounded-3xl text-white shadow-xl">
              <h2 className="text-xl font-bold mb-2">Practice Mode</h2>
              <p className="text-blue-50/80 text-sm mb-6">
                Master your subjects with daily exams and instant feedback.
              </p>

              <Link href="/student/practice">
                <button className="w-full py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors">
                  Take Daily Exam
                </button>
              </Link>
            </div>

            {/* Upcoming */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming</h2>

              <div className="space-y-4">
                {data.upcomingExams?.length > 0 ? (
                  data.upcomingExams.map((exam, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="h-2 w-2 rounded-full bg-blue-500" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{exam.title}</p>
                        <p className="text-xs text-gray-500">
                          {exam.subject} {' • '} Today
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    No exams scheduled for today.
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}

/* ---------- COMPONENT ---------- */

function StatCard({
  title,
  value,
  icon,
  color
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center space-x-4">
      <div className={`p-4 ${color} rounded-2xl`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}