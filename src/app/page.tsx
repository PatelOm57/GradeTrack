// src/app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/config/supabase';

export interface CourseGroup {
  id: number;
  name: string;
}

export interface Course {
  id: number;
  cgroup_id: number;
  field: string;
  level: string;
  target: number;
  currentGrade?: number | null;
  completedWeight?: number | null;
}

export default function Home() {
  const [courseGroups, setCourseGroups] = useState<CourseGroup[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        let { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          const testEmail = process.env.NEXT_PUBLIC_TEST_EMAIL;
          const testPassword = process.env.NEXT_PUBLIC_TEST_PASS;

          if (testEmail && testPassword) {
            const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
              email: testEmail,
              password: testPassword,
            });
            if (authErr) throw authErr;
            session = authData.session;
          }
        }

        const { data: groupsData, error: groupsErr } = await supabase
          .from('course_group')
          .select('*')
          .order('id', { ascending: true });
        if (groupsErr) throw groupsErr;

        const { data: coursesData, error: coursesErr } = await supabase
          .from('courses')
          .select('*')
          .order('id', { ascending: true });
        if (coursesErr) throw coursesErr;

        setCourseGroups(groupsData || []);
        setCourses(coursesData || []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;

  return (
    <main className="p-8 max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">GradeTrack Dashboard</h1>

      {courseGroups.map((group) => {
        const groupCourses = courses.filter((c) => c.cgroup_id === group.id);

        return (
          <section key={group.id} className="border p-4 rounded-lg space-y-4">
            <h2 className="text-xl font-semibold">{group.name}</h2>
            <div className="flex flex-wrap gap-4">
              {groupCourses.map((course) => (
                <Link key={course.id} href={`/course/${course.id}`}>
                  <div className="w-48 h-32 border p-4 rounded hover:bg-slate-50 cursor-pointer flex flex-col justify-between">
                    <div>
                      <div className="font-bold">{course.field} {course.level}</div>
                      <div className="text-sm text-slate-500">Target: {course.target}%</div>
                    </div>
                    <div className="text-lg font-semibold text-blue-600">
                      {course.currentGrade ? `${course.currentGrade}%` : '---'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}