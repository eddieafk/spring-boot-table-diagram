import React, { useState, useEffect } from 'react';
import { Field, FieldType, FieldConstraint, Table } from '../types/index';

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (table: Omit<Table, 'id' | 'position'>) => void;
  editTable?: Table;
}

const TableModal: React.FC<TableModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave,
  editTable 
}) => {
  const [tableName, setTableName] = useState('');
  const [tableFields, setTableFields] = useState<Field[]>([
    { name: 'id', type: 'Long', isPrimary: true, constraints: ['NotNull'] }
  ]);
  const [errors, setErrors] = useState<{name?: string, fields?: string}>({});

  useEffect(() => {
    if (editTable) {
      setTableName(editTable.name);
      setTableFields([...editTable.fields]);
    } else {
      // Reset form for new table
      setTableName('');
      setTableFields([{ name: 'id', type: 'Long', isPrimary: true, constraints: ['NotNull'] }]);
    }
    setErrors({});
  }, [editTable, isOpen]);

  const handleFieldChange = (index: number, field: Field) => {
    const newFields = [...tableFields];
    newFields[index] = field;
    setTableFields(newFields);
  };

  const handleAddField = () => {
    setTableFields([...tableFields, { 
      name: '', 
      type: 'String', 
      isPrimary: false, 
      constraints: [] 
    }]);
  };

  const handleRemoveField = (index: number) => {
    if (tableFields.length > 1) {
      const newFields = [...tableFields];
      newFields.splice(index, 1);
      setTableFields(newFields);
    }
  };

  const validateForm = () => {
    const newErrors: {name?: string, fields?: string} = {};
    
    // Validate table name
    if (!tableName.trim()) {
      newErrors.name = 'Table name is required';
    }
    
    // Validate fields
    const fieldNames = new Set<string>();
    let hasPrimaryKey = false;
    
    for (const field of tableFields) {
      if (!field.name.trim()) {
        newErrors.fields = 'All fields must have names';
        break;
      }
      
      if (fieldNames.has(field.name)) {
        newErrors.fields = 'Field names must be unique';
        break;
      }
      
      fieldNames.add(field.name);
      if (field.isPrimary) hasPrimaryKey = true;
    }
    
    if (!hasPrimaryKey) {
      newErrors.fields = 'At least one field must be a primary key';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    onSave({
      name: tableName,
      fields: tableFields,
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-screen overflow-auto">
        <h2 id="modal-title" className="text-xl font-bold mb-4">
          {editTable ? 'Edit Table' : 'Add New Table'}
        </h2>
        
        <div className="mb-4">
          <label htmlFor="table-name" className="block mb-1">Table Name:</label>
          <input
            id="table-name"
            type="text"
            className={`w-full border p-2 rounded ${errors.name ? 'border-red-500' : ''}`}
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            placeholder="Enter table name"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block">Fields:</label>
            <button
              type="button"
              className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm hover:bg-blue-200"
              onClick={handleAddField}
            >
              + Add Field
            </button>
          </div>
          
          {errors.fields && <p className="text-red-500 text-sm mb-2">{errors.fields}</p>}
          
          <div className="max-h-64 overflow-y-auto border rounded p-2">
            {tableFields.map((field, index) => (
              <div key={index} className="flex gap-2 mb-2 items-center">
                <input
                  type="text"
                  placeholder="Field name"
                  className="flex-1 border p-2 rounded"
                  value={field.name}
                  onChange={(e) => handleFieldChange(index, { ...field, name: e.target.value })}
                />
                
                <select
                  className="border p-2 rounded"
                  value={field.type}
                  onChange={(e) => handleFieldChange(index, { 
                    ...field, 
                    type: e.target.value as FieldType 
                  })}
                >
                  <option value="String">String</option>
                  <option value="Long">Long</option>
                  <option value="Integer">Integer</option>
                  <option value="Double">Double</option>
                  <option value="Float">Float</option>
                  <option value="Boolean">Boolean</option>
                  <option value="Date">Date</option>
                  <option value="LocalDate">LocalDate</option>
                  <option value="LocalDateTime">LocalDateTime</option>
                </select>
                
                <div className="flex items-center space-x-2">
                  <label className="flex items-center whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={field.isPrimary}
                      onChange={(e) => handleFieldChange(index, { 
                        ...field, 
                        isPrimary: e.target.checked 
                      })}
                      className="mr-1"
                    />
                    PK
                  </label>
                  
                  <label className="flex items-center whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={field.constraints.includes('NotNull')}
                      onChange={(e) => {
                        const constraints = [...field.constraints];
                        if (e.target.checked) {
                          constraints.push('NotNull');
                        } else {
                          const idx = constraints.indexOf('NotNull');
                          if (idx !== -1) constraints.splice(idx, 1);
                        }
                        handleFieldChange(index, { ...field, constraints });
                      }}
                      className="mr-1"
                    />
                    Not Null
                  </label>
                  
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveField(index)}
                    aria-label="Remove field"
                    title="Remove field"
                    disabled={tableFields.length <= 1}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="bg-gray-300 p-2 rounded hover:bg-gray-400"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            onClick={handleSubmit}
          >
            {editTable ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableModal;