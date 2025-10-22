import React, { useState, useRef, useEffect } from 'react';
import type { ShoppingItem } from '../types';
import { CheckIcon, TrashIcon, PencilIcon, TagIcon } from './Icons';

interface ItemCardProps {
  item: ShoppingItem;
  category: string;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, newName: Partial<Omit<ShoppingItem, 'id'>>) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, category, onToggle, onRemove, onUpdate }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(item.name);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [categoryName, setCategoryName] = useState(category);
  const categoryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingName) {
      nameInputRef.current?.focus();
    }
  }, [isEditingName]);
  
  useEffect(() => {
    if (isEditingCategory) {
      categoryInputRef.current?.select();
    }
  }, [isEditingCategory]);
  
  useEffect(() => {
    // Sync local state if parent props change
    if (!isEditingName) setName(item.name);
    if (!isEditingCategory) setCategoryName(category);
  }, [item.name, category, isEditingName, isEditingCategory]);

  const handleNameDoubleClick = () => {
    if (!item.completed) {
      setIsEditingName(true);
    }
  };

  const handleNameBlur = () => {
    if (name.trim() !== item.name && name.trim() !== '') {
      onUpdate(item.id, { name: name.trim() });
    } else {
      setName(item.name);
    }
    setIsEditingName(false);
  };
  
  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleNameBlur();
    } else if (e.key === 'Escape') {
      setName(item.name);
      setIsEditingName(false);
    }
  };

  const handleCategoryBlur = () => {
    const trimmedCategory = categoryName.trim();
    if (trimmedCategory && trimmedCategory !== category) {
      onUpdate(item.id, { category: trimmedCategory });
    } else {
      setCategoryName(category);
    }
    setIsEditingCategory(false);
  };
  
  const handleCategoryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCategoryBlur();
    } else if (e.key === 'Escape') {
      setCategoryName(category);
      setIsEditingCategory(false);
    }
  };

  const handleNumericChange = (field: 'quantity' | 'price', value: string) => {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue >= 0) {
      onUpdate(item.id, { [field]: numericValue });
    } else if (value === '' && field === 'price') {
      onUpdate(item.id, { price: undefined });
    } else if (value === '' && field === 'quantity') {
       onUpdate(item.id, { quantity: 1 }); // Default to 1 if empty
    }
  };

  const formatCurrency = (value?: number) => {
    if (typeof value !== 'number') return '--.--';
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  
  const itemSubtotal = (item.price || 0) * (item.quantity || 0);


  return (
    <li className="p-4">
      <div className="flex items-center gap-4">
        <button
          onClick={() => onToggle(item.id)}
          className={`w-6 h-6 flex-shrink-0 border-2 rounded-md flex items-center justify-center transition-all duration-200 ${
            item.completed
              ? 'bg-blue-600 border-blue-600'
              : 'bg-transparent border-slate-400 hover:border-blue-500'
          }`}
        >
          {item.completed && <CheckIcon />}
        </button>
        
        <span className="text-2xl">{item.emoji || '🛒'}</span>

        <div className="flex-grow">
          {isEditingName ? (
            <input 
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleNameBlur}
                onKeyDown={handleNameKeyDown}
                className="w-full bg-white outline-none border-b-2 border-blue-500 font-medium"
            />
          ) : (
            <span
              onDoubleClick={handleNameDoubleClick}
              className={`font-medium cursor-pointer ${
                item.completed ? 'line-through text-slate-500' : 'text-slate-800'
              }`}
            >
              {item.name}
            </span>
          )}
           {!item.completed && (
            isEditingCategory ? (
              <input
                  ref={categoryInputRef}
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  onBlur={handleCategoryBlur}
                  onKeyDown={handleCategoryKeyDown}
                  className="mt-1 w-full text-xs bg-white outline-none border-b-2 border-blue-500 text-slate-600"
                />
            ) : (
              <button 
                  onClick={() => setIsEditingCategory(true)}
                  disabled={item.completed}
                  className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 rounded-full py-0.5 px-2 transition-colors bg-slate-100 hover:bg-slate-200 hover:text-slate-700"
                >
                  <TagIcon />
                  {category}
                </button>
            )
           )}
        </div>
        
        <div className="ml-auto flex items-center gap-2">
          {!isEditingName && (
            <button
              onClick={() => !item.completed && setIsEditingName(true)}
              className={`p-1 rounded-full text-slate-400 ${item.completed ? 'cursor-not-allowed opacity-50' : 'hover:text-slate-700' } transition-colors`}
              aria-label="Edit item"
              disabled={item.completed}
            >
              <PencilIcon />
            </button>
          )}
          <button
            onClick={() => onRemove(item.id)}
            className="p-1 rounded-full text-slate-400 hover:text-red-500 transition-colors"
            aria-label="Remove item"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
      
      <div className={`mt-3 pl-16 grid grid-cols-3 items-center gap-3 text-sm ${item.completed ? 'opacity-60' : ''}`}>
        <div className="flex items-center gap-2">
            <label htmlFor={`quantity-${item.id}`} className="text-slate-500">Qtd.</label>
            <input 
                id={`quantity-${item.id}`}
                type="number"
                value={item.quantity}
                min="1"
                onChange={(e) => handleNumericChange('quantity', e.target.value)}
                disabled={item.completed}
                className="w-full p-1 bg-white border border-slate-300 rounded-md text-center focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed"
            />
        </div>

        <div className="flex items-center gap-2">
            <label htmlFor={`price-${item.id}`} className="text-slate-500">R$</label>
            <input 
                id={`price-${item.id}`}
                type="number"
                value={item.price ?? ''}
                min="0"
                step="0.01"
                placeholder="0,00"
                onChange={(e) => handleNumericChange('price', e.target.value)}
                disabled={item.completed}
                className="w-full p-1 bg-white border border-slate-300 rounded-md text-right focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:cursor-not-allowed"
            />
        </div>
        
        <div className="text-right">
            <p className="text-slate-500">Subtotal</p>
            <p className={`font-semibold text-slate-700 ${item.completed ? 'line-through' : ''}`}>R$ {formatCurrency(itemSubtotal)}</p>
        </div>
      </div>
    </li>
  );
};

export default ItemCard;