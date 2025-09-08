import React from 'react';

interface ValuePropositionProps {
  title: string;
  points: string[];
}

export default function ValueProposition({ title, points }: ValuePropositionProps) {
  return (
    <section className="bg-indigo-50 rounded-xl p-8 my-8 shadow">
      <h2 className="text-2xl font-bold text-indigo-800 mb-4">{title}</h2>
      <ul className="list-disc pl-6 space-y-2 text-indigo-700">
        {points.map((point, idx) => (
          <li key={idx}>{point}</li>
        ))}
      </ul>
    </section>
  );
}
