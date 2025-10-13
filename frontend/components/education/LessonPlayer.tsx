import React, { useState } from 'react';
import ReactPlayer from 'react-player/lazy';
import Quiz from './Quiz';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

interface LessonPlayerProps {
  videoUrl: string;
  lessonSlug?: string;
  onComplete?: () => void;
}

/**
 * Renders a lesson video (or animation) followed by a quiz.
 * Once the user passes the quiz, calls onComplete so parent can
 * trigger backend event / award points.
 */
export default function LessonPlayer({
  videoUrl,
  lessonSlug,
  onComplete,
}: LessonPlayerProps) {
  const { user } = useAuth();
  const [quizUnlocked, setQuizUnlocked] = useState(false);
  const [passed, setPassed] = useState(false);

  async function handleQuizPass() {
    setPassed(true);

    if (user && lessonSlug) {
      try {
        await axios.post('/api/education/complete', {
          userId: user.uid,
          lessonSlug,
        });
        toast.success('Lesson completed! +50 XP awarded!');
      } catch (error) {
        console.error('Failed to complete lesson:', error);
        toast.error('Failed to save progress');
      }
    } else {
      console.log('Quiz passed! Award 50 XP');
    }
    if (onComplete) onComplete();
  }

  return (
    <div className="space-y-6">
      {videoUrl && (
        <div className="w-full aspect-video rounded-lg overflow-hidden shadow">
          <ReactPlayer
            url={videoUrl}
            controls
            width="100%"
            height="400px"
            onEnded={() => setQuizUnlocked(true)}
          />
        </div>
      )}

      {quizUnlocked && !passed && (
        <Quiz lessonSlug={lessonSlug || ''} onPass={handleQuizPass} />
      )}

      {passed && (
        <div className="p-4 bg-green-50 border border-green-200 rounded">
          <p className="text-green-800 font-semibold">
            Great job! You passed the quiz and earned 50 XP.
          </p>
        </div>
      )}
    </div>
  );
}
