import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

const PAGE_SIZE = 50;

function Items() {
  const { items, meta, fetchItems } = useData();
  const [search, setSearch] = useState('');
  const abortRef = useRef();

  const load = useCallback(
    ({ page = 1, q = search }) => {
      // Abort previous fetch if still in-flight
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      fetchItems({ page, limit: PAGE_SIZE, q, signal: controller.signal }).catch(err => {
        if (err.name !== 'AbortError') console.error(err);
      });
    },
    [fetchItems, search]
  );

  useEffect(() => {
    load({ page: 1 });

    return () => {
      // abort pending fetch on unmount to avoid memory leaks
      if (abortRef.current) abortRef.current.abort();
    };
  }, [load]);

  const handleSearchSubmit = e => {
    e.preventDefault();
    load({ page: 1, q: search });
  };

  const handlePageChange = newPage => {
    load({ page: newPage });
  };

  if (!items.length) return <p>Loading...</p>;

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <form onSubmit={handleSearchSubmit} style={{ marginBottom: 8 }}>
        <input
          type="text"
          value={search}
          placeholder="Search..."
          onChange={e => setSearch(e.target.value)}
          aria-label="Search items"
        />
        <button type="submit">Search</button>
      </form>

      {/* List with virtualization */}
      <div style={{ height: '60vh' }}>
        <AutoSizer>
          {({ height, width }) => (
            <List
              height={height}
              itemCount={items.length}
              itemSize={40}
              width={width}
            >
              {({ index, style }) => {
                const item = items[index];
                return (
                  <div style={style} key={item.id}>
                    <Link to={'/items/' + item.id}>{item.name}</Link>
                  </div>
                );
              }}
            </List>
          )}
        </AutoSizer>
      </div>

      {/* Pagination controls */}
      <div style={{ marginTop: 8 }}>
        <button
          onClick={() => handlePageChange(meta.page - 1)}
          disabled={meta.page <= 1}
        >
          Previous
        </button>
        <span style={{ margin: '0 8px' }}>
          Page {meta.page} of {meta.totalPages}
        </span>
        <button
          onClick={() => handlePageChange(meta.page + 1)}
          disabled={meta.page >= meta.totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Items;