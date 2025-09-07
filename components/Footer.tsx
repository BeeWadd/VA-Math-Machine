import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white mt-12 py-6 border-t">
      <div className="container mx-auto px-4 lg:px-8 text-center text-gray-500">
        <p className="text-sm">
          <strong>Disclaimer:</strong> This calculator is an estimation tool and is not affiliated with the U.S. Department of Veterans' Affairs. It is based on publicly available VA regulations (38 CFR § 4.25 & 4.26) and compensation rates effective December 1, 2024. It is not an official VA tool and should not be considered a guarantee of benefits.
        </p>
        <p className="text-sm mt-1">
          For official information, please consult the <a href="https://www.va.gov" target="_blank" rel="noopener noreferrer" className="text-brand-accent hover:underline">U.S. Department of Veterans Affairs</a>.
        </p>
      </div>
    </footer>
  );
};

export default Footer;