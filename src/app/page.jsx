'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/config/supabase';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [courseGroups, setCourseGroups] = useState([]);
  const [courses, setCourses] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function initializeAndFetch() {
      try {
        setLoading(true);
        setError(null);

        // 1. Check current auth session
        let { data: { session } } = await supabase.auth.getSession();

        // 2. If no active session, perform automatic sign-in with test credentials
        if (!session) {
          const testEmail = process.env.NEXT_PUBLIC_TEST_EMAIL;
          const testPassword = process.env.NEXT_PUBLIC_TEST_PASS;

        // Replace this block inside initializeAndFetch in app/page.jsx:
        if (!testEmail || !testPassword) {
          throw new Error(
            'Missing NEXT_PUBLIC_TEST_EMAIL or NEXT_PUBLIC_TEST_PASS in .env file'
          );
        }

          const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword,
          });

          if (authErr) throw authErr;
          session = authData.session;
        }

        setUser(session?.user || null);

        // 3. Fetch Course Groups (Semesters) for this authenticated user
        const { data: groupsData, error: groupsErr } = await supabase
          .from('course_group')
          .select('*')
          .order('id', { ascending: true });

        if (groupsErr) throw groupsErr;

        // 4. Fetch Courses for this authenticated user
        const { data: coursesData, error: coursesErr } = await supabase
          .from('courses')
          .select('*')
          .order('id', { ascending: true });

        if (coursesErr) throw coursesErr;

        setCourseGroups(groupsData || []);
        setCourses(coursesData || []);
      } catch (err) {
        console.error('Error initializing app:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    initializeAndFetch();
  }, []);

  return (
    <div>
      {/* Navigation Header */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center">
        <div className="flex space-x-4">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm ${
              activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Dashboard View
          </button>
        </div>

        {/* User Info Badge */}
        {user && (
          <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 font-mono">
            Logged in as: <span className="font-semibold text-slate-700">{user.email}</span>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="p-8 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64 text-slate-500 font-medium">
            Signing in and loading your course data...
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 font-medium">
            Authentication or Data Error: {error}
          </div>
        ) : (
          <Dashboard courseGroups={courseGroups} courses={courses} />
        )}
      </main>
    </div>
  );
}

function Dashboard({ courseGroups, courses }) {
  if (courseGroups.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
        <h3 className="text-lg font-semibold text-slate-700">No semesters found</h3>
        <p className="text-slate-500 text-sm mt-1">
          Add a record to the `course_group` table in Supabase to display your semesters here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-slate-800">My Semesters</h1>
      {courseGroups.map(group => (
        <CourseGroupOutline key={group.id} group={group} courses={courses} />
      ))}
    </div>
  );
}

function CourseGroupOutline({ group, courses }) {
  const groupCourses = courses.filter(c => c.cgroup_id === group.id);

  return (
    <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 bg-slate-100/50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-700">{group.name}</h2>
        <button className="text-sm font-semibold text-blue-600 hover:underline">
          + Add Course
        </button>
      </div>
      
      {groupCourses.length === 0 ? (
        <p className="text-slate-400 text-sm italic">No courses added to this semester yet.</p>
      ) : (
        <div className="flex flex-wrap gap-6">
          {groupCourses.map(course => (
            <CourseSquareWidget key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}

function CourseSquareWidget({ course }) {
  return (
    <div className="w-64 h-64 bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer">
      <div>
        <h3 className="text-2xl font-black text-slate-800">
          {course.field} {course.level}
        </h3>
        <p className="text-slate-500 text-sm font-medium mt-1">
          Target: {course.target}%
        </p>
      </div>

      <div className="text-center">
        <span className="text-5xl font-bold text-blue-600">
          {course.currentGrade ? `${Number(course.currentGrade).toFixed(1)}%` : '---'}
        </span>
        <p className="text-xs text-slate-400 mt-2 font-medium uppercase tracking-wide">
          Current Average
        </p>
      </div>

      <div className="w-full bg-slate-100 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full" 
          style={{ width: `${course.completedWeight || 0}%` }}
        ></div>
      </div>
    </div>
  );
}