import React, { useState } from 'react';

interface Question {
  prompt: string;
  options: string[];
  correctIndex: number;
}

const sampleQuestions: Question[] = [
  {
    prompt: 'What does owning a share of stock represent?',
    options: [
      'A loan to the company',
      'Partial ownership in the company',
      'A government bond',
      'A futures contract',
    ],
    correctIndex: 1,
  },
  {
    prompt: 'Which factor has the greatest impact on compound growth?',
    options: ['Principal', 'Time', 'Fees', 'Color of Money'],
    correctIndex: 1,
  },
];

interface QuizProps {
  lessonSlug?: string;
  onPass: () => void;
}

export default function Quiz({ onPass }: QuizProps) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const q = sampleQuestions[current];

  function submit() {
    if (selected === q.correctIndex) setScore(s => s + 1);

    if (current + 1 < sampleQuestions.length) {
      setCurrent(c => c + 1);
      setSelected(null);
    } else {
      // pass if 70%+
      const passed =
        (score + (selected === q.correctIndex ? 1 : 0)) /
          sampleQuestions.length >=
        0.7;
      if (passed) onPass();
    }
  }

  return (
    <div className="space-y-4">
      <p className="font-medium text-gray-800">{q.prompt}</p>
      <div className="space-y-2">
        {q.options.map((opt, idx) => (
          <label key={idx} className="flex items-center space-x-2">
            <input
              type="radio"
              name="option"
              value={idx}
              checked={selected === idx}
              onChange={() => setSelected(idx)}
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
      <button
        className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
        disabled={selected === null}
        onClick={submit}
      >
        {current + 1 === sampleQuestions.length ? 'Finish' : 'Next'}
      </button>
    </div>
  );
}
