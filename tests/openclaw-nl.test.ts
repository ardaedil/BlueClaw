import { describe, expect, test } from 'vitest';
import { parseOpenClawCommand } from '../src/modules/openclaw/nl.js';

describe('parseOpenClawCommand', () => {
  test('parses create watch command', () => {
    const parsed = parseOpenClawCommand('Watch eBay for a PS5 under $300', 'demo-user');
    expect(parsed.action).toBe('create_watch');
    expect(parsed.payload.maxPrice).toBe(300);
  });

  test('parses list command', () => {
    const parsed = parseOpenClawCommand('Show me my active watches', 'demo-user');
    expect(parsed.action).toBe('list_watches');
  });
});
