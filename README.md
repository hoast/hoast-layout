# Hoast-layout
Transform the content of files using layouts.

> As the name suggest this is a [hoast](https://github.com/hoast/hoast#readme) module. The module has been based of [metalsmith-layouts](https://github.com/metalsmith/metalsmith-layouts#readme).

## Usage

Install [hoast-layout](https://npmjs.com/package/hoast-layout) using [npm](https://npmjs.com).

```
$ npm install hoast-layout
```

### Parameters

* `directory` **{{String}}**: The directory containing the layouts.
	* Default: `''` (root of the source directory).
* `layout` **{String}**: Path to default layout if the [frontmatter](https://github.com/hoast/hoast-frontmatter#readme) of the file does not specify another layout using an options named `layout`.
	* Required: `yes`
* `options` **{{Object}}**: Options given to the [JSTransformer](https://github.com/jstransformers/jstransformer#readme).
	* Default: `{}`
* `patterns` **{Array of strings}**: An array of string which gets used to match files using glob patterns. See [nanomatch](https://github.com/micromatch/nanomatch#readme) for more details on the patterns.
	* Default: `[]`

### Example

**Cli**

```json
{
  "modules": {
    "read": {},
    "hoast-layout": {
      "directory": "layouts",
      "layout": "page.hbs",
      "patterns": [
	    "**/*.html"
      ]
	}
  }
}
```

**Script**

```javascript
const Hoast = require('hoast');
const read = Hoast.read,
      layout = require('hoast-layout');

Hoast(__dirname)
  .use(read())
  .use(layout({
    directory: 'layouts'
    layout: 'page.hbs',
    patterns: [
      '**/*.html'
    ]
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