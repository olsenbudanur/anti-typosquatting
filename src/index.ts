#!/usr/bin/env node
//
// ^ need the shebang line to make this file executable

//
// Dependencies
import minimist from 'minimist';
import fs from 'fs';

//
// Utils
import {
  checkForTypos, // <-- Runs the Levenshtein distance algorithm on the package name and trusted modules
  executeNpmInstall, // <-- Executes the original npm install command
  promptForConfirmation, // <-- Prompts the user for confirmation if the package name is a typo
} from './utils/utils';

//
// Top libraries download
import { getLatestTop10000Libraries } from './utils/top-libraries/extract';

//
// Constants
//
// The tolerated distance between the package name and the trusted modules
// higher the distance, more suggestions will be shown
const TOLERATED_DISTANCE = 2;

//
// Extract package name from command line arguments
const args = minimist(process.argv.slice(2));
const packageName = args._[0];

/**
 * The main entry point of the script.
 */
async function main() {
  //
  // Check if top libraries are downloaded, if not, download them with the latest version
  // Users can delete the top10000libs.txt file to force a new download :)
  if (!fs.existsSync('src/utils/top-libraries/top10000libs.txt')) {
    await getLatestTop10000Libraries();
  }

  //
  // Check how fast this runs as a metric, because why not?
  let start = new Date().getTime();

  //
  // Check if the package name is provided
  if (!packageName) {
    console.error(
      'Usage: safe-install <package_name>\n(Or npm install <package_name> if using alias)',
    );
    process.exit(1);
  }

  //
  // Loop through all the trusted modules, and check if
  // the package name is close to any of them to detect typos
  let typos = checkForTypos(packageName, TOLERATED_DISTANCE);

  //
  // If there are typos, we print them to the console
  if (typos.length > 0) {
    let end = new Date().getTime();
    console.log(`Found ${typos.length} possible typos in ${end - start}ms:`);
  }

  //
  // If there are no typos, we can proceed with the original npm install command
  // Otherwise, we prompt the user for confirmation
  if (typos.length > 0) {
    promptForConfirmation(packageName, typos);
  } else {
    executeNpmInstall(packageName);
  }
}

//
// Run the main function!
main();
