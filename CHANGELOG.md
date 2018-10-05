# Changelog

## 1.1.0 (Unreleased)
For hoast `v1.0.0`
## Added
- `wrappers` option added to provided an additional layer of layouts.
- `layouts` option added to support an array of items.
## Removed
- `layout` option deprecated and replaced with `layouts` option.

## 1.0.1 (2018-09-28)
For hoast `v1.0.0`.
### Changed
- Updated `planckmatch` module from version `1.0.0` to `1.0.1`.

## 1.0.0 (2018-09-26)
For hoast `v1.0.0`.
### Added
- CodeCov coverage report added to CI workflow.
### Changed
- Restructured project files.
- Switched from using `nanomatch` to [`planckmatch`](https://github.com/redkenrok/node-planckmatch#readme) for filtering file paths.

> Do note option properties have changed, and are not backwards compatible.

## 0.2.2 (2018-09-12)
For hoast `v0.1.0`.
### Fixed
- Error regarding options.directories validation.

## 0.2.1 (2018-09-11)
For hoast `v0.1.0`.
### Fixed
- Error regarding renderer path fixed.

## 0.2.0 (2018-09-11)
For hoast `v0.1.0`.
### Changed
- `directory` parameter replaced by `directories` which allows for an array of possible layout sources to be given.

## 0.1.0 (2018-08-21)
Initial release, for hoast `v0.1.0`.