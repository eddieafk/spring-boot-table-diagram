import { Table, Relationship } from '../types/index';

const capitalizeFirstLetter = (string: string): string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const camelCase = (str: string): string => {
  return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
};

export const generateJavaCode = (tables: Table[], relationships: Relationship[]): string => {
  let code = '';
  
  tables.forEach(table => {
    // Start with imports
    code += `import javax.persistence.*;\n`;
    code += `import lombok.*;\n`;
    code += `import java.util.*;\n\n`;
    
    // Add class annotations
    code += `@Entity\n`;
    code += `@Table(name = "${table.name.toLowerCase()}")\n`;
    code += `@Data\n`;
    code += `@NoArgsConstructor\n`;
    code += `@AllArgsConstructor\n`;
    code += `@Builder\n`;
    code += `public class ${capitalizeFirstLetter(table.name)} {\n\n`;
    
    // Add fields
    table.fields.forEach(field => {
      // Add field annotations
      if (field.isPrimary) {
        code += `    @Id\n`;
        code += `    @GeneratedValue(strategy = GenerationType.IDENTITY)\n`;
      }
      
      field.constraints.forEach(constraint => {
        if (constraint === 'NotNull') {
          code += `    @Column(nullable = false)\n`;
        } else if (constraint === 'Unique') {
          code += `    @Column(unique = true)\n`;
        }
      });
      
      // Add the field declaration
      code += `    private ${field.type} ${field.name};\n\n`;
    });
    
    // Add relationships
    relationships.forEach(rel => {
      if (rel.source === table.id) {
        const targetTable = tables.find(t => t.id === rel.target);
        if (targetTable) {
          const targetClassName = capitalizeFirstLetter(targetTable.name);
          const targetVariableName = camelCase(targetTable.name);
          
          if (rel.type === 'OneToMany') {
            code += `    @OneToMany(mappedBy = "${camelCase(table.name)}", cascade = CascadeType.ALL)\n`;
            code += `    private List<${targetClassName}> ${targetVariableName}List;\n\n`;
          } else if (rel.type === 'ManyToOne') {
            code += `    @ManyToOne\n`;
            code += `    @JoinColumn(name = "${targetVariableName}_id")\n`;
            code += `    private ${targetClassName} ${targetVariableName};\n\n`;
          } else if (rel.type === 'OneToOne') {
            code += `    @OneToOne(cascade = CascadeType.ALL)\n`;
            code += `    @JoinColumn(name = "${targetVariableName}_id")\n`;
            code += `    private ${targetClassName} ${targetVariableName};\n\n`;
          } else if (rel.type === 'ManyToMany') {
            code += `    @ManyToMany\n`;
            code += `    @JoinTable(\n`;
            code += `        name = "${table.name.toLowerCase()}_${targetTable.name.toLowerCase()}",\n`;
            code += `        joinColumns = @JoinColumn(name = "${table.name.toLowerCase()}_id"),\n`;
            code += `        inverseJoinColumns = @JoinColumn(name = "${targetTable.name.toLowerCase()}_id")\n`;
            code += `    )\n`;
            code += `    private List<${targetClassName}> ${targetVariableName}List;\n\n`;
          }
        }
      }
    });
    
    // Close the class
    code += `}\n\n`;
  });
  
  return code;
};

export const generateSpringRepositories = (tables: Table[]): string => {
  let code = '';
  
  tables.forEach(table => {
    const className = capitalizeFirstLetter(table.name);
    
    code += `import org.springframework.data.jpa.repository.JpaRepository;\n`;
    code += `import org.springframework.stereotype.Repository;\n\n`;
    
    code += `@Repository\n`;
    code += `public interface ${className}Repository extends JpaRepository<${className}, Long> {\n`;
    code += `    // Add custom query methods here\n`;
    code += `}\n\n`;
  });
  
  return code;
};