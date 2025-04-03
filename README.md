# json-to-ts-cvr

[![npm version](https://img.shields.io/npm/v/json-to-ts-cvr.svg)](https://www.npmjs.com/package/json-to-ts-cvr)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/krikera/json-typescript/actions/workflows/ci.yml/badge.svg)](https://github.com/krikera/json-typescript/actions/workflows/ci.yml)

> A CLI tool to convert JSON structures into TypeScript interfaces or classes

## Installation

```bash
# Install globally
npm install -g json-to-ts-cvr

# Or use with npx
npx json-to-ts-cvr [options]
```

## Features

- Convert JSON to TypeScript interfaces or classes
- Support for nested objects and arrays
- Generate proper type definitions (string, number, boolean, etc.)
- Auto-generate interface names from property names
- Customize interface/class names with prefixes
- Handle nullable fields

## Usage

### Convert JSON string to TypeScript interface

```bash
json-to-ts-cvr '{"name": "John", "age": 25}'
```

Output:
```typescript
interface Root {
  name: string;
  age: number;
}
```

### Convert JSON from a file and save to a TypeScript file

```bash
json-to-ts-cvr -i data.json -o types.ts
```

### Generate TypeScript classes instead of interfaces

```bash
json-to-ts-cvr -i data.json --class
```

Output:
```typescript
class Root {
  name: string;
  age: number;

  constructor(data: any) {
    this.name = data.name;
    this.age = data.age;
  }
}
```

### Add a prefix to all interface/class names

```bash
json-to-ts-cvr -i data.json --prefix I
```

Output:
```typescript
interface IRoot {
  name: string;
  age: number;
}
```

### Handle null values as union types

```bash
json-to-ts-cvr -i data.json --union-null
```

Output:
```typescript
interface Root {
  name: string;
  nickname: null;
}
```

## Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--input <file>` | `-i` | Input JSON file path |
| `--output <file>` | `-o` | Output TypeScript file path |
| `--class` | | Generate TypeScript classes instead of interfaces |
| `--union-null` | | Represent nullable fields as union types (field: string \| null) |
| `--prefix <prefix>` | | Prepend a custom prefix to all interface/class names |
| `--help` | `-h` | Display help information |
| `--version` | `-v` | Display version information |

## Examples

### Complex nested objects

Input:
```json
{
  "user": {
    "name": "John",
    "address": {
      "city": "New York",
      "zipCode": 10001
    },
    "hobbies": ["reading", "gaming"]
  }
}
```

Output:
```typescript
interface Root {
  user: User;
}

interface User {
  name: string;
  address: Address;
  hobbies: string[];
}

interface Address {
  city: string;
  zipCode: number;
}
```

## Development

```bash
# Clone the repository
git clone https://github.com/krikera/json-typescript.git
cd json-typescript

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Publishing

To publish to npm:

```bash
# Login to npm
npm login

# Publish package
npm publish
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 
