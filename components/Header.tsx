import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-brand-blue text-white shadow-lg">
      <div className="container mx-auto px-4 py-6 lg:px-8">
        <h1 className="text-3xl lg:text-4xl font-bold">VA Math Machine</h1>
        <p className="mt-1 text-lg text-blue-200">Estimate your combined rating and monthly compensation.</p>
      </div>
    </header>
  );
};

export default Header;