import { execFileSync } from 'node:child_process';
import { appendFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import {
  assertInjectionFilesClean,
  findDirtyInjectionFiles,
} from '../../../../bench/harness/inject.mjs';

function git(root, ...args) {
  return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' });
}

function withRepo(run) {
  const root = mkdtempSync(join(tmpdir(), 'reticle-inject-'));
  const fixture = join(root, 'fixture.txt');
  try {
    git(root, 'init', '-q');
    git(root, 'config', 'user.name', 'Reticle test');
    git(root, 'config', 'user.email', 'reticle-test@example.com');
    writeFileSync(fixture, 'baseline\n');
    git(root, 'add', 'fixture.txt');
    git(root, 'commit', '-qm', 'baseline');
    run(root, fixture);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

describe('benchmark injector dirty-worktree guard', () => {
  it('accepts a clean tracked fixture', () => {
    withRepo((root, fixture) => {
      expect(findDirtyInjectionFiles(root, [fixture])).toEqual([]);
      expect(() => assertInjectionFilesClean(root, [fixture])).not.toThrow();
    });
  });

  it('refuses an unstaged fixture edit without changing it', () => {
    withRepo((root, fixture) => {
      appendFileSync(fixture, 'local edit\n');

      expect(findDirtyInjectionFiles(root, [fixture])).toEqual(['fixture.txt']);
      expect(() => assertInjectionFilesClean(root, [fixture])).toThrow(
        /fixture\.txt[\s\S]*commit or stash/i,
      );
      expect(readFileSync(fixture, 'utf8')).toBe('baseline\nlocal edit\n');
    });
  });

  it('refuses a staged fixture edit without changing it', () => {
    withRepo((root, fixture) => {
      appendFileSync(fixture, 'staged edit\n');
      git(root, 'add', 'fixture.txt');

      expect(findDirtyInjectionFiles(root, [fixture])).toEqual(['fixture.txt']);
      expect(() => assertInjectionFilesClean(root, [fixture])).toThrow(
        /fixture\.txt[\s\S]*commit or stash/i,
      );
      expect(readFileSync(fixture, 'utf8')).toBe('baseline\nstaged edit\n');
    });
  });
});
