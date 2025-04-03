import { convertJsonToTypeScript } from './converter.js';

describe('JSON to TypeScript converter', () => {
  test('Convert simple JSON object to TypeScript interface', () => {
    const json = `{
      "name": "John",
      "age": 25,
      "isActive": true,
      "nullField": null
    }`;

    const result = convertJsonToTypeScript(json, {
      asClass: false,
      unionNull: false,
      prefix: ''
    });

    expect(result).toContain('interface Root {');
    expect(result).toContain('name: string;');
    expect(result).toContain('age: number;');
    expect(result).toContain('isActive: boolean;');
    expect(result).toContain('nullField?: any;');
  });

  test('Convert nested objects to TypeScript interfaces', () => {
    const json = `{
      "user": {
        "name": "John",
        "address": {
          "city": "New York",
          "zip": "10001"
        }
      }
    }`;

    const result = convertJsonToTypeScript(json, {
      asClass: false,
      unionNull: false,
      prefix: ''
    });

    expect(result).toContain('interface Root {');
    expect(result).toContain('user: User;');
    expect(result).toContain('interface User {');
    expect(result).toContain('name: string;');
    expect(result).toContain('address: Address;');
    expect(result).toContain('interface Address {');
    expect(result).toContain('city: string;');
    expect(result).toContain('zip: string;');
  });

  test('Convert arrays to TypeScript interfaces', () => {
    const json = `{
      "users": [
        {
          "name": "John",
          "age": 25
        },
        {
          "name": "Jane",
          "age": 24
        }
      ]
    }`;

    const result = convertJsonToTypeScript(json, {
      asClass: false,
      unionNull: false,
      prefix: ''
    });

    expect(result).toContain('interface Root {');
    expect(result).toContain('users: User[];');
    expect(result).toContain('interface User {');
    expect(result).toContain('name: string;');
    expect(result).toContain('age: number;');
  });

  test('Generate TypeScript classes', () => {
    const json = `{
      "name": "John",
      "age": 25
    }`;

    const result = convertJsonToTypeScript(json, {
      asClass: true,
      unionNull: false,
      prefix: ''
    });

    expect(result).toContain('class Root {');
    expect(result).toContain('name: string;');
    expect(result).toContain('age: number;');
    expect(result).toContain('constructor(data: any) {');
    expect(result).toContain('this.name = data.name;');
    expect(result).toContain('this.age = data.age;');
  });

  test('Apply prefix to interface names', () => {
    const json = `{
      "user": {
        "name": "John"
      }
    }`;

    const result = convertJsonToTypeScript(json, {
      asClass: false,
      unionNull: false,
      prefix: 'I'
    });

    expect(result).toContain('interface IRoot {');
    expect(result).toContain('user: IUser;');
    expect(result).toContain('interface IUser {');
  });

  test('Handle null values with union null option', () => {
    const json = `{
      "name": "John",
      "nickname": null
    }`;

    const result = convertJsonToTypeScript(json, {
      asClass: false,
      unionNull: true,
      prefix: ''
    });

    expect(result).toContain('interface Root {');
    expect(result).toContain('name: string;');
    expect(result).toContain('nickname: null;');
  });
}); 