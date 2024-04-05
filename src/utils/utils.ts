import fs from 'fs';
import path from 'path';
import prompts from 'prompts';

/**
 *
 * This function calculates the Levenshtein distance between two strings.
 * Levenshtein distance is a string metric for measuring the difference between two sequences.
 * Informally, the Levenshtein distance between two words is the minimum number of single-character edits
 * (insertions, deletions, or substitutions) required to change one word into the other.
 *
 * Time complexity: O(len(a)*len(b))
 *
 * @param a String a to compare
 * @param b String b to compare
 * @returns The Levenshtein distance between the two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;

  //
  // We create a 2D array to store the dp values
  // Each cell dp[i][j] will store the Levenshtein distance
  // between the first i characters of a and the first j characters of b
  const dp: number[][] = [];

  //
  // First, we initialize the dp array with the base cases
  for (let i = 0; i <= m; i++) {
    dp[i] = [];
    dp[i][0] = i;
  }

  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  //
  // Then, we fill the dp array with the rest of the values
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      //
      // If the characters are the same, we don't need to do anything
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        //
        // Otherwise, we take the minimum of the three possible operations
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1, // Deletion
          dp[i][j - 1] + 1, // Insertion
          dp[i - 1][j - 1] + 1, // Substitution
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * This function reads the list of trusted packages from a file.
 * #TODO: Might be useful to have some caching here
 *
 * @returns a list of trusted packages
 */
export function trustedPackages(): string[] {
  //
  // Might need to re-update this path with a cron job somehow...
  let trustedPackagesDir = path.join(
    __dirname,
    './top-libraries/top10000libs.txt',
  );
  return fs.readFileSync(trustedPackagesDir, 'utf-8').split('\n');
}

/**
 * This function checks if the package name is a typo of a trusted module.
 *
 * @param packageName the package name to check for typos
 * @returns the list of possible typos
 */
export function checkForTypos(
  packageName: string,
  toleratedDistance: number,
): string[] {
  const trustedModules = trustedPackages();
  let possibleTypos: string[] = [];

  //
  // Loop through all the trusted modules
  for (const module of trustedModules) {
    //
    // Calculate the Levenshtein distance between the package name and the module
    const distance = levenshteinDistance(packageName, module);

    //
    // This distance means that the package name is a trusted module
    if (distance == 0) {
      return [];
    }

    //
    // This distance means that the package name might be typo of a trusted module
    if (distance > 0 && distance <= toleratedDistance) {
      possibleTypos.push(module);
    }
  }
  return possibleTypos;
}

/**
 * This function executes the original npm install command.
 *
 * @param packageName the package name to install
 */
export function executeNpmInstall(packageName: string) {
  const originalNpm = path.join(
    process.env.npm_execpath || process.env.NODE_EXE || 'npm',
  );
  const command = `${originalNpm} install ${packageName}`;
  console.log(`Executing command: ${command}`);
  const child_process = require('child_process');
  child_process.execSync(command, { stdio: 'inherit' });
}

/**
 *
 * This function prompts the user for confirmation if the package name is a typo.
 *
 * @param packageName the package name to install
 * @param typo the list of possible typos
 */
export async function promptForConfirmation(
  packageName: string,
  typo: string[],
) {
  console.log(
    "You attempted to install " + 
    packageName +
      '. This is a suspected typosquatted package, please verify...',
  );

  
  const options: prompts.Choice[] = [
    ...typo.map((t) => ({ title: t, value: t })),
  ];
  options.push({ title: packageName + " (suspected typosquatted package)", value: packageName });
  options.push({ title: 'None of the above', value: 'none' });
  

  //
  // Prompt the user for confirmation
  const pickedPackage = await prompts({
    type: 'select',
    name: 'value',
    message: 'Pick the package you want to install:',
    choices: options,
    initial: 0,
  });

  if (pickedPackage.value === 'none' || !pickedPackage.value) {
    console.log('Exiting...');
    process.exit(0);
  }

  executeNpmInstall(pickedPackage.value);
}
