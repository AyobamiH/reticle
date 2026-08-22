import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { appendFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { assertInjectionFilesClean, findDirtyInjectionFiles } from './harness/inject.mjs';

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

test('accepts a clean tracked fixture', () => {
  withRepo((root, fixture) => {
    assert.deepEqual(findDirtyInjectionFiles(root, [fixture]), []);
    assert.doesNotThrow(() => assertInjectionFilesClean(root, [fixture]));
  });
});

test('refuses an unstaged fixture edit without changing it', () => {
  withRepo((root, fixture) => {
    appendFileSync(fixture, 'local edit\n');

    assert.deepEqual(findDirtyInjectionFiles(root, [fixture]), ['fixture.txt']);
    assert.throws(
      () => assertInjectionFilesClean(root, [fixture]),
      /fixture\.txt[\s\S]*commit or stash/i,
    );
    assert.equal(readFileSync(fixture, 'utf8'), 'baseline\nlocal edit\n');
  });
});

test('refuses a staged fixture edit without changing it', () => {
  withRepo((root, fixture) => {
    appendFileSync(fixture, 'staged edit\n');
    git(root, 'add', 'fixture.txt');

    assert.deepEqual(findDirtyInjectionFiles(root, [fixture]), ['fixture.txt']);
    assert.throws(
      () => assertInjectionFilesClean(root, [fixture]),
      /fixture\.txt[\s\S]*commit or stash/i,
    );
    assert.equal(readFileSync(fixture, 'utf8'), 'baseline\nstaged edit\n');
  });
});
