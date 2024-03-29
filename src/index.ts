#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const minimist = require('minimist');

// Extract package name from command line arguments
const args = minimist(process.argv.slice(2));
const packageName = args._[0];

// Function to check for typos
function checkForTypos(packageName) {
  return true;
//   return packageName.includes('typo');
}

// Prompt user for confirmation if typos are detected
function promptForConfirmation(packageName) {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.question(`Did you mean to install '${packageName}'? (Y/N): `, (answer) => {
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
function executeOriginalNpmInstall(packageName) {
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
