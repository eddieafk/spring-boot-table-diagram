import React, { useState, useEffect } from 'react';
import { Relationship, Table } from '../types/index';

interface RelationshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (relationship: Omit<Relationship, 'id'>) => void;
  tables: Table[];
  editRelationship?: Relationship;
  existingRelationships: Relationship[];
}

const RelationshipModal: React.FC<RelationshipModalProps> = ({
  isOpen,
  onClose,
  onSave,
  tables,
  editRelationship,
  existingRelationships
}) => {
  const [source, setSource] = useState<string>('');
  const [sourceField, setSourceField] = useState<string>('');
  const [target, setTarget] = useState<string>('');
  const [targetField, setTargetField] = useState<string>('');
  const [type, setType] = useState<Relationship['type']>('OneToMany');
  const [errors, setErrors] = useState<{source?: string, target?: string, relationship?: string}>({});

  useEffect(() => {
    if (editRelationship) {
      setSource(editRelationship.source);
      setSourceField(editRelationship.sourceField);
      setTarget(editRelationship.target);
      setTargetField(editRelationship.targetField);
      setType(editRelationship.type);
    } else {
      setSource('');
      setSourceField('');
      setTarget('');
      setTargetField('');
      setType('OneToMany');
    }
    setErrors({});
  }, [editRelationship, isOpen]);

  const validateForm = () => {
    const newErrors: {source?: string, target?: string, relationship?: string} = {};
    
    if (!source) {
      newErrors.source = 'Source table is required';
    }
    
    if (!target) {
      newErrors.target = 'Target table is required';
    }
    
    if (source && target) {
      if (source === target) {
        newErrors.relationship = 'Source and target tables cannot be the same';
      } else {
        // Check if relationship already exists (unless we're editing that relationship)
        const isDuplicate = existingRelationships.some(rel => 
          rel.source === source && 
          rel.target === target && 
          (!editRelationship || rel.id !== editRelationship.id)
        );
        
        if (isDuplicate) {
          newErrors.relationship = 'This relationship already exists';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    onSave({
      source,
      sourceField,
      target,
      targetField,
      type
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      aria-modal="true"
      role="dialog"
      aria-labelledby="relationship-modal-title"
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 id="relationship-modal-title" className="text-xl font-bold mb-4">
          {editRelationship ? 'Edit Relationship' : 'Add Relationship'}
        </h2>
        
        <div className="mb-4">
          <label htmlFor="source-table" className="block mb-1">Source Table:</label>
          <select
            id="source-table"
            className={`w-full border p-2 rounded ${errors.source ? 'border-red-500' : ''}`}
            value={source}
            onChange={(e) => setSource(e.target.value)}
          >
            <option value="">Select source table</option>
            {tables.map(table => (
              <option key={table.id} value={table.id}>{table.name}</option>
            ))}
          </select>
          {errors.source && <p className="text-red-500 text-sm mt-1">{errors.source}</p>}
          
          <label htmlFor="source-field" className="block mb-1">Source Column:</label>
          <select
            id="source-field"
            className="w-full border p-2 rounded"
            value={sourceField}
            onChange={(e) => setSourceField(e.target.value)}
          >
            <option value="">Select source column</option>
            {source && tables.find(t => t.id === source)?.fields.map(field => (
              <option key={field.name} value={field.name}>{field.name}</option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label htmlFor="target-table" className="block mb-1">Target Table:</label>
          <select
            id="target-table"
            className={`w-full border p-2 rounded ${errors.target ? 'border-red-500' : ''}`}
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          >
            <option value="">Select target table</option>
            {tables.map(table => (
              <option key={table.id} value={table.id}>{table.name}</option>
            ))}
          </select>
          {errors.target && <p className="text-red-500 text-sm mt-1">{errors.target}</p>}
          
          <label htmlFor="target-field" className="block mb-1">Target Column:</label>
          <select
            id="target-field"
            className="w-full border p-2 rounded"
            value={targetField}
            onChange={(e) => setTargetField(e.target.value)}
          >
            <option value="">Select target column</option>
            {target && tables.find(t => t.id === target)?.fields.map(field => (
              <option key={field.name} value={field.name}>{field.name}</option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label htmlFor="relationship-type" className="block mb-1">Relationship Type:</label>
          <select
            id="relationship-type"
            className="w-full border p-2 rounded"
            value={type}
            onChange={(e) => setType(e.target.value as Relationship['type'])}
          >
            <option value="OneToMany">One To Many</option>
            <option value="ManyToOne">Many To One</option>
            <option value="OneToOne">One To One</option>
            <option value="ManyToMany">Many To Many</option>
          </select>
        </div>
        
        {errors.relationship && (
          <p className="text-red-500 text-sm mb-4">{errors.relationship}</p>
        )}
        
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
            {editRelationship ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RelationshipModal;