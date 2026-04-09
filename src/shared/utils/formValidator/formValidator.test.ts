import { describe, expect, it } from 'vitest';

import {
  custom,
  maxLength,
  minLength,
  pattern,
  required,
  validate,
  validateForm,
} from './formValidator';

describe('required', () => {
  it('returns null for a non-empty value', () => {
    expect(required()('London')).toBeNull();
  });

  it('returns error for an empty string', () => {
    expect(required()('')).toBe('This field is required');
  });

  it('returns error for whitespace-only string', () => {
    expect(required()('   ')).toBe('This field is required');
  });

  it('accepts a custom message', () => {
    expect(required('Please enter a city name.')('')).toBe('Please enter a city name.');
  });
});

describe('minLength', () => {
  it('returns null when value meets the minimum', () => {
    expect(minLength(2)('Lo')).toBeNull();
  });

  it('returns error when value is too short', () => {
    expect(minLength(2)('L')).toBe('Must be at least 2 characters');
  });

  it('trims before checking length', () => {
    expect(minLength(2)('  L  ')).toBe('Must be at least 2 characters');
  });

  it('accepts a custom message', () => {
    expect(minLength(3, 'Too short')('ab')).toBe('Too short');
  });
});

describe('maxLength', () => {
  it('returns null when value is within limit', () => {
    expect(maxLength(10)('London')).toBeNull();
  });

  it('returns error when value exceeds limit', () => {
    expect(maxLength(3)('London')).toBe('Must be at most 3 characters');
  });

  it('accepts a custom message', () => {
    expect(maxLength(3, 'Too long')('London')).toBe('Too long');
  });
});

describe('pattern', () => {
  it('returns null when value matches the pattern', () => {
    expect(pattern(/^[a-z]+$/i, 'Letters only')('London')).toBeNull();
  });

  it('returns error when value does not match', () => {
    expect(pattern(/^[a-z]+$/i, 'Letters only')('London123')).toBe('Letters only');
  });

  it('trims before testing', () => {
    expect(pattern(/^[a-z]+$/i, 'Letters only')('  London  ')).toBeNull();
  });
});

describe('custom', () => {
  it('returns null when predicate returns true', () => {
    const noDigits = custom<string>((v) => !/\d/.test(v), 'No digits allowed');
    expect(noDigits('London')).toBeNull();
  });

  it('returns error when predicate returns false', () => {
    const noDigits = custom<string>((v) => !/\d/.test(v), 'No digits allowed');
    expect(noDigits('London1')).toBe('No digits allowed');
  });
});

describe('validate', () => {
  it('returns null when all rules pass', () => {
    expect(validate('London', [required(), minLength(2), maxLength(50)])).toBeNull();
  });

  it('returns the first failing rule message', () => {
    expect(validate('', [required('Enter city'), minLength(2)])).toBe('Enter city');
  });

  it('stops at the first failure', () => {
    expect(validate('L', [required(), minLength(2), maxLength(50)])).toBe(
      'Must be at least 2 characters',
    );
  });

  it('returns null for an empty rules array', () => {
    expect(validate('anything', [])).toBeNull();
  });
});

describe('validateForm', () => {
  it('returns empty object when all fields are valid', () => {
    const errors = validateForm(
      { email: 'user@example.com', password: 'secret123' },
      { email: [required()], password: [required(), minLength(6)] },
    );
    expect(errors).toEqual({});
  });

  it('returns errors only for invalid fields', () => {
    const errors = validateForm(
      { email: '', password: 'secret123' },
      { email: [required('Email required')], password: [required(), minLength(6)] },
    );
    expect(errors).toEqual({ email: 'Email required' });
  });

  it('returns errors for all failing fields', () => {
    const errors = validateForm(
      { email: '', password: 'abc' },
      { email: [required()], password: [required(), minLength(8)] },
    );
    expect(errors).toEqual({
      email: 'This field is required',
      password: 'Must be at least 8 characters',
    });
  });

  it('ignores fields not listed in the schema', () => {
    const errors = validateForm({ city: 'London', extra: '' }, { city: [required()] });
    expect(errors).toEqual({});
  });
});
