export interface Field {
  name: string;
  type: string;
  isPrimary: boolean;
  constraints: string[];
}

export interface Table {
  id: string;
  name: string;
  fields: Field[];
  position: {
    x: number;
    y: number;
  };
}

export interface Relationship {
  id: string;
  source: string; // source table id
  sourceField: string; // source column name
  target: string; // target table id 
  targetField: string; // target column name
  type: 'OneToMany' | 'ManyToOne' | 'OneToOne' | 'ManyToMany';
}

export type DragOffset = {
  x: number;
  y: number;
};

export type FieldType = 
  | 'String'
  | 'Long'
  | 'Integer'
  | 'Double'
  | 'Float'
  | 'Boolean'
  | 'Date'
  | 'LocalDate'
  | 'LocalDateTime';

export type FieldConstraint = 'NotNull' | 'Unique';