### Fixed

- **`@reticlehq/init` — `reticle init` could pick and modify a Vite library or a JS tool inside a backend/Python repository.** App discovery now requires evidence of a web page or a framework that renders one; otherwise it refuses before touching files and shows how to choose the intended app with `--app`. Closes [#2337](https://github.com/reticlehq/reticle/issues/2337).
