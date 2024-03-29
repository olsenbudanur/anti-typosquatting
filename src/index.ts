#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import minimist from 'minimist';

// Extract package name from command line arguments
const args = minimist(process.argv.slice(2));
const packageName = args._[0];

// Function to check for typos
function checkForTypos(packageName: string) {
  const trustedModules = ['react', 'lodash', 'axios', 'express']; // List of known trusted npm modules
  for (const module of trustedModules) {
    const distance = levenshteinDistance(packageName, module);
    if (distance < 2) {
      return true;
    }
  }
  return false;
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
function promptForConfirmation(packageName: string) {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.question(`Did you mean to install '${packageName}'? (Y/N): `, (answer: any) => {
    if (answer.toLowerCase() !== 'y') {
      console.log('Installation aborted.');
      readline.close();
      process.exit(1);
    } else {
      readline.close();
      executeOriginalNpmInstall(packageName);
    }
  });
}

// Execute the original npm install command
function executeOriginalNpmInstall(packageName: string) {
  const originalNpm = path.join(process.env.npm_execpath || process.env.NODE_EXE || 'npm');
  const command = `${originalNpm} install ${packageName}`;

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

  if (checkForTypos(packageName)) {
    promptForConfirmation(packageName);
  } else {
    executeOriginalNpmInstall(packageName);
  }
}

// Run the main function
main();
