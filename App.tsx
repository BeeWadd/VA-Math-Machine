import React, { useState } from 'react';
import { Disability, DependencyStatus } from './types';
import { useVaCalculator } from './hooks/useVaCalculator';

import Header from './components/Header';
import DisabilityInputForm from './components/DisabilityInputForm';
import DisabilityList from './components/DisabilityList';
import DependencySelector from './components/DependencySelector';
import ResultsDisplay from './components/ResultsDisplay';
import Footer from './components/Footer';
import Card from './components/ui/Card';
import PrintableReport from './components/PrintableReport';


const App: React.FC = () => {
  const [disabilities, setDisabilities] = useState<Disability[]>([]);
  const [dependencyStatus, setDependencyStatus] = useState<DependencyStatus>(DependencyStatus.VETERAN_ONLY);

  const calculationResults = useVaCalculator(disabilities, dependencyStatus);

  const handleAddDisability = (disability: Omit<Disability, 'id'>) => {
    const newDisability: Disability = {
      ...disability,
      id: new Date().getTime().toString(), // simple unique id
    };
    setDisabilities([...disabilities, newDisability]);
  };

  const handleRemoveDisability = (id: string) => {
    setDisabilities(disabilities.filter((d) => d.id !== id));
  };

  const handleReset = () => {
      setDisabilities([]);
      setDependencyStatus(DependencyStatus.VETERAN_ONLY);
  };

  return (
    <>
      <div className="bg-gray-50 min-h-screen font-sans print:hidden">
        <Header />
        <main className="container mx-auto px-4 py-8 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-2 space-y-8">
              <DisabilityInputForm onAddDisability={handleAddDisability} existingDisabilities={disabilities} />
              <Card title="2. Your Added Ratings">
                  <DisabilityList disabilities={disabilities} onRemoveDisability={handleRemoveDisability} />
              </Card>
              <Card title="3. Your Family Status">
                <DependencySelector selectedStatus={dependencyStatus} onStatusChange={setDependencyStatus} />
              </Card>
            </div>

            <div className="lg:col-span-1">
               <ResultsDisplay results={calculationResults} onReset={handleReset} />
            </div>

          </div>
        </main>
        <Footer />
      </div>
      <PrintableReport 
        disabilities={disabilities} 
        results={calculationResults} 
        dependencyStatus={dependencyStatus} 
      />
    </>
  );
};

export default App;