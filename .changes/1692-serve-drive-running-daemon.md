### Fixed

- **`@reticlehq/server` — `reticle serve --drive` silently ignored the URL when a daemon was already running.** The command now exits with an error and points to `reticle drive <url>`. A plain `reticle serve` still attaches. Closes [#1692](https://github.com/reticlehq/reticle/issues/1692).
