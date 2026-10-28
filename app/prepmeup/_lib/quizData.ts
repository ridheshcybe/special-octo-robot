export interface MockQuizData {
  id: string;
  title: string;
  description: string;
  quiz_type: "topic" | "module" | "subject" | "mock_test";
  duration_minutes: number;
  total_marks: number;
  passing_marks: number;
  subject_id: string;
  subject_title: string;
  module_id?: string;
  topic_id?: string;
  questions: MockQuizQuestion[];
}

export interface MockQuizQuestion {
  id: string;
  question_type: "mcq_single" | "numerical" | "coding" | "short_answer";
  question_text: string;
  options?: string[];
  correct_answer: any;
  explanation: string;
  marks: number;
  difficulty: "easy" | "medium" | "hard";
  initial_code?: string;
  test_cases?: { input: string; expected: string }[];
}

export const MOCK_QUIZZES: MockQuizData[] = [
  {
    id: "q1111111-1111-4111-8111-111111111111",
    title: "Linear Algebra & Eigenvalue Foundations",
    description: "Test your mastery over eigenvectors, characteristic polynomials, and spectral theory.",
    quiz_type: "topic",
    duration_minutes: 15,
    total_marks: 5,
    passing_marks: 3,
    subject_id: "e1111111-1111-4111-8111-111111111111",
    subject_title: "Applied Computational Mathematics",
    questions: [
      {
        id: "qn-101",
        question_type: "mcq_single",
        question_text: "For an n x n real symmetric matrix A, which statement regarding its eigenvalues is strictly true?",
        options: [
          "A) All eigenvalues are strictly imaginary.",
          "B) All eigenvalues are guaranteed to be real.",
          "C) The matrix possesses no orthonormal eigenvector basis.",
          "D) Determinant of A is always negative.",
        ],
        correct_answer: "B) All eigenvalues are guaranteed to be real.",
        explanation: "By the Spectral Theorem, any real symmetric matrix is orthogonally diagonalizable with strictly real eigenvalues.",
        marks: 1,
        difficulty: "medium",
      },
      {
        id: "qn-102",
        question_type: "numerical",
        question_text: "Find the trace of the 2x2 matrix with diagonal elements 7.5 and 4.5.",
        correct_answer: 12,
        explanation: "The trace of a matrix is the sum of its diagonal entries: 7.5 + 4.5 = 12.",
        marks: 1,
        difficulty: "easy",
      },
      {
        id: "qn-103",
        question_type: "mcq_single",
        question_text: "If λ is an eigenvalue of matrix A with eigenvector v, what is the eigenvalue of A^2?",
        options: [
          "A) λ",
          "B) 2λ",
          "C) λ^2",
          "D) 1/λ",
        ],
        correct_answer: "C) λ^2",
        explanation: "Applying A twice: A^2(v) = A(A v) = A(λ v) = λ A(v) = λ(λ v) = λ^2 v.",
        marks: 1,
        difficulty: "medium",
      },
      {
        id: "qn-104",
        question_type: "mcq_single",
        question_text: "What is the determinant of an orthogonal matrix Q (where Q^T Q = I)?",
        options: [
          "A) Exactly 0",
          "B) Either +1 or -1",
          "C) Infinity",
          "D) Strictly positive definite",
        ],
        correct_answer: "B) Either +1 or -1",
        explanation: "det(Q^T Q) = det(Q^T)det(Q) = (det(Q))^2 = det(I) = 1, hence det(Q) = ±1.",
        marks: 1,
        difficulty: "easy",
      },
      {
        id: "qn-105",
        question_type: "coding",
        question_text: "Implement a function `matrix_trace(diag_list)` in Python that returns the sum of the elements in a list.",
        initial_code: "def matrix_trace(diag_list):\n    # Return the sum of elements\n    pass\n",
        correct_answer: "sum(diag_list)",
        explanation: "The sum of the diagonal list equals the matrix trace.",
        marks: 1,
        difficulty: "easy",
        test_cases: [
          { input: "[1, 2, 3]", expected: "6" },
          { input: "[10, -5, 2]", expected: "7" },
        ],
      },
    ],
  },
  {
    id: "q2222222-2222-4222-8222-222222222222",
    title: "Python Memory & Algorithmic Complexity",
    description: "Evaluate your understanding of Python object mutability, lists, dictionaries, and time complexity.",
    quiz_type: "module",
    duration_minutes: 20,
    total_marks: 5,
    passing_marks: 3,
    subject_id: "e2222222-2222-4222-8222-222222222222",
    subject_title: "Python Programming",
    questions: [
      {
        id: "qn-201",
        question_type: "mcq_single",
        question_text: "Which of the following built-in Python data types is immutable?",
        options: ["A) list", "B) dict", "C) tuple", "D) set"],
        correct_answer: "C) tuple",
        explanation: "Tuples in Python cannot be modified once instantiated.",
        marks: 1,
        difficulty: "easy",
      },
      {
        id: "qn-202",
        question_type: "numerical",
        question_text: "What is the average time complexity exponent k for hash table lookups in a Python dict (O(n^k))?",
        correct_answer: 0,
        explanation: "Hash table lookups in Python have average time complexity O(1) = O(n^0), so k = 0.",
        marks: 1,
        difficulty: "medium",
      },
      {
        id: "qn-203",
        question_type: "mcq_single",
        question_text: "What does the expression `[i**2 for i in range(4)]` evaluate to?",
        options: [
          "A) [1, 4, 9, 16]",
          "B) [0, 1, 4, 9]",
          "C) [0, 2, 4, 6]",
          "D) [1, 2, 3, 4]",
        ],
        correct_answer: "B) [0, 1, 4, 9]",
        explanation: "range(4) produces 0, 1, 2, 3. Squared values are 0, 1, 4, 9.",
        marks: 1,
        difficulty: "easy",
      },
    ],
  },
];
