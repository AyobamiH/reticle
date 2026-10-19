### Fixed

- **`@reticlehq/browser` — a blank snapshot scope caused a selector exception.** Empty and whitespace-only scopes now read the whole page. Invalid selectors return `scopeMissing: true` without reading unrelated content. Closes [#1679](https://github.com/reticlehq/reticle/issues/1679).
