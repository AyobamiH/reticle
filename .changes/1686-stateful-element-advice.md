### Fixed

- **`@reticlehq/server` — stateful element assertions received incorrect presence-only advice.** Checks for focus, checked, expanded, pressed, enabled, disabled or in-viewport state no longer suggest replacing a valid assertion. Bare presence checks still receive advice. The evidence grade stays unchanged. Closes [#1686](https://github.com/reticlehq/reticle/issues/1686).
