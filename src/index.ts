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
// Configs
//
// The tolerated distance between the package name and the trusted modules
// higher the distance, more suggestions will be shown
// Read from env variable, if not present, use the default value
let TOLERATED_DISTANCE = 2
if (process.env.TYPOSQUATTING_TOLERATED_DISTANCE) {
  TOLERATED_DISTANCE = parseInt(process.env.TYPOSQUATTING_TOLERATED_DISTANCE);
}

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
  // User can also pass "refresh" flag to force a new download
  if (!fs.existsSync(`${__dirname}/utils/top-libraries/top10000libs.txt`) || args.refresh) {
    await getLatestTop10000Libraries();
  }

  //
  // If the user wants to change the tolerated distance, they can do so by passing the flag
  // Example: npi --distance=3 and we change env variable to 3.
  // This is not persistent and will be reset on the next run. So, if you want to make it permanent,
  // you can add it to your .bashrc or .zshrc file.
  if (args.distance) {
    process.env.TYPOSQUATTING_TOLERATED_DISTANCE = args.distance;
    return;
  }

  //
  // Check how fast this runs as a metric, because why not?
  let start = new Date().getTime();

  //
  // Check if the package name is provided
  if (!packageName) {
    console.error(
      'Usage: npi <package_name>\n(Or npm install <package_name> if using alias)',
    );
    process.exit(1);
  }

  //
  // Loop through all the trusted modules, and check if
  // the package name is close to any of them to detect typos
  let typos = checkForTypos(packageName, TOLERATED_DISTANCE);

  //
  // If there are no typos, we can proceed with the original npm install command
  // Otherwise, we prompt the user for confirmation
  if (typos.length > 0) {
    let end = new Date().getTime();
    console.log(`Found ${typos.length} possible typos in ${end - start}ms:`);
    promptForConfirmation(packageName, typos);
  } else {
    executeNpmInstall(packageName);
  }
}

//
// Run the main function!
main();
