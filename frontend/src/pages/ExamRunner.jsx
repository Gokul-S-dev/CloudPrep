import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Instructions from './Instructions';
import Exam from './Exam';
import Result from './Result';
import { getQuestions, submitExam } from '../services/api';
import { getMockTestById } from '../services/mockTestService';
import { getAdminQuestions } from '../services/questionService';
import { recordStudentAttempt } from '../services/studentService';
import { useAuth } from '../context/AuthContext';
import { enterFullscreen, exitFullscreen } from '../utils/fullscreen';

export default function ExamRunner() {
  const { testId = 'clf-c02-live' } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const [currentPage, setCurrentPage] = useState('instructions'); // 'instructions' | 'exam' | 'result'
  const [testMeta, setTestMeta] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [examResultData, setExamResultData] = useState(null);

  const fetchQuestionsData = useCallback(async () => {
    const meta = await getMockTestById(testId);

    if (!meta || meta.usesLiveApi || testId === 'clf-c02-live') {
      const data = await getQuestions();
      return { meta, questionsList: data };
    }

    const allAdminQs = await getAdminQuestions();
    const matching = allAdminQs.filter(
      (q) =>
        q.status === 'Published' &&
        (q.mockTestId === testId || q.examCode === meta.examCode)
    );
    const sanitized = matching.map((q) => ({
      id: q.id,
      domain: q.domain,
      type: q.type,
      question: q.question,
      options: q.options
    }));
    if (sanitized.length === 0) {
      throw new Error('This mock test has no published questions yet.');
    }
    return { meta, questionsList: sanitized };
  }, [testId]);

  const loadExamMetadataAndQuestions = useCallback(async () => {
    setIsLoadingQuestions(true);
    setFetchError(null);
    try {
      const { meta, questionsList } = await fetchQuestionsData();
      setTestMeta(meta);
      setQuestions(questionsList);
      return questionsList;
    } catch (err) {
      setFetchError(err.message || 'Failed to load mock examination.');
      return null;
    } finally {
      setIsLoadingQuestions(false);
    }
  }, [fetchQuestionsData]);

  useEffect(() => {
    let ignore = false;
    fetchQuestionsData()
      .then(({ meta, questionsList }) => {
        if (!ignore) {
          setTestMeta(meta);
          setQuestions(questionsList);
        }
      })
      .catch((err) => {
        if (!ignore) {
          setFetchError(err.message || 'Failed to load mock examination.');
        }
      });
    return () => {
      ignore = true;
    };
  }, [fetchQuestionsData]);

  const handleStartExam = async () => {
    enterFullscreen();
    let currentQuestions = questions;
    if (!currentQuestions || currentQuestions.length === 0) {
      currentQuestions = await loadExamMetadataAndQuestions();
    }
    if (currentQuestions && currentQuestions.length > 0) {
      setSubmitError(null);
      setCurrentPage('exam');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Demo evaluator for custom tests not routed through AWS S3 live bank
  const evaluateCustomDemoTest = async (userAnswers) => {
    const allAdminQs = await getAdminQuestions();
    const qIds = new Set(questions.map((q) => String(q.id)));
    const fullQs = allAdminQs.filter((q) => qIds.has(String(q.id)));

    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    const domainScores = {};
    const review = [];

    fullQs.forEach((q) => {
      const qIdStr = String(q.id);
      const selected = [...(userAnswers[q.id] || userAnswers[qIdStr] || [])].sort();
      const correct = [...(q.correctAnswers || [])].sort();
      const isCorrect =
        selected.length > 0 &&
        selected.length === correct.length &&
        selected.every((v, idx) => v === correct[idx]);

      if (selected.length === 0) unansweredCount += 1;
      else if (isCorrect) correctCount += 1;
      else incorrectCount += 1;

      if (!domainScores[q.domain]) {
        domainScores[q.domain] = { total: 0, correct: 0 };
      }
      domainScores[q.domain].total += 1;
      if (isCorrect) domainScores[q.domain].correct += 1;

      review.push({
        id: q.id,
        domain: q.domain,
        type: q.type,
        question: q.question,
        options: q.options,
        selectedAnswers: selected,
        correctAnswers: correct,
        isCorrect,
        explanation: q.explanation || ''
      });
    });

    const totalQuestions = fullQs.length || 1;
    const percentage = Math.round((correctCount / totalQuestions) * 10000) / 100;
    const benchmark = testMeta?.passingBenchmark || 70;

    return {
      attemptId: `demo-${Date.now()}`,
      totalQuestions: fullQs.length,
      correctAnswers: correctCount,
      incorrectAnswers: incorrectCount,
      unanswered: unansweredCount,
      percentage,
      practiceBenchmark: benchmark,
      benchmarkMet: percentage >= benchmark,
      domainScores,
      review,
      submittedAt: new Date().toISOString()
    };
  };

  const handleSubmitExam = async (examSubmissionData) => {
    const { userAnswers, reviewFlags, timeSpent, isTimedOut } = examSubmissionData;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const useLive = !testMeta || testMeta.usesLiveApi || testId === 'clf-c02-live';
      const backendResponse = useLive
        ? await submitExam(userAnswers)
        : await evaluateCustomDemoTest(userAnswers);

      const fullResult = {
        ...backendResponse,
        reviewFlags: reviewFlags || {},
        timeSpent: timeSpent || 0,
        isTimedOut: !!isTimedOut
      };

      // Record attempt in student history / analytics
      await recordStudentAttempt(user, testMeta, fullResult);

      exitFullscreen();
      setExamResultData(fullResult);
      setCurrentPage('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit exam. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetakeExam = () => {
    enterFullscreen();
    setExamResultData(null);
    setSubmitError(null);
    setCurrentPage('exam');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReturnToDashboard = () => {
    exitFullscreen();
    const target = role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
    navigate(target);
  };

  return (
    <div className="app-root">
      {currentPage === 'instructions' && (
        <Instructions
          onStartExam={handleStartExam}
          isLoading={isLoadingQuestions}
          error={fetchError}
          onRetry={loadExamMetadataAndQuestions}
          totalAvailableQuestions={questions.length}
          onBackToPortal={handleReturnToDashboard}
        />
      )}

      {currentPage === 'exam' && (
        <Exam
          questions={questions}
          onSubmitExam={handleSubmitExam}
          isSubmitting={isSubmitting}
          submitError={submitError}
        />
      )}

      {currentPage === 'result' && (
        <Result
          examData={examResultData}
          onRetakeExam={handleRetakeExam}
          onBackToInstructions={handleReturnToDashboard}
        />
      )}
    </div>
  );
}
