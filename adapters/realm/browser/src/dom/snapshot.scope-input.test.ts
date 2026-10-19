import { afterEach, describe, expect, it } from 'vitest';
import { SnapshotMode } from '@reticlehq/core';
import { buildSnapshot } from './snapshot.js';

/** #1679: Optional scope inputs must not turn a valid page read into a selector failure. */
describe('snapshot scope input (#1679)', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it.each(['', '  ', '\t\n'])('treats blank scope %j as a full-page read', (scope) => {
    document.body.innerHTML = '<main><button>Save changes</button></main>';

    const unscoped = buildSnapshot({ mode: SnapshotMode.FULL });
    const blankScope = buildSnapshot({ mode: SnapshotMode.FULL, scope });

    expect(blankScope.scopeMissing).toBeUndefined();
    expect(blankScope.tree).toBe(unscoped.tree);
    expect(blankScope.tree).toContain('Save changes');
  });

  it('returns scopeMissing on invalid CSS instead of throwing or reading the page', () => {
    document.body.innerHTML = '<main><button>Private settings</button></main>';

    const snapshot = buildSnapshot({ mode: SnapshotMode.FULL, scope: ':not(' });

    expect(snapshot.scopeMissing).toBe(true);
    expect(snapshot.tree).toBe('');
    expect(snapshot.tree).not.toContain('Private settings');
  });

  it('still fails closed for a well-formed scope that matches nothing', () => {
    document.body.innerHTML = '<main><button>Private settings</button></main>';
    const snapshot = buildSnapshot({ mode: SnapshotMode.FULL, scope: '#missing-panel' });

    expect(snapshot.scopeMissing).toBe(true);
    expect(snapshot.tree).toBe('');
  });

  it('keeps a real scope confined to its subtree', () => {
    document.body.innerHTML =
      '<div id="panel"><button>Inside</button></div><button>Outside</button>';

    const snapshot = buildSnapshot({ mode: SnapshotMode.FULL, scope: '#panel' });

    expect(snapshot.scopeMissing).toBeUndefined();
    expect(snapshot.tree).toContain('Inside');
    expect(snapshot.tree).not.toContain('Outside');
  });
});
