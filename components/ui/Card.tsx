
import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className }) => {
  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`}>
      <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-brand-blue">{title}</h2>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
