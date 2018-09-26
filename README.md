<div align="center">
  
  [![npm package @latest](https://img.shields.io/npm/v/hoast-layout.svg?label=npm@latest&style=flat-square&maxAge=3600)](https://npmjs.com/package/hoast-layout)
  [![npm package @next](https://img.shields.io/npm/v/hoast-layout/next.svg?label=npm@next&style=flat-square&maxAge=3600)](https://npmjs.com/package/hoast-layout/v/next)
  
  [![Travis-ci status](https://img.shields.io/travis-ci/hoast/hoast-layout.svg?branch=master&label=test%20status&style=flat-square&maxAge=3600)](https://travis-ci.org/hoast/hoast-layout)
  [![CodeCov coverage](https://img.shields.io/codecov/c/github/hoast/hoast-layout/master.svg?label=test%20coverage&style=flat-square&maxAge=3600)](https://codecov.io/gh/hoast/hoast-layout)
  
  [![License agreement](https://img.shields.io/github/license/hoast/hoast-layout.svg?style=flat-square&maxAge=86400)](https://github.com/hoast/hoast-layout/blob/master/LICENSE)
  [![Open issues on GitHub](https://img.shields.io/github/issues/hoast/hoast-layout.svg?style=flat-square&maxAge=86400)](https://github.com/hoast/hoast-layout/issues)
  
</div>

# hoast-layout

Transform the content of files using layouts.

> As the name suggest this is a [hoast](https://github.com/hoast/hoast#readme) module. The module has been based of [metalsmith-layouts](https://github.com/metalsmith/metalsmith-layouts#readme).

## Usage

Install [hoast-layout](https://npmjs.com/package/hoast-layout) using [npm](https://npmjs.com).

```
$ npm install hoast-layout
```

### Parameters

* `directories`: A string or array of string leading to the directories containing the layouts. If an array is provided it will search through the directories in the given order and use the first valid result. If no directory is given it will assume the root source directory.
  * Type: `String` or `Array of Strings`
	* Required: `no`
* `extension`: The extension of the layout. This option can be ignored and any extension can be provided by the default layout option or the frontmatter. The format should only include the extension without any punctuation before the string, for example `md` instead of `.md`.
  * Type: `String`
  * Required: `no`
* `layout`: Path to default layout if the [frontmatter](https://github.com/hoast/hoast-frontmatter#readme) of the file does not specify another layout using a field named `layout`.
  * Type: `String`
	* Required: `yes`
* `options`: Options given to the [JSTransformer](https://github.com/jstransformers/jstransformer#readme).
  * Type: `Object`
	* Default: `{}`
* `patterns`: Glob patterns to match file paths with. If the engine function is set it will only give the function any files matching the pattern.
  * Type: `String` or `Array of strings`
	* Default: `[ '**/*.md', '**/*.markdown' ]`
* `patternOptions`: Options for the glob pattern matching. See [planckmatch options](https://github.com/redkenrok/node-planckmatch#options) for more details on the pattern options.
  * Type: `Object`
  * Default: `{}`
* `patternOptions.all`: This options is added to `patternOptions`, and determines whether all patterns need to match instead of only one.
  * Type: `Boolean`
  * Default: `false`

> From 0.2.0 and up the `directory` option has been deprecated and is replaced by the `directories` option.

### Example

**Cli**

```json
{
  "modules": {
    "read": {},
    "hoast-layout": {
      "directory": "layouts",
      "layout": "page.hbs",
      "patterns": "*.html"
    }
  }
}
```

**Script**

```javascript
const Hoast = require(`hoast`);
const read = Hoast.read,
      layout = require(`hoast-layout`);

Hoast(__dirname)
  .use(read())
  .use(layout({
    directory: `layouts`
    layout: `page.hbs`,
    patterns: `*.html`
  }))
  .process();
```

> In the examples the HTML files are entered into the handlebars layout.

## Troubleshooting

If you are having problems with the module please [enable debugging](https://github.com/hoast/hoast#debugging) to have a closer look.

**File not valid for processing.**
* The file is not utf-8 encoded.
* The file path does not match any of the patterns.

**No valid transformer found for extension <extension>.**
* Check if the JSTransformer associated with the extension is installed.

## License

[ISC license](https://github.com/hoast/hoast-layout/blob/master/LICENSE)