// src/components/ShareListModal.tsx
import React, { useMemo, useState } from 'react';
import type { ShoppingListType, ShoppingItem } from '../types';
import { WhatsAppIcon, ClipboardIcon, CheckIcon as ClipboardCheckIcon } from './Icons';

interface ShareListModalProps {
  isOpen: boolean;
  onClose: () => void;
  list: ShoppingListType | null;
}

const ShareListModal: React.FC<ShareListModalProps> = ({ isOpen, onClose, list }) => {
  const [copied, setCopied] = useState(false);

  const formattedText = useMemo(() => {
    if (!list || !list.items) return 'Sua lista está vazia.';
    
    let text = `*${list.name}*\n\n`;

    const uncompletedItems = list.items.filter(item => !item.completed);
    const completedItems = list.items.filter(item => item.completed);

    const groupedItems: Record<string, ShoppingItem[]> = {};

    uncompletedItems.forEach(item => {
      const category = item.category || 'Outros';
      if (!groupedItems[category]) {
        groupedItems[category] = [];
      }
      groupedItems[category].push(item);
    });
    
    const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
        if (a === 'Outros') return 1;
        if (b === 'Outros') return -1;
        return a.localeCompare(b);
    });

    if (sortedCategories.length > 0) {
        text += "🛒 *Para Comprar*\n";
        sortedCategories.forEach(category => {
            text += `\n*_${category}_*\n`;
            groupedItems[category].forEach(item => {
                text += `- [ ] ${item.name}${item.quantity > 1 ? ` (${item.quantity})` : ''}\n`;
            });
        });
    }


    if (completedItems.length > 0) {
      text += `\n✅ *Comprados*\n`;
      completedItems.forEach(item => {
        text += `- [x] ${item.name}${item.quantity > 1 ? ` (${item.quantity})` : ''}\n`;
      });
    }

    return text;
  }, [list]);
  
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(formattedText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  const handleShareWhatsApp = () => {
    const encodedText = encodeURIComponent(formattedText);
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md relative" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4 text-slate-800 text-center">Compartilhar Lista</h2>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 my-4 max-h-64 overflow-y-auto">
            <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">{formattedText}</pre>
        </div>
        
        <div className="space-y-2">
            <button
              onClick={handleShareWhatsApp}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white font-semibold rounded-lg shadow-sm hover:bg-green-600 active:bg-green-700 transition-all duration-150 ease-in-out"
            >
              <WhatsAppIcon />
              Enviar pelo WhatsApp
            </button>
            <button
              onClick={handleCopyToClipboard}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-600 text-white font-semibold rounded-lg shadow-sm hover:bg-slate-700 active:bg-slate-800 transition-all duration-150 ease-in-out"
            >
              {copied ? <ClipboardCheckIcon className="h-5 w-5 text-white" /> : <ClipboardIcon />}
              {copied ? 'Copiado!' : 'Copiar Texto'}
            </button>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full px-6 py-2 bg-slate-100 text-slate-800 font-semibold rounded-lg hover:bg-slate-200"
        >
          Fechar
        </button>
      </div>
    </div>
  );
};

export default ShareListModal;