import React from 'react';

interface DataTableProps<T> {
  columns: { 
    key: keyof T | string; 
    header: string; 
    render?: (item: T) => React.ReactNode;
    sortable?: boolean;
  }[];
  data: T[];
  renderActions?: (item: T) => React.ReactNode;
  sortConfig?: { key: keyof T | string; direction: 'ascending' | 'descending' } | null;
  onSort?: (key: keyof T | string) => void;
}

const DataTable = <T extends { id: number | string }>(
  { columns, data, renderActions, sortConfig, onSort }: DataTableProps<T>
) => {
  return (
    <div className="overflow-x-auto bg-card border border-border rounded-xl shadow-sm">
      <table className="min-w-full divide-y divide-border">
        <thead style={{ backgroundColor: 'var(--table-header-bg)' }}>
          <tr>
            {columns.map((col) => (
              <th
                key={String(col.key)}
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider"
              >
                {col.sortable && onSort ? (
                  <button 
                    onClick={() => onSort(col.key)}
                    className="flex items-center gap-1 focus:outline-none"
                  >
                    <span>{col.header}</span>
                    {sortConfig?.key === col.key && (
                      <span className="text-text-main">{sortConfig.direction === 'ascending' ? '▲' : '▼'}</span>
                    )}
                  </button>
                ) : (
                  col.header
                )}
              </th>
            ))}
            {renderActions && (
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-card divide-y divide-border">
          {data.map((item, index) => (
            <tr 
              key={item.id} 
              className="hover:bg-table-row-hover transition-colors"
              style={{ 
                backgroundColor: index % 2 === 0 ? 'transparent' : 'var(--table-row-stripe)',
                '--table-row-hover': 'var(--table-row-hover)' 
              } as React.CSSProperties}
            >
              {columns.map((col) => (
                <td key={String(col.key)} className="px-6 py-4 whitespace-nowrap text-sm text-text-main">
                  {col.render ? col.render(item) : String(item[col.key as keyof T] ?? '')}
                </td>
              ))}
              {renderActions && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {renderActions(item)}
                </td>
              )}
            </tr>
          ))}
            {data.length === 0 && (
                <tr>
                    <td colSpan={columns.length + (renderActions ? 1 : 0)} className="text-center py-10 text-text-secondary">
                        No data available.
                    </td>
                </tr>
            )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;