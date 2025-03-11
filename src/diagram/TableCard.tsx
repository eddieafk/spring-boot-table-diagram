import React from 'react';
import { Table, Field } from '../types/index';

interface TableCardProps {
  table: Table;
  isSelected: boolean;
  onTableClick: (table: Table) => void;
  onStartDrag: (e: React.MouseEvent, table: Table) => void;
}

const TableCard: React.FC<TableCardProps> = ({ 
  table, 
  isSelected, 
  onTableClick, 
  onStartDrag 
}) => {
  return (
    <div
      className={`absolute bg-white border-2 ${isSelected ? 'border-blue-500' : 'border-gray-300'} rounded shadow-lg w-64`}
      style={{
        left: `${table.position.x}px`,
        top: `${table.position.y}px`
      }}
      onClick={() => onTableClick(table)}
      aria-selected={isSelected}
      role="button"
      tabIndex={0}
    >
      <div 
        className="bg-blue-500 text-white p-2 font-bold cursor-move flex justify-between items-center"
        onMouseDown={(e) => onStartDrag(e, table)}
        aria-label={`Table ${table.name}, drag to move`}
      >
        <span>{table.name}</span>
        <span className="text-xs bg-blue-700 rounded px-1" title="Number of fields">
          {table.fields.length}
        </span>
      </div>
      <div className="p-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-1">Field</th>
              <th className="text-left p-1">Type</th>
              <th className="text-left p-1">Constraints</th>
            </tr>
          </thead>
          <tbody>
            {table.fields.map((field, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="p-1">
                  {field.isPrimary ? '🔑 ' : ''}{field.name}
                </td>
                <td className="p-1">{field.type}</td>
                <td className="p-1">
                  {field.constraints.join(', ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableCard;