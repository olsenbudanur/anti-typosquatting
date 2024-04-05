import {
  levenshteinDistance,
  trustedPackages,
  checkForTypos,
} from '../utils/utils';

describe('levenshteinDistance', () => {
  test('calculates the Levenshtein distance correctly', () => {
    expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
    expect(levenshteinDistance('book', 'back')).toBe(2);
    expect(levenshteinDistance('hello', 'hello')).toBe(0);
  });
});

describe('trustedPackages', () => {
  test('reads the list of trusted packages correctly', () => {
    const packages = trustedPackages();
    expect(packages).toContain('react');
    expect(packages).toContain('lodash');
    expect(packages).toContain('axios');
  });
});

describe('checkForTypos', () => {
  test('returns the list of possible typos correctly', () => {
    const packageName = 'axois';
    const toleratedDistance = 2;
    const possibleTypos = checkForTypos(packageName, toleratedDistance);
    expect(possibleTypos).toContain('axios');
  });

  test('returns an empty list when the package name is a trusted module', () => {
    const packageName = 'react';
    const toleratedDistance = 2;
    const possibleTypos = checkForTypos(packageName, toleratedDistance);
    expect(possibleTypos).toEqual([]);
  });
});
