[![Version master branch](https://img.shields.io/github/package-json/v/hoast/hoast-layout.svg?label=master&style=flat-square)](https://github.com/hoast/hoast-layout#readme)
[![Version npm package](https://img.shields.io/npm/v/hoast-layout.svg?label=npm&style=flat-square)](https://npmjs.com/package/hoast-layout)
[![License agreement](https://img.shields.io/github/license/hoast/hoast-layout.svg?style=flat-square)](https://github.com/hoast/hoast-layout/blob/master/LICENSE)
[![Travis-ci build status](https://img.shields.io/travis-ci/hoast/hoast-layout.svg?branch=master&style=flat-square)](https://travis-ci.org/hoast/hoast-layout)
[![Open issues on GitHub](https://img.shields.io/github/issues/hoast/hoast-layout.svg?style=flat-square)](https://github.com/hoast/hoast-layout/issues)

# hoast-layout

Transform the content of files using layouts.

> As the name suggest this is a [hoast](https://github.com/hoast/hoast#readme) module. The module has been based of [metalsmith-layouts](https://github.com/metalsmith/metalsmith-layouts#readme).

## Usage

Install [hoast-layout](https://npmjs.com/package/hoast-layout) using [npm](https://npmjs.com).

```
$ npm install hoast-layout
```

### Parameters

* `directories` **{Array|string}**: A string or array of string leading to the directories containing the layouts. If an array is provided it will search through the directories in the given order and use the first valid result. If no directory is given it will assume the root source directory.
	* Required: `no`
* `extension` **{String}**: The extension of the layout. This option can be ignored and any extension can be provided by the default layout option or the frontmatter.
  * Required: `no`
* `layout` **{String}**: Path to default layout if the [frontmatter](https://github.com/hoast/hoast-frontmatter#readme) of the file does not specify another layout using a field named `layout`.
	* Required: `yes`
* `options` **{Object}**: Options given to the [JSTransformer](https://github.com/jstransformers/jstransformer#readme).
	* Default: `{}`
* `patterns` **{Array|string}**: A string or an array of strings which gets used to match files using glob patterns. See [nanomatch](https://github.com/micromatch/nanomatch#readme) for more details on the patterns.
	* Required: `no`

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
      "patterns": "**/*.html"
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
    patterns: `**/*.html`
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