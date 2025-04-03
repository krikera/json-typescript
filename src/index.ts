#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs/promises';
import { convertJsonToTypeScript } from './converter.js';
import { fileExists } from './utils/fileUtils.js';

// Create a new program instance
const program = new Command();

// Set up CLI configuration
program
  .name('json-to-ts')
  .description('Converts JSON to TypeScript interfaces')
  .version('1.0.0')
  .argument('[json]', 'JSON string to convert')
  .option('-i, --input <file>', 'Input JSON file path')
  .option('-o, --output <file>', 'Output TypeScript file path')
  .option('--class', 'Generate TypeScript classes instead of interfaces')
  .option('--union-null', 'Represent nullable fields as union types (field: string | null)')
  .option('--prefix <prefix>', 'Prepend a custom prefix to all interface/class names')
  .action(async (jsonString, options) => {
    try {
      let jsonData: string = '';

      // Determine the JSON source (argument or file)
      if (options.input) {
        if (!await fileExists(options.input)) {
          console.error(`Error: Input file '${options.input}' does not exist.`);
          process.exit(1);
        }
        jsonData = await fs.readFile(options.input, 'utf-8');
      } else if (jsonString) {
        jsonData = jsonString;
      } else {
        program.help();
        return;
      }

      // Convert JSON to TypeScript
      const tsCode = convertJsonToTypeScript(jsonData, {
        asClass: options.class || false,
        unionNull: options.unionNull || false,
        prefix: options.prefix || '',
      });

      // Output the result
      if (options.output) {
        await fs.writeFile(options.output, tsCode, 'utf-8');
        console.log(`TypeScript code written to ${options.output}`);
      } else {
        console.log(tsCode);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
      } else {
        console.error('An unknown error occurred');
      }
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse(); 