import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Timer from '../components/Timer';
import QuestionCard from '../components/QuestionCard';
import QuestionPalette from '../components/QuestionPalette';
import ExamNavigation from '../components/ExamNavigation';
import SubmitModal from '../components/SubmitModal';
import { enterFullscreen, exitFullscreen, isCurrentlyFullscreen } from '../utils/fullscreen';

const EXAM_DURATION_SECONDS = 90 * 60; // 90 minutes = 5400 seconds

export default function Exam({
  questions = [],
  onSubmitExam,
  isSubmitting = false,
  submitError = null
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [questionId]: string[] }
  const [reviewFlags, setReviewFlags] = useState({}); // { [questionId]: boolean }
  const [timeRemaining, setTimeRemaining] = useState(EXAM_DURATION_SECONDS);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isExamActive, setIsExamActive] = useState(true);
  const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(isCurrentlyFullscreen());

  // Fullscreen event listener & auto-enter
  useEffect(() => {
    if (!isCurrentlyFullscreen()) {
      enterFullscreen();
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(isCurrentlyFullscreen());
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const handleToggleFullscreen = () => {
    if (isCurrentlyFullscreen()) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  };

  const currentQuestion = questions[currentIndex];
  const currentAnswers = userAnswers[currentQuestion?.id] || [];
  const isCurrentMarked = !!reviewFlags[currentQuestion?.id];

  // Answer selection handler
  const handleSelectOption = (selectedIds) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: selectedIds
    }));
  };

  // Clear answer for current question
  const handleClearResponse = () => {
    setUserAnswers((prev) => {
      const updated = { ...prev };
      delete updated[currentQuestion.id];
      return updated;
    });
  };

  // Toggle mark for review
  const handleToggleReview = () => {
    setReviewFlags((prev) => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id]
    }));
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSelectQuestion = (index) => {
    setCurrentIndex(index);
  };

  // Submission handler
  const handleFinalSubmit = () => {
    const timeSpent = EXAM_DURATION_SECONDS - timeRemaining;
    onSubmitExam({
      userAnswers,
      reviewFlags,
      timeSpent,
      totalQuestions: questions.length,
      isTimedOut: hasTimedOut
    });
  };

  // Timeout handler
  const handleTimeUp = () => {
    if (isExamActive && !hasTimedOut) {
      setIsExamActive(false);
      setHasTimedOut(true);
      setShowSubmitModal(true);
      const timeSpent = EXAM_DURATION_SECONDS;
      onSubmitExam({
        userAnswers,
        reviewFlags,
        timeSpent,
        totalQuestions: questions.length,
        isTimedOut: true
      });
    }
  };

  // Status counts for modal & summary
  const answeredCount = questions.filter(
    (q) => userAnswers[q.id] && userAnswers[q.id].length > 0
  ).length;
  const unansweredCount = questions.length - answeredCount;
  const markedCount = questions.filter((q) => reviewFlags[q.id]).length;

  return (
    <div className="min-vh-100 d-flex flex-column bg-light w-100" style={{ paddingBottom: '76px' }}>
      {/* Pearson VUE Top Navigation Bar */}
      <Navbar
        examMode={true}
        timerComponent={
          <Timer
            timeRemaining={timeRemaining}
            setTimeRemaining={setTimeRemaining}
            onTimeUp={handleTimeUp}
            isActive={isExamActive && !isSubmitting}
          />
        }
        onSubmitClick={() => setShowSubmitModal(true)}
        onTogglePalette={() => setIsMobilePaletteOpen(true)}
        answeredCount={answeredCount}
        totalQuestions={questions.length}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* Main Full-Screen Examination Workspace */}
      <main className="container-fluid px-3 px-sm-4 py-3 flex-grow-1 w-100">
        <div className="row g-3 g-lg-4">
          {/* Main Question Card Area (Left side) */}
          <div className="col-12 col-lg-8 col-xl-8 col-xxl-9">
            <QuestionCard
              question={currentQuestion}
              currentIndex={currentIndex}
              totalQuestions={questions.length}
              selectedAnswers={currentAnswers}
              onSelectOption={handleSelectOption}
              isMarkedForReview={isCurrentMarked}
              onToggleReview={handleToggleReview}
            />
          </div>

          {/* Question Palette Sidebar (Right side, desktop) */}
          <div className="col-12 col-lg-4 col-xl-4 col-xxl-3 d-none d-lg-block">
            <div className="sticky-top" style={{ top: '70px', zIndex: 10 }}>
              <QuestionPalette
                questions={questions}
                currentIndex={currentIndex}
                userAnswers={userAnswers}
                reviewFlags={reviewFlags}
                onSelectQuestion={handleSelectQuestion}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Pearson VUE Fixed Full-Width Bottom Bar */}
      <ExamNavigation
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onClearResponse={handleClearResponse}
        hasAnswerSelected={currentAnswers.length > 0}
        onTogglePalette={() => setIsMobilePaletteOpen(true)}
        answeredCount={answeredCount}
      />

      {/* Mobile Offcanvas Drawer for Question Palette */}
      {isMobilePaletteOpen && (
        <div
          className="mobile-palette-backdrop"
          onClick={() => setIsMobilePaletteOpen(false)}
        />
      )}
      <div className={`mobile-palette-drawer ${isMobilePaletteOpen ? 'open' : ''}`}>
        <QuestionPalette
          questions={questions}
          currentIndex={currentIndex}
          userAnswers={userAnswers}
          reviewFlags={reviewFlags}
          onSelectQuestion={handleSelectQuestion}
          onClose={() => setIsMobilePaletteOpen(false)}
          isMobileDrawer={true}
        />
      </div>

      {/* Submit Confirmation Modal */}
      <SubmitModal
        show={showSubmitModal}
        totalQuestions={questions.length}
        answeredCount={answeredCount}
        unansweredCount={unansweredCount}
        markedCount={markedCount}
        onCancel={() => !isSubmitting && setShowSubmitModal(false)}
        onConfirmSubmit={handleFinalSubmit}
        isSubmitting={isSubmitting}
        submitError={submitError}
        isTimedOut={hasTimedOut}
      />
    </div>
  );
}
