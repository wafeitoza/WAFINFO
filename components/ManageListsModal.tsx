import React, { useState } from 'react';
import type { ShoppingListType } from '../types';
import { TrashIcon, PencilIcon, CheckIcon } from './Icons';

interface ManageListsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lists: ShoppingListType[];
  activeListId: string | null;
  onSelectList: (id: string) => void;
  onCreateNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newName: string) => void;
}

const ManageListsModal: React.FC<ManageListsModalProps> = ({
  isOpen,
  onClose,
  lists,
  activeListId,
  onSelectList,
  onCreateNew,
  onDelete,
  onRename,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  if (!isOpen) return null;

  const handleRenameClick = (list: ShoppingListType) => {
    setEditingId(list.id);
    setEditingName(list.name);
  };

  const handleSaveRename = (id: string) => {
    if (editingName.trim()) {
      onRename(id, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
      if (e.key === 'Enter') {
          handleSaveRename(id);
      } else if (e.key === 'Escape') {
          setEditingId(null);
          setEditingName('');
      }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md text-center relative" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4 text-slate-800">Minhas Listas</h2>
        <div className="my-4 max-h-64 overflow-y-auto pr-2">
          <ul className="space-y-2">
            {lists.map(list => (
              <li key={list.id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                {editingId === list.id ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => handleSaveRename(list.id)}
                    onKeyDown={(e) => handleKeyDown(e, list.id)}
                    className="flex-grow bg-white outline-none border-b-2 border-blue-500 font-medium px-1"
                    autoFocus
                  />
                ) : (
                  <button onClick={() => onSelectList(list.id)} className={`flex-grow text-left px-1 font-medium ${list.id === activeListId ? 'text-blue-600' : 'text-slate-700'}`}>
                    {list.name}
                  </button>
                )}
                
                <div className="flex items-center gap-1">
                  {editingId === list.id ? (
                      <button onClick={() => handleSaveRename(list.id)} className="p-2 rounded-full text-slate-500 hover:bg-green-100 hover:text-green-600">
                          <CheckIcon className="h-5 w-5"/>
                      </button>
                  ) : (
                      <button onClick={() => handleRenameClick(list)} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-700">
                          <PencilIcon />
                      </button>
                  )}
                  <button onClick={() => onDelete(list.id)} className="p-2 rounded-full text-slate-500 hover:bg-red-100 hover:text-red-600">
                      <TrashIcon />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={onCreateNew}
          className="mt-2 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 active:bg-blue-800 transition-all duration-150 ease-in-out"
        >
          Criar Nova Lista
        </button>
        <button
          onClick={onClose}
          className="mt-2 w-full px-6 py-3 bg-slate-100 text-slate-800 font-semibold rounded-lg hover:bg-slate-200"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};

export default ManageListsModal;
