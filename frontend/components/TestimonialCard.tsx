import React from 'react';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role?: string;
}

export default function TestimonialCard({ quote, author, role }: TestimonialCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 m-2 w-full md:w-80 flex flex-col items-center">
      <blockquote className="italic text-indigo-700 mb-4">“{quote}”</blockquote>
      <div className="font-semibold text-indigo-900">{author}</div>
      {role && <div className="text-indigo-400 text-sm">{role}</div>}
    </div>
  );
}
