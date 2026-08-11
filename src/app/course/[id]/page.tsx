// src/app/course/[id]/page.tsx
'use client';

import React, { use } from 'react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CourseDetailPage({ params }: PageProps) {
  const { id } = use(params);

  return (
    <main className="p-8 max-w-4xl mx-auto space-y-6">
      <Link href="/" className="text-blue-600 hover:underline">
        ← Back to Dashboard
      </Link>

      <header className="border p-6 rounded-lg">
        <h1 className="text-2xl font-bold">Course Details (ID: {id})</h1>
      </header>

      <section className="border p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Grade Groups & Assignments</h2>
        <p className="text-slate-500 text-sm">
          Grade categories and scores for course {id} will render here.
        </p>
      </section>
    </main>
  );
}