import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Table, Field, Relationship, DragOffset } from './types/index';
import TableCard from './diagram/TableCard';
import RelationshipLines from './diagram/RelationshipLines';
import TableModal from './modals/TableModal';
import RelationshipModal from './modals/RelationshipModal';
import { generateJavaCode, generateSpringRepositories } from './utils/codeGenerator';

const App: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [currentTable, setCurrentTable] = useState<Table | null>(null);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [draggedTable, setDraggedTable] = useState<Table | null>(null);
  const [dragOffset, setDragOffset] = useState<DragOffset>({ x: 0, y: 0 });
  
  // Modals state
  const [showTableModal, setShowTableModal] = useState(false);
  const [showRelationshipModal, setShowRelationshipModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | undefined>(undefined);
  const [editingRelationship, setEditingRelationship] = useState<Relationship | undefined>(undefined);
  const [codeType, setCodeType] = useState<'entities' | 'repositories'>('entities');
  
  // Generated code
  const [generatedCode, setGeneratedCode] = useState('');
  
  // Canvas ref for scroll position when dragging
  const canvasRef = useRef<HTMLDivElement>(null);

  // Table CRUD operations
  const handleAddTable = () => {
    setEditingTable(undefined);
    setShowTableModal(true);
  };

  const handleEditTable = (table: Table) => {
    setEditingTable(table);
    setShowTableModal(true);
  };

  const handleDeleteTable = (tableId: string) => {
    if (window.confirm('Are you sure you want to delete this table? All relationships connected to it will also be deleted.')) {
      setTables(tables.filter(t => t.id !== tableId));
      setRelationships(relationships.filter(r => r.source !== tableId && r.target !== tableId));
      if (currentTable?.id === tableId) {
        setCurrentTable(null);
      }
    }
  };

  const handleSaveTable = (tableData: Omit<Table, 'id' | 'position'>) => {
    if (editingTable) {
      // Update existing table
      setTables(tables.map(t => 
        t.id === editingTable.id 
          ? { ...t, name: tableData.name, fields: tableData.fields } 
          : t
      ));
    } else {
      // Create new table
      const newTable: Table = {
        id: Date.now().toString(),
        name: tableData.name,
        fields: tableData.fields,
        position: { x: 100, y: 100 }
      };
      setTables([...tables, newTable]);
    }
    setShowTableModal(false);
  };

  // Relationship CRUD operations
  const handleAddRelationship = () => {
    setEditingRelationship(undefined);
    setShowRelationshipModal(true);
  };

  const handleEditRelationship = (relationship: Relationship) => {
    setEditingRelationship(relationship);
    setShowRelationshipModal(true);
  };

  const handleDeleteRelationship = (relationshipId: string) => {
    if (window.confirm('Are you sure you want to delete this relationship?')) {
      setRelationships(relationships.filter(r => r.id !== relationshipId));
    }
  };

  const handleSaveRelationship = (relationshipData: Omit<Relationship, 'id'>) => {
    if (editingRelationship) {
      // Update existing relationship
      setRelationships(relationships.map(r => 
        r.id === editingRelationship.id 
          ? { ...r, ...relationshipData } 
          : r
      ));
    } else {
      // Create new relationship
      const newRelationship: Relationship = {
        id: Date.now().toString(),
        ...relationshipData
      };
      setRelationships([...relationships, newRelationship]);
    }
    setShowRelationshipModal(false);
  };

  // Code generation
  const handleGenerateCode = () => {
    let code = '';
    if (codeType === 'entities') {
      code = generateJavaCode(tables, relationships);
    } else if (codeType === 'repositories') {
      code = generateSpringRepositories(tables);
    }
    setGeneratedCode(code);
    setShowCodeModal(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggedTable && canvasRef.current) {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scrollLeft = canvas.scrollLeft;
        const scrollTop = canvas.scrollTop;
        
        const newX = e.clientX - rect.left - dragOffset.x + scrollLeft;
        const newY = e.clientY - rect.top - dragOffset.y + scrollTop;

        setTables(tables.map(t =>
          t.id === draggedTable.id
            ? { ...t, position: { x: newX, y: newY } }
            : t
        ));
      }
    };

    const handleMouseUp = () => {
      setDraggedTable(null);
    };

    if (draggedTable) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedTable, tables, dragOffset]);

  return (
    <div className="App h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Database Design Tool</h1>
          <div className="space-x-2">
            <button
              onClick={handleAddTable}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Table
            </button>
            <button
              onClick={handleAddRelationship}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Add Relationship
            </button>
            <button
              onClick={handleGenerateCode}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Generate Code
            </button>
          </div>
        </div>
      </header>

      {/* Main Canvas */}
      <div 
        ref={canvasRef}
        className="flex-1 relative overflow-auto bg-gray-100"
      >
        {/* Relationship Lines Layer */}
        <RelationshipLines
          relationships={relationships}
          tables={tables}
        />

        {/* Tables Layer */}
        {tables.map(table => (
          <TableCard
            key={table.id}
            table={table}
            isSelected={currentTable?.id === table.id}
            onTableClick={(table) => setCurrentTable(table)}
            onStartDrag={(e, table) => {
              setDraggedTable(table);
              const rect = (e.target as HTMLElement).getBoundingClientRect();
              setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
              });
            }}
          />
        ))}
      </div>

      {/* Modals */}
      <TableModal
        isOpen={showTableModal}
        onClose={() => setShowTableModal(false)}
        onSave={handleSaveTable}
        editTable={editingTable}
      />

      <RelationshipModal
        isOpen={showRelationshipModal}
        onClose={() => setShowRelationshipModal(false)}
        onSave={handleSaveRelationship}
        tables={tables}
        editRelationship={editingRelationship}
        existingRelationships={relationships}
      />

      {/* Code Generation Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <div className="space-x-2">
                <button
                  className={`px-3 py-1 rounded ${
                    codeType === 'entities' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                  onClick={() => setCodeType('entities')}
                >
                  Entities
                </button>
                <button
                  className={`px-3 py-1 rounded ${
                    codeType === 'repositories' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
                  onClick={() => setCodeType('repositories')}
                >
                  Repositories
                </button>
              </div>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowCodeModal(false)}
              >
                ✕
              </button>
            </div>
            <pre className="bg-gray-50 p-4 rounded overflow-x-auto">
              {generatedCode}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;