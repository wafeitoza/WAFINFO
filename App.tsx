import React from 'react';
import ShoppingList from './components/ShoppingList';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      <div className="max-w-4xl mx-auto">
        <ShoppingList />
      </div>
    </div>
  );
};

export default App;