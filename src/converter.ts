import pluralize from 'pluralize';

export interface ConversionOptions {
  asClass: boolean;
  unionNull: boolean;
  prefix: string;
}

export interface InterfaceProperty {
  name: string;
  type: string;
  isOptional: boolean;
}

export interface GeneratedInterface {
  name: string;
  properties: InterfaceProperty[];
}

/**
 * Convert JSON string to TypeScript interfaces or classes
 */
export function convertJsonToTypeScript(jsonString: string, options: ConversionOptions): string {
  try {
    // Parse the JSON string
    const jsonData = JSON.parse(jsonString);

    // Generate interfaces from JSON
    const interfaces = generateInterfaces(jsonData, options);

    // Convert interfaces to TypeScript code
    return generateTypeScriptCode(interfaces, options);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to convert JSON: ${error.message}`);
    }
    throw new Error('Failed to convert JSON');
  }
}

/**
 * Generate TypeScript interfaces from parsed JSON data
 */
function generateInterfaces(
  data: any,
  options: ConversionOptions,
  interfaceName = 'Root',
  generatedInterfaces: Map<string, GeneratedInterface> = new Map()
): Map<string, GeneratedInterface> {
  // Apply prefix to the interface name
  const prefixedName = options.prefix + interfaceName;

  if (typeof data !== 'object' || data === null) {
    return generatedInterfaces;
  }

  const properties: InterfaceProperty[] = [];

  // Process each property in the object
  for (const [key, value] of Object.entries(data)) {
    const prop: InterfaceProperty = {
      name: key,
      type: determineType(value, key, options, generatedInterfaces),
      isOptional: value === null && !options.unionNull
    };

    properties.push(prop);
  }

  // Add the interface to our collection
  generatedInterfaces.set(prefixedName, { name: prefixedName, properties });

  return generatedInterfaces;
}

/**
 * Determine the TypeScript type for a given value
 */
function determineType(
  value: any,
  key: string,
  options: ConversionOptions,
  generatedInterfaces: Map<string, GeneratedInterface>
): string {
  if (value === null) {
    return options.unionNull ? 'null' : 'any';
  }

  switch (typeof value) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'object':
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return 'any[]';
        }

        // For array items, we'll try to determine a common type
        // First, check if all items are of the same primitive type
        const arrayItemType = determineArrayItemType(value, key, options, generatedInterfaces);
        return `${arrayItemType}[]`;
      } else {
        // Generate a name for the nested interface based on the property name
        const nestedInterfaceName = generateNestedInterfaceName(key);
        const prefixedName = options.prefix + nestedInterfaceName;

        // Generate interfaces for the nested object
        generateInterfaces(value, options, nestedInterfaceName, generatedInterfaces);

        return prefixedName;
      }
    default:
      return 'any';
  }
}

/**
 * Generate a name for a nested interface based on a property name
 */
function generateNestedInterfaceName(propertyName: string): string {
  // Convert property name to PascalCase for interface name
  let interfaceName = propertyName
    .replace(/^\w/, c => c.toUpperCase())
    .replace(/[-_](\w)/g, (_, c) => c.toUpperCase());

  // If property is plural, make it singular for the interface name
  if (pluralize.isPlural(interfaceName)) {
    interfaceName = pluralize.singular(interfaceName);
  }

  return interfaceName;
}

/**
 * Determine the type of items in an array
 */
function determineArrayItemType(
  array: any[],
  key: string,
  options: ConversionOptions,
  generatedInterfaces: Map<string, GeneratedInterface>
): string {
  // Check if all items are of the same type
  const itemTypes = new Set(array.map(item => typeof item));

  // Special handling for array of objects
  if (itemTypes.size === 1 && itemTypes.has('object')) {
    const nonNullItems = array.filter(item => item !== null);

    // If all items are null, return any
    if (nonNullItems.length === 0) {
      return 'any';
    }

    // If all items are objects (not null), create an interface for them
    if (nonNullItems.every(item => item !== null && !Array.isArray(item))) {
      // Create a merged object with all properties from the array items
      const mergedObject = nonNullItems.reduce((merged, obj) => {
        return { ...merged, ...obj };
      }, {});

      // Generate a name for the array item interface based on the property name
      const singularKey = pluralize.singular(key);
      const itemInterfaceName = generateNestedInterfaceName(singularKey);

      // Generate interfaces for the merged object
      generateInterfaces(mergedObject, options, itemInterfaceName, generatedInterfaces);

      return options.prefix + itemInterfaceName;
    }

    // If items are arrays, try to determine their type recursively
    if (nonNullItems.every(item => Array.isArray(item))) {
      const nestedArrayItemType = determineArrayItemType(
        nonNullItems.flat(),
        pluralize.singular(key),
        options,
        generatedInterfaces
      );
      return `${nestedArrayItemType}[]`;
    }
  }

  // If items are of mixed types or not objects, determine a common type
  const types = new Set();

  for (const item of array) {
    if (item === null) {
      types.add('null');
    } else if (typeof item === 'object') {
      if (Array.isArray(item)) {
        types.add('array');
      } else {
        types.add('object');
      }
    } else {
      types.add(typeof item);
    }
  }

  // If there's only one type, use it
  if (types.size === 1) {
    const type = Array.from(types)[0];

    if (type === 'string') return 'string';
    if (type === 'number') return 'number';
    if (type === 'boolean') return 'boolean';
    if (type === 'null') return options.unionNull ? 'null' : 'any';
  }

  // For mixed types, use any
  return 'any';
}

/**
 * Generate TypeScript code from the interface definitions
 */
function generateTypeScriptCode(
  interfaces: Map<string, GeneratedInterface>,
  options: ConversionOptions
): string {
  let code = '';

  // Iterate through all generated interfaces
  for (const [name, interfaceData] of interfaces) {
    // Add interface or class definition
    code += options.asClass ? `class ${name} {\n` : `interface ${name} {\n`;

    // Add properties
    for (const prop of interfaceData.properties) {
      // Don't add null union for properties that are already null type
      const typeWithNull = prop.type;
      const optionalIndicator = prop.isOptional ? '?' : '';

      code += `  ${prop.name}${optionalIndicator}: ${typeWithNull};\n`;
    }

    // Add constructor if generating a class
    if (options.asClass) {
      code += '\n  constructor(data: any) {\n';

      for (const prop of interfaceData.properties) {
        code += `    this.${prop.name} = data.${prop.name};\n`;
      }

      code += '  }\n';
    }

    code += '}\n\n';
  }

  return code.trim();
} 