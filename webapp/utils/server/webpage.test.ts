import { extractUrl } from './webpage';

import { describe, expect, it } from 'vitest';

describe('extractUrl', () => {
  it('returns null when passed an invalid URL', () => {
    expect(extractUrl('not a url')).toBeNull();
  });

  it('returns the given URL when passed a valid URL', () => {
    expect(extractUrl('https://google.com')).toBe('https://google.com');
  });

  it('returns the given URL when passed a valid URL with query', () => {
    expect(extractUrl('https://google.com/?q=hoge&page=8')).toBe(
      'https://google.com/?q=hoge&page=8',
    );
  });

  it('ignores garbage before and after the URL', () => {
    expect(extractUrl('blah blah https://google.com/?q=test blah')).toBe(
      'https://google.com/?q=test',
    );
  });

  it('matches URLs with different protocols (http and https)', () => {
    expect(extractUrl('http://test.com')).toBe('http://test.com');
    expect(extractUrl('https://test.com')).toBe('https://test.com');
  });

  it('matches URLs with different subdomains', () => {
    expect(extractUrl('https://www.google.com')).toBe('https://www.google.com');
    expect(extractUrl('https://drive.google.com')).toBe(
      'https://drive.google.com',
    );
  });

  it('matches URLs with ports and paths', () => {
    expect(extractUrl('https://test.com:8000/path/to/resource')).toBe(
      'https://test.com:8000/path/to/resource',
    );
  });
});
