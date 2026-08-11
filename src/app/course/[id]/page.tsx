// src/app/course/[id]/page.tsx
'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/config/supabase';
import { EditableTitle } from '@/components/editableTitle';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CourseDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const [courseTitle, setCourseTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourse() {
      const { data } = await supabase
        .from('courses')
        .select('field, level')
        .eq('id', id)
        .single();

      if (data) {
        setCourseTitle(`${data.field} ${data.level}`);
      }
      setLoading(false);
    }
    fetchCourse();
  }, [id]);

  const handleRenameCourse = async (field: string, level: string) => {
    setCourseTitle(`${field} ${level}`);
    await supabase
      .from('courses')
      .update({ field, level })
      .eq('id', id);
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <main className="p-8 max-w-4xl mx-auto space-y-6">
      <Link href="/" className="text-blue-600 hover:underline">
        ← Back to Dashboard
      </Link>

      <header className="border p-6 rounded-lg bg-white shadow-sm">
        <EditableTitle
          initialValue={courseTitle}
          mode="course"
          className="text-2xl font-bold"
          onSave={handleRenameCourse}
          titleTip="Click to rename course"
        />
      </header>

      <section className="border p-6 rounded-lg bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Grade Groups & Assignments</h2>
        <p className="text-slate-500 text-sm">
          Grade categories and scores for course {id} will render here.
        </p>
      </section>
    </main>
  );
}