#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import minimist from 'minimist';

// Extract package name from command line arguments
const args = minimist(process.argv.slice(2));
const packageName = args._[0];

// Function to check for typos
function checkForTypos(packageName: string): string | undefined {
  const trustedModules = fs.readFileSync('/Users/olsenbudanur/Desktop/my_stuff/Projects/typosquating/src/top1000libs.txt', 'utf-8').split('\n');

  for (const module of trustedModules) {
    
    const distance = levenshteinDistance(packageName, module);
    //
    // This distance means that the package name is a trusted module
    if (distance == 0) {
      return undefined;
    }
    //
    // This distance means that the package name might be typo of a trusted module
    if (distance > 0 && distance <= 3) {
      return module;
    }
  }
  return undefined;
}

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = [];
  for (let i = 0; i <= m; i++) {
    dp[i] = [];
    dp[i][0] = i;
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1, // Deletion
          dp[i][j - 1] + 1, // Insertion
          dp[i - 1][j - 1] + 1 // Substitution
        );
      }
    }
  }
  return dp[m][n];
}

// Prompt user for confirmation if typos are detected
function promptForConfirmation(packageName: string, typo: string) {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.question(`Did you mean to install '${typo}'? (Y/N): `, (answer: any) => {
    if (answer.toLowerCase() !== 'y') {
      console.log('Installation aborted.');
      readline.close();
      process.exit(1);
    } else {
      readline.close();
      executeOriginalNpmInstall(typo);
    }
  });
}

// Execute the original npm install command
function executeOriginalNpmInstall(packageName: string) {
  console.log(`2: ${packageName}`);
  const originalNpm = path.join(process.env.npm_execpath || process.env.NODE_EXE || 'npm');

  console.log(`3: ${originalNpm}`)

  const command = `${originalNpm} install ${packageName}`;

  console.log(`4: ${command}`)

  console.log(`Executing command: ${command}`);
  const child_process = require('child_process');
  child_process.execSync(command, { stdio: 'inherit' });
}

// Main function
function main() {
  if (!packageName) {
    console.error('Usage: safeinstall <package_name>');
    process.exit(1);
  }

  console.log(`1: ${packageName}`);

  let typo = checkForTypos(packageName);

  if (typo !== undefined) {
    promptForConfirmation(packageName, typo);
  } else {
    executeOriginalNpmInstall(packageName);
  }
}

// Run the main function
main();
