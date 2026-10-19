import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PortPresence, probePresence } from '@/command/daemon/binding/port-presence.js';
import { log } from '@/log.js';
import { handleServe } from './daemon-lifecycle.js';

vi.mock('@/command/daemon/binding/port-presence.js', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/command/daemon/binding/port-presence.js')>()),
  probePresence: vi.fn(),
}));
vi.mock('@/log.js', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/log.js')>()),
  log: vi.fn(),
}));

const PORT = 4400;
const DRIVE_URL = 'http://localhost:5173';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(probePresence).mockResolvedValue(PortPresence.DAEMON);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('serve flags on an existing daemon (#1692)', () => {
  it('refuses an ignored --drive flag and points to reticle drive', async () => {
    const stderr = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    handleServe({ port: PORT, driveUrl: DRIVE_URL, headless: true, http: false });

    await vi.waitFor(() => {
      expect(exit).toHaveBeenCalledWith(1);
      expect(stderr).toHaveBeenCalledWith(expect.stringContaining('reticle drive'));
    });
    expect(log).toHaveBeenCalledWith(
      'reticle_daemon_start_refused',
      expect.objectContaining({ port: PORT }),
    );
  });

  it('still attaches without an error when serve has no --drive flag', async () => {
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

    handleServe({ port: PORT, headless: true, http: false });

    await vi.waitFor(() => {
      expect(log).toHaveBeenCalledWith('reticle_daemon_already_running', { port: PORT });
    });
    expect(exit).not.toHaveBeenCalled();
  });
});
