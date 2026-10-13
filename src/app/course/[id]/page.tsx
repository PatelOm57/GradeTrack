'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/config/supabase';
import { EditableTitle } from '@/components/editableTitle';
import { GradeGroup, GradeGroupType } from '@/components/gradeGroup';
import { GradeItem } from '@/components/gradeCard';
import { LoadingScreen } from '@/components/loadingScreen';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CourseDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const courseId = parseInt(id, 10);

  const [courseTitle, setCourseTitle] = useState<string>('');
  const [gradeGroups, setGradeGroups] = useState<GradeGroupType[]>([]);
  const [grades, setGrades] = useState<GradeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // 1. Fetch Course Title
        const { data: courseData, error: courseErr } = await supabase
          .from('courses')
          .select('field, level')
          .eq('id', courseId)
          .single();

        if (courseErr) {
          console.error('Error fetching course:', courseErr.message);
        }
        if (courseData) {
          setCourseTitle(`${courseData.field} ${courseData.level}`);
        }

        // 2. Fetch Grade Groups
        const { data: groupData, error: groupErr } = await supabase
          .from('grade_group')
          .select('*')
          .eq('course_id', courseId)
          .order('id', { ascending: true });

        if (groupErr) {
          console.error('Error fetching grade_group:', groupErr.message);
        }
        const fetchedGroups = groupData || [];
        setGradeGroups(fetchedGroups);

        // 3. Fetch Grades matching group IDs using ggroup_id
        if (fetchedGroups.length > 0) {
          const groupIds = fetchedGroups.map((g) => g.id);

          const { data: gradesData, error: gradesErr } = await supabase
            .from('grades')
            .select('*')
            .in('ggroup_id', groupIds)
            .order('id', { ascending: true });

          if (gradesErr) {
            console.error('Error fetching grades:', gradesErr.message);
          }
          setGrades(gradesData || []);
        } else {
          setGrades([]);
        }
      } catch (err) {
        console.error('Unexpected error loading course details:', err);
      } finally {
        setLoading(false);
      }
    }

    if (courseId) fetchData();
  }, [courseId]);

  // Handle renaming the course title
  const handleRenameCourse = async (field: string, level: string) => {
    setCourseTitle(`${field} ${level}`);
    await supabase.from('courses').update({ field, level }).eq('id', courseId);
  };

  // Handle score updates from GradeCard
  const handleUpdateScore = async (
    gradeId: number,
    newPoints: number | null,
    newPercent: number | null
  ) => {
    setGrades((prev) =>
      prev.map((g) =>
        g.id === gradeId ? { ...g, points: newPoints, percent: newPercent } : g
      )
    );

    await supabase
      .from('grades')
      .update({ points: newPoints, percent: newPercent })
      .eq('id', gradeId);
  };

  // Handle grade deletion
  const handleDeleteGrade = async (gradeId: number) => {
    setGrades((prev) => prev.filter((g) => g.id !== gradeId));
    await supabase.from('grades').delete().eq('id', gradeId);
  };

  // Handle adding a new grade item to a group
  const handleAddGrade = async (groupId: number) => {
    const newGradePayload = {
      ggroup_id: groupId,
      name: 'New Item',
      is_points: true,
      points: null,
      points_of: 10,
      percent: null,
      auto_percent: false,
    };

    const { data, error } = await supabase
      .from('grades')
      .insert([newGradePayload])
      .select()
      .single();

    if (error) console.error('Error adding grade item:', error.message);
    if (data && !error) {
      setGrades((prev) => [...prev, data]);
    }
  };

  // Calculate Overall Course Grade across points & percent items
  const calculateOverallGrade = () => {
    let totalWeightedScore = 0;
    let totalWeightCompleted = 0;

    gradeGroups.forEach((group) => {
      const groupGrades = grades.filter((g) => g.ggroup_id === group.id);

      let totalEarnedPoints = 0;
      let totalPossiblePoints = 0;
      let percentSum = 0;
      let percentCount = 0;

      groupGrades.forEach((g) => {
        if (g.is_points) {
          if (
            g.points !== null &&
            g.points !== undefined &&
            g.points_of &&
            g.points_of > 0
          ) {
            totalEarnedPoints += g.points;
            totalPossiblePoints += g.points_of;
          }
        } else {
          if (g.percent !== null && g.percent !== undefined) {
            percentSum += g.percent;
            percentCount += 1;
          }
        }
      });

      let groupPct: number | null = null;
      if (totalPossiblePoints > 0) {
        groupPct = totalEarnedPoints / totalPossiblePoints;
      } else if (percentCount > 0) {
        groupPct = percentSum / percentCount / 100;
      }

      if (groupPct !== null) {
        totalWeightedScore += groupPct * group.weight;
        totalWeightCompleted += group.weight;
      }
    });

    if (totalWeightCompleted === 0) return null;
    return Math.round((totalWeightedScore / totalWeightCompleted) * 100);
  };

  const overallGrade = calculateOverallGrade();

  if (loading) return <LoadingScreen message="Loading course details..." variant="spinner" />;

  return (
    <main className="gt-course-detail-layout">
      <Link href="/" className="gt-back-link gt-pop-target">
        ← Back to Dashboard
      </Link>

      {/* Header Bar */}
      <header className="gt-course-header">
        <EditableTitle
          initialValue={courseTitle}
          mode="course"
          className="gt-course-title-text"
          onSave={handleRenameCourse}
          titleTip="Click to rename course"
        />

        {/* Overall Grade Badge */}
        <div className="gt-overall-grade-container">
          <div className="gt-overall-grade-label">Overall Grade</div>
          <div className="gt-overall-grade-value">
            {overallGrade !== null ? `${overallGrade}%` : '---'}
          </div>
        </div>
      </header>

      {/* Groups & Grades List */}
      <div className="gt-grade-groups-container">
        {gradeGroups.map((group) => (
          <GradeGroup
            key={group.id}
            group={group}
            grades={grades.filter((g) => g.ggroup_id === group.id)}
            onUpdateScore={handleUpdateScore}
            onDeleteGrade={handleDeleteGrade}
            onAddGrade={handleAddGrade}
          />
        ))}
      </div>
    </main>
  );
}