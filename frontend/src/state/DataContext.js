import React, { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 });

  /**
   * Fetch items with support for pagination & search.
   * @param {Object} params
   * @param {number} params.page
   * @param {number} params.limit
   * @param {string} params.q
   * @param {AbortSignal} params.signal Optional abort signal.
   */
  const fetchItems = useCallback(async ({ page = 1, limit = 50, q = '', signal } = {}) => {
    const search = new URLSearchParams({ page, limit, q }).toString();
    const res = await fetch(`http://localhost:3001/api/items?${search}`, { signal });
    if (!res.ok) throw new Error('Failed to fetch items');
    const { items: list, ...pagination } = await res.json();
    setItems(list);
    setMeta(pagination);
    return { list, pagination };
  }, []);

  return (
    <DataContext.Provider value={{ items, meta, fetchItems }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);