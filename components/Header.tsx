// FIX: Replaced placeholder content with a functional Header component.
import React, { useState, useEffect, useRef } from 'react';
import { FolderIcon, PencilIcon, ShareIcon } from './Icons';

interface HeaderProps {
  listName: string;
  onListNameChange: (newName: string) => void;
  onManageLists: () => void;
  onShareList: () => void;
}

const Header: React.FC<HeaderProps> = ({ listName, onListNameChange, onManageLists, onShareList }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(listName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(listName);
  }, [listName]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    if (name.trim() && name.trim() !== listName) {
      onListNameChange(name.trim());
    } else {
      setName(listName); // Revert if empty or unchanged
    }
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setName(listName);
      setIsEditing(false);
    }
  };

  return (
    <header className="py-6 px-4">
      <div className="relative text-center">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="text-3xl font-bold tracking-tight text-center text-slate-900 bg-slate-100 border-b-2 border-blue-500 outline-none w-full max-w-lg mx-auto"
          />
        ) : (
          <div className="flex items-center justify-center gap-2 group">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {listName}
            </h1>
            <button 
              onClick={() => setIsEditing(true)}
              className="p-1 rounded-full text-slate-400 opacity-0 group-hover:opacity-100 hover:text-slate-700 transition-opacity"
              aria-label="Rename list"
            >
              <PencilIcon />
            </button>
          </div>
        )}
      </div>
      <p className="text-center text-slate-600 mt-2 max-w-2xl mx-auto">
        Sua lista de compras inteligente. Salve, edite e organize!
      </p>
      <div className="flex justify-center items-center gap-2 text-center mt-4">
        <button
          onClick={onManageLists}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors duration-150 ease-in-out shadow-sm"
        >
          <FolderIcon />
          Minhas Listas
        </button>
        <button
          onClick={onShareList}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-100 transition-colors duration-150 ease-in-out shadow-sm"
        >
          <ShareIcon />
          Compartilhar
        </button>
      </div>
    </header>
  );
};

export default Header;