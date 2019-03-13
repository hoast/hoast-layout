# Changelog

## 1.3.1 (2019-03-13)
### Changed
+ Updated dependencies and development dependencies.

## 1.3.0 (2018-10-28)
For hoast `v1.1.4`
### Changed
- Using `hoast.helpers.deepAssign` to deeply assign the `file.frontmatter` and `hoast.options.metadata` to an empty object for usage by the layouts.

## 1.2.3 (2018-10-27)
### Fixed
- Combination of global metadata and front matter is now used to overwrite `options.layout` instead of only the front matter.

## 1.2.2 (2018-10-27)
### Fixed
- Using `null` in the frontmatter for `layouts` or `layout` will now override which layouts are used, instead of being ignored.

## 1.2.1 (2018-10-24)
### Changed
- Updated dependencies.
- Updated to reflect changes to `hoast`'s helpers.

## 1.2.0 (2018-10-18)
For hoast `v1.1.0`.
### Changed
- Reduced module complexity by using new `hoast.helper.parse` and `hoast.helper.match` helper functions.

## 1.1.0 (2018-10-05)
## Added
- `wrappers` option added to provided an additional layer of layouts.
- `layouts` option added to support an array of items.
## Removed
- `layout` option deprecated and replaced with `layouts` option.

## 1.0.1 (2018-09-28)
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
### Fixed
- Error regarding options.directories validation.

## 0.2.1 (2018-09-11)
### Fixed
- Error regarding renderer path fixed.

## 0.2.0 (2018-09-11)
### Changed
- `directory` parameter replaced by `directories` which allows for an array of possible layout sources to be given.

## 0.1.0 (2018-08-21)
Initial release, for hoast `v0.1.0`.