import { describe, test, expect } from 'bun:test';
import { extractCodesFromText } from './codeScanner';

describe('extractCodesFromText', () => {
  describe('12-character codes', () => {
    test('matches a plain 12-char alphanumeric code', () => {
      expect(extractCodesFromText('ABCD1234EFGH')).toEqual(['ABCD1234EFGH']);
    });

    test('matches a 12-char code with dashes and strips them', () => {
      expect(extractCodesFromText('ABCD-1234-EFGH')).toEqual(['ABCD1234EFGH']);
    });
  });

  describe('16-character codes', () => {
    test('matches a plain 16-char code', () => {
      expect(extractCodesFromText('ABCD1234EFGH5678')).toEqual(['ABCD1234EFGH5678']);
    });

    test('matches a 16-char code with dashes and strips them', () => {
      expect(extractCodesFromText('ABCD-1234-EFGH-5678')).toEqual(['ABCD1234EFGH5678']);
    });
  });

  describe('case normalisation', () => {
    test('lowercased input is uppercased before matching', () => {
      expect(extractCodesFromText('abcd1234efgh')).toEqual(['ABCD1234EFGH']);
    });

    test('mixed-case input is normalised', () => {
      expect(extractCodesFromText('AbCd1234eFgH')).toEqual(['ABCD1234EFGH']);
    });
  });

  describe('Discord emoji stripping', () => {
    test('strips static emoji tags before matching', () => {
      const text = 'Redeem <:gem:123456789012345678> this: ABCD1234EFGH';
      expect(extractCodesFromText(text)).toEqual(['ABCD1234EFGH']);
    });

    test('strips animated emoji tags before matching', () => {
      const text = '<a:spin:123456789012345678> ABCD1234EFGH';
      expect(extractCodesFromText(text)).toEqual(['ABCD1234EFGH']);
    });
  });

  describe('edge cases', () => {
    test('returns empty array for empty string', () => {
      expect(extractCodesFromText('')).toEqual([]);
    });

    test('returns empty array when no code present', () => {
      expect(extractCodesFromText('Hello, welcome to Idle Champions!')).toEqual([]);
    });

    test('returns multiple codes from one text', () => {
      const result = extractCodesFromText('Code1: ABCD1234EFGH Code2: WXYZ5678IJKL');
      expect(result).toHaveLength(2);
      expect(result).toContain('ABCD1234EFGH');
      expect(result).toContain('WXYZ5678IJKL');
    });

    test('strings shorter than 12 characters are not matched', () => {
      expect(extractCodesFromText('ABCD1234')).toEqual([]);
    });
  });
});

