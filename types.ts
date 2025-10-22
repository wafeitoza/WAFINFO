// FIX: Replaced placeholder content with the ShoppingItem interface definition to resolve import errors across the application.
export interface ShoppingItem {
  id: string;
  name: string;
  completed: boolean;
  emoji: string;
  quantity: number;
  price?: number;
  category?: string;
}

export interface ShoppingListType {
  id: string;
  name: string;
  items: ShoppingItem[];
}
