/**
-- Academic Grade Points Mapping Configuration
-- Standard Indian University / AICTE 10-Point Relative Grading System
*/

export interface GradeScale {
  grade: string;
  points: number;
  description: string;
}

export const GRADE_POINT_MAP: GradeScale[] = [
  { grade: "O", points: 10, description: "Outstanding (≥ 90%)" },
  { grade: "A+", points: 9, description: "Excellent (80 - 89%)" },
  { grade: "A", points: 8, description: "Very Good (70 - 79%)" },
  { grade: "B+", points: 7, description: "Good (60 - 69%)" },
  { grade: "B", points: 6, description: "Above Average (55 - 59%)" },
  { grade: "C", points: 5, description: "Average (50 - 54%)" },
  { grade: "P", points: 4, description: "Pass (40 - 49%)" },
  { grade: "F", points: 0, description: "Fail (< 40%)" },
];

export interface DefaultSubject {
  code: string;
  name: string;
  credits: number;
  defaultGrade: string;
}

export const SEMESTER_1_DEFAULT_SUBJECTS: DefaultSubject[] = [
  { code: "ACM-101", name: "Applied Computational Mathematics", credits: 4, defaultGrade: "O" },
  { code: "PYT-102", name: "Python Programming", credits: 4, defaultGrade: "A+" },
  { code: "BEE-103", name: "Basic Electrical Engineering", credits: 4, defaultGrade: "A" },
  { code: "COA-104", name: "Computer Organisation and Architecture", credits: 3, defaultGrade: "A+" },
  { code: "LAB-105", name: "Python & BEE Laboratory", credits: 2, defaultGrade: "O" },
];
