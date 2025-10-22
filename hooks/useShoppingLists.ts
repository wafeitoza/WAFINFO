import { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { ShoppingListType, ShoppingItem } from '../types';

const LOCAL_STORAGE_KEY = 'shoppingListsData';

// Function to safely parse JSON from localStorage
const loadFromStorage = (): { lists: ShoppingListType[]; activeListId: string | null } => {
  try {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedData) {
      const data = JSON.parse(storedData);
      // Basic validation
      if (data && Array.isArray(data.lists) && typeof data.activeListId === 'string') {
        return data;
      }
    }
    
    // Check for old data structure for migration
    const oldStoredItems = localStorage.getItem('shoppingListItems');
    if (oldStoredItems) {
      const items: ShoppingItem[] = JSON.parse(oldStoredItems);
      const migratedList: ShoppingListType = {
        id: uuidv4(),
        name: 'Minha Lista Antiga',
        items: items,
      };
      localStorage.removeItem('shoppingListItems'); // Clean up old key
      return { lists: [migratedList], activeListId: migratedList.id };
    }

  } catch (error) {
    console.error("Error reading from localStorage:", error);
  }
  
  // Default state if nothing is found or an error occurs
  const defaultList: ShoppingListType = { id: uuidv4(), name: 'Nova Lista', items: [] };
  return { lists: [defaultList], activeListId: defaultList.id };
};

export const useShoppingLists = () => {
  const [lists, setLists] = useState<ShoppingListType[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);

  useEffect(() => {
    const { lists: loadedLists, activeListId: loadedActiveId } = loadFromStorage();
    setLists(loadedLists);
    
    if (loadedLists.some(l => l.id === loadedActiveId)) {
        setActiveListId(loadedActiveId);
    } else if (loadedLists.length > 0) {
        setActiveListId(loadedLists[0].id);
    } else {
        const defaultList: ShoppingListType = { id: uuidv4(), name: 'Nova Lista', items: [] };
        setLists([defaultList]);
        setActiveListId(defaultList.id);
    }

  }, []);

  useEffect(() => {
    // Prevent saving empty initial state before loading from storage
    if (lists.length === 0 && !activeListId) return;
    try {
      const dataToStore = JSON.stringify({ lists, activeListId });
      localStorage.setItem(LOCAL_STORAGE_KEY, dataToStore);
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  }, [lists, activeListId]);

  const activeList = useMemo(() => {
    return lists.find(list => list.id === activeListId) || null;
  }, [lists, activeListId]);
  
  const createNewList = () => {
    const newList: ShoppingListType = {
      id: uuidv4(),
      name: 'Nova Lista',
      items: [],
    };
    setLists(prevLists => [...prevLists, newList]);
    setActiveListId(newList.id);
  };

  const deleteList = (listId: string) => {
    setLists(prevLists => {
        const remainingLists = prevLists.filter(list => list.id !== listId);
        if (activeListId === listId) {
            if (remainingLists.length > 0) {
                setActiveListId(remainingLists[0].id);
            } else {
                const newList: ShoppingListType = { id: uuidv4(), name: 'Nova Lista', items: [] };
                setActiveListId(newList.id);
                return [newList];
            }
        }
        return remainingLists;
    });
  };
  
  const renameList = (listId: string, newName: string) => {
    setLists(prevLists => 
      prevLists.map(list => 
        list.id === listId ? { ...list, name: newName } : list
      )
    );
  };

  const updateActiveListItems = (newItems: ShoppingItem[]) => {
    if (!activeListId) return;
    setLists(prevLists =>
      prevLists.map(list =>
        list.id === activeListId ? { ...list, items: newItems } : list
      )
    );
  };

  return {
    lists,
    activeList,
    activeListId,
    setActiveListId,
    createNewList,
    deleteList,
    renameList,
    updateActiveListItems
  };
};
