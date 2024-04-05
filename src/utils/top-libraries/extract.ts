import * as fs from 'fs';
import { exec } from 'child_process';

interface Library {
  name: string;
}
/**
 * Downloads the raw.json file from the latest release of the npm-rank GitHub repository.
 */
async function downloadLatestTop() {
  const curlCommand =
    'curl -LJO https://github.com/LeoDog896/npm-rank/releases/download/latest/raw.json';

  await new Promise((resolve, reject) => {
    exec(curlCommand, (error) => {
      if (error) {
        console.error('Error downloading latest top libraries:', error);
        reject(error);
      } else {
        console.log('Latest top libraries downloaded successfully');
        resolve('done');
      }
    });
  });
}

/**
 * Converts the raw.json file to a list of library names and saves it to a text file.
 *
 * @param jsonFilePath the path to the raw.json file
 * @param outputFilePath the path to the output file
 */
async function extractLibraryNames(
  jsonFilePath: string = './raw.json',
  outputFilePath: string = __dirname + '/top10000libs.txt',
): Promise<void> {
  console.log("the output file path is: ", outputFilePath)
  //
  // Wait until the raw.json file is downloaded
  while (!fs.existsSync(jsonFilePath)) {
    console.log('Waiting for the raw.json file to be downloaded...');
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  //
  // Read the JSON file
  const rawData = fs.readFileSync(jsonFilePath, 'utf-8');

  try {
    //
    // Parse the JSON data
    const libraries: Library[] = JSON.parse(rawData);

    //
    // Extract library names
    let libraryNames: string[] = libraries.map((library) => library.name);

    //
    // De-duplicate library names
    const uniqueLibraryNames = new Set(libraryNames);
    libraryNames = [...uniqueLibraryNames];

    //
    // Write library names to the output file
    fs.writeFileSync(outputFilePath, libraryNames.join('\n'));

    //
    // Remove raw.json file
    fs.unlinkSync(jsonFilePath);
  } catch (error) {
    console.error('Error parsing JSON data:', error);
  }
}

/**
 * Downloads the latest top 10000 libraries and extracts the library names.
 */
export async function getLatestTop10000Libraries() {
  console.log('Downloading the latest top 10000 libraries...');
  await downloadLatestTop();
  console.log('Extracting library names...');
  await extractLibraryNames();
  console.log('Library names extracted successfully!');
}
