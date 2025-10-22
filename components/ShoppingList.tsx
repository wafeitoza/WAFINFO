// FIX: Replaced placeholder content with a fully functional ShoppingList component.
import React, { useState, useEffect, useMemo } from 'react';
import AddItemForm from './AddItemForm';
import ItemCard from './ItemCard';
import Header from './Header';
import type { ShoppingItem } from '../types';
import { getEmojiForItem, getCategorizedItems } from '../services/geminiService';
import { CubeTransparentIcon } from './Icons';
import { useShoppingLists } from '../hooks/useShoppingLists';
import ManageListsModal from './ManageListsModal';
import ShareListModal from './ShareListModal';

const ShoppingList: React.FC = () => {
  const { 
    lists, 
    activeList, 
    activeListId, 
    setActiveListId,
    createNewList,
    deleteList,
    renameList,
    updateActiveListItems 
  } = useShoppingLists();
  
  const items = activeList?.items || [];

  const [categorizedItems, setCategorizedItems] = useState<Record<string, ShoppingItem[]>>({});
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [isListsModalOpen, setIsListsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    const uncompleted = items.filter(item => !item.completed);

    if (uncompleted.length === 0) {
      setCategorizedItems({});
      setIsCategorizing(false);
      return;
    }

    const handler = setTimeout(async () => {
      const itemsToCategorize = uncompleted.filter(item => !item.category);
      const manualItems = uncompleted.filter(item => !!item.category);
      
      const groupedItems: Record<string, ShoppingItem[]> = {};

      manualItems.forEach(item => {
        const cat = item.category!.trim();
        if (!groupedItems[cat]) {
          groupedItems[cat] = [];
        }
        groupedItems[cat].push(item);
      });

      if (itemsToCategorize.length === 0) {
        const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
          if (a === 'Outros' || a === 'Itens') return 1;
          if (b === 'Outros' || b === 'Itens') return -1;
          return a.localeCompare(b);
        });

        const sortedGroupedItems: Record<string, ShoppingItem[]> = {};
        for (const category of sortedCategories) {
            sortedGroupedItems[category] = groupedItems[category];
        }

        setCategorizedItems(sortedGroupedItems);
        setIsCategorizing(false);
        return;
      }
      
      setIsCategorizing(true);
      try {
        const categoryList = await getCategorizedItems(itemsToCategorize);
        
        categoryList.forEach(({ id, category }) => {
          const item = itemsToCategorize.find(i => i.id === id);
          if (item) {
            const cat = category.trim() || 'Outros';
            if (!groupedItems[cat]) {
              groupedItems[cat] = [];
            }
            groupedItems[cat].push(item);
          }
        });

        const categorizedIds = new Set(categoryList.map(c => c.id));
        itemsToCategorize.forEach(item => {
          if (!categorizedIds.has(item.id)) {
            if (!groupedItems['Outros']) {
              groupedItems['Outros'] = [];
            }
            groupedItems['Outros'].push(item);
          }
        });

      } catch (error) {
        console.error("Failed to categorize items:", error);
        if (!groupedItems['Itens']) {
            groupedItems['Itens'] = [];
        }
        groupedItems['Itens'].push(...itemsToCategorize);
      } finally {
        const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
            if (a === 'Outros' || a === 'Itens') return 1;
            if (b === 'Outros' || b === 'Itens') return -1;
            return a.localeCompare(b);
        });

        const sortedGroupedItems: Record<string, ShoppingItem[]> = {};
        for (const category of sortedCategories) {
            sortedGroupedItems[category] = groupedItems[category];
        }

        setCategorizedItems(sortedGroupedItems);
        setIsCategorizing(false);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [items]);

  const handleAddItem = async (name: string, id: string) => {
    if (!name.trim()) return;

    const newItem: ShoppingItem = {
      id: id,
      name: name.trim(),
      completed: false,
      emoji: '🛒',
      quantity: 1,
      price: undefined,
      category: undefined,
    };

    updateActiveListItems([newItem, ...items]);
    
    try {
      const emoji = await getEmojiForItem(name.trim());
      updateActiveListItems(
        [newItem, ...items].map(item =>
          item.id === newItem.id ? { ...item, emoji } : item
        )
      );
    } catch (error) {
      console.error(`Failed to fetch emoji for ${name.trim()}`, error);
    }
  };
  
  const handleToggleItem = (id: string) => {
    const newItems = items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    updateActiveListItems(newItems);
  };

  const handleRemoveItem = (id: string) => {
    updateActiveListItems(items.filter(item => item.id !== id));
  };
  
  const handleUpdateItem = (id: string, updates: Partial<Omit<ShoppingItem, 'id'>>) => {
    const newItems = items.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    updateActiveListItems(newItems);
  };
  
  const totalCost = useMemo(() => {
    return items
      .filter(item => !item.completed)
      .reduce((total, item) => total + (item.price || 0) * item.quantity, 0);
  }, [items]);

  const totalItems = useMemo(() => {
    return items
      .filter(item => !item.completed)
      .reduce((total, item) => total + item.quantity, 0);
  }, [items]);
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };
  
  // FIX: Explicitly typed `completedItems` to fix a type inference issue where it was being inferred as `unknown`.
  const completedItems: ShoppingItem[] = useMemo(() => items.filter(item => item.completed), [items]);
  
  const handleSelectList = (id: string) => {
    setActiveListId(id);
    setIsListsModalOpen(false);
  }
  
  const handleCreateNewList = () => {
    createNewList();
    setIsListsModalOpen(false);
  }

  return (
    <div className="py-8">
      <Header 
        listName={activeList?.name || 'Carregando...'}
        onListNameChange={(newName) => activeListId && renameList(activeListId, newName)}
        onManageLists={() => setIsListsModalOpen(true)}
        onShareList={() => setIsShareModalOpen(true)}
      />
      <main className="mt-4">
        <AddItemForm onAddItem={handleAddItem} currentItems={items} />

        <div className="mt-8">
          {items.length === 0 && !activeList ? (
             <div className="text-center py-10">
              <p className="text-slate-500">Nenhuma lista selecionada.</p>
              <button onClick={() => setIsListsModalOpen(true)} className="mt-2 text-blue-600 hover:underline">
                Selecione ou crie uma nova lista.
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-slate-500">Sua lista está vazia.</p>
              <p className="text-slate-400 text-sm mt-1">Comece adicionando alguns itens!</p>
            </div>
          ) : (
            <>
              <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                {isCategorizing && Object.keys(categorizedItems).length === 0 ? (
                  <div className="flex items-center justify-center gap-3 p-8 text-slate-500">
                    <CubeTransparentIcon />
                    <span>Organizando sua lista...</span>
                  </div>
                ) : (
                  Object.entries(categorizedItems).map(([category, categoryItems], index) => {
                    if (categoryItems.length === 0) return null;
                    return (
                      <div key={category} className={index > 0 ? "border-t border-slate-200" : ""}>
                          <h2 className="bg-slate-50 px-4 py-2 text-sm font-bold text-slate-600 uppercase tracking-wider">{category}</h2>
                          <ul className="divide-y divide-slate-200">
                            {categoryItems.map(item => (
                              <ItemCard
                                key={item.id}
                                item={item}
                                category={item.category || category}
                                onToggle={handleToggleItem}
                                onRemove={handleRemoveItem}
                                onUpdate={handleUpdateItem}
                              />
                            ))}
                          </ul>
                      </div>
                    );
                  })
                )}
              </div>
              
              {completedItems.length > 0 && (
                <div className="mt-8">
                  <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm bg-slate-50">
                    <h2 className="text-sm font-semibold text-slate-500 px-4 py-3 uppercase tracking-wider">Comprados ({completedItems.length})</h2>
                    <ul className="divide-y divide-slate-200 bg-white">
                      {completedItems.map(item => (
                        <ItemCard
                          key={item.id}
                          item={item}
                          category={item.category || 'Comprado'}
                          onToggle={handleToggleItem}
                          onRemove={handleRemoveItem}
                          onUpdate={handleUpdateItem}
                        />
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </>
          )}

          {items.length > 0 && (
            <div className="mt-8 px-4 py-3 bg-slate-100 rounded-lg border border-slate-200 flex justify-between items-center">
              <div>
                <span className="font-semibold text-sm text-slate-600">Total de Itens:</span>
                <p className="font-bold text-lg text-slate-800">{totalItems} {totalItems === 1 ? 'item' : 'itens'}</p>
              </div>
              <div className="text-right">
                <span className="font-semibold text-sm text-slate-600">Total Previsto:</span>
                <p className="font-bold text-xl text-blue-700">{formatCurrency(totalCost)}</p>
              </div>
            </div>
          )}
        </div>
      </main>
      <ManageListsModal
        isOpen={isListsModalOpen}
        onClose={() => setIsListsModalOpen(false)}
        lists={lists}
        activeListId={activeListId}
        onSelectList={handleSelectList}
        onCreateNew={handleCreateNewList}
        onDelete={deleteList}
        onRename={renameList}
      />
      <ShareListModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        list={activeList}
      />
    </div>
  );
};

export default ShoppingList;