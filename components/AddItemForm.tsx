import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getSuggestions } from '../services/geminiService';
import type { ShoppingItem } from '../types';
import ScannerModal from './ScannerModal';
import { SparklesIcon, DocumentPlusIcon, CameraIcon } from './Icons';

interface AddItemFormProps {
  onAddItem: (name: string, id: string) => void;
  currentItems: ShoppingItem[];
}

const AddItemForm: React.FC<AddItemFormProps> = ({ onAddItem, currentItems }) => {
  const [itemName, setItemName] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddItem(itemName, uuidv4());
    setItemName('');
  };

  const handleGetSuggestions = async () => {
    setIsLoadingSuggestions(true);
    setSuggestions([]);
    const newSuggestions = await getSuggestions(currentItems);
    setSuggestions(newSuggestions);
    setIsLoadingSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onAddItem(suggestion, uuidv4());
    setSuggestions(suggestions.filter(s => s !== suggestion));
  };
  
  const handleScanSuccess = (text: string) => {
    setItemName(text);
    setIsScannerOpen(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            placeholder="Escreva um item..."
            className="flex-grow w-full px-4 py-3 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
          <button
            type="submit"
            disabled={!itemName}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 active:bg-blue-800 transition-all duration-150 ease-in-out disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            <DocumentPlusIcon />
            Adicionar
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-2">
           <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-600 font-medium rounded-lg hover:bg-slate-100 transition-colors duration-150 ease-in-out"
          >
            <CameraIcon />
            Escanear
          </button>
          <button
            type="button"
            onClick={handleGetSuggestions}
            disabled={isLoadingSuggestions}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-600 font-medium rounded-lg hover:bg-slate-100 transition-colors duration-150 ease-in-out"
          >
            <SparklesIcon />
            {isLoadingSuggestions ? 'Gerando...' : 'Sugerir Itens'}
          </button>
        </div>
      </form>
      {(isLoadingSuggestions || suggestions.length > 0) && (
        <div className="mt-4 p-4 bg-slate-50 rounded-lg">
          <h3 className="font-semibold mb-2 text-slate-600">Sugestões:</h3>
          {isLoadingSuggestions && <div className="text-sm text-slate-500">Buscando sugestões...</div>}
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(s)}
                className="px-3 py-1 bg-white border border-slate-300 text-sm rounded-full shadow-sm hover:bg-slate-100 hover:border-slate-400 transition-all"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}
      <ScannerModal 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
        onScanSuccess={handleScanSuccess} 
      />
    </>
  );
};

export default AddItemForm;
