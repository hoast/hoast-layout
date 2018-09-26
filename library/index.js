// If debug available require it.
let debug; try { debug = require(`debug`)(`hoast-layout`); } catch(error) { debug = function() {}; }
// Node modules.
const assert = require(`assert`),
	fs = require(`fs`),
	path = require(`path`);
// Dependency modules.
const parse = require(`planckmatch/library/parse`),
	match = require(`planckmatch/library/match`);
const jstransformer = require(`jstransformer`),
	totransformer = require(`inputformat-to-jstransformer`);

// Cached layouts, and transformers.
const layoutCache = [],
	transformersCache = {};

/**
 * Validates options' property types.
 * @param {Object} options The module options.
 */
const validateOptions = function(options) {
	assert(
		typeof(options) === `object`,
		`hoast.layout: options must be of type object.`
	);
	
	if (options.directories) {
		assert(
			typeof(options.directories) === `string` || (Array.isArray(options.directories) && options.directories.length > 0 && typeof(options.directories[0] === `string`)),
			`hoast-layout: directories must be of type string or an array of strings.`
		);
	}
	
	assert(
		typeof(options.layout) === `string`,
		`hoast-layout: layout is a required parameter and must be of type string.`
	);
	
	if (options.options) {
		assert(
			typeof(options.options) === `object`,
			`hoast-layout: options must be of type object.`
		);
	}
	
	if (options.patterns) {
		assert(
			typeof(options.patterns) === `string` || (Array.isArray(options.patterns) && options.patterns.length > 0 && typeof(options.patterns[0] === `string`)),
			`hoast-layout: patterns must be of type string or an array of string.`
		);
	}
	if (options.patternOptions) {
		assert(
			typeof(options.patternOptions) === `object`,
			`hoast-layout: patternOptions must be of type object.`
		);
		if (options.patternOptions.all) {
			assert(
				typeof(options.patternOptions.all) === `boolean`,
				`hoast-layout: patternOptions.all must be of type boolean.`
			);
		}
	}
};

/**
 * Check if expressions match with the given value.
 * @param {String} value The string to match with the expressions.
 * @param {RegExps|Array} expressions The regular expressions to match with.
 * @param {Boolean} all Whether all patterns need to match.
 */
const isMatch = function(value, expressions, all) {
	// If no expressions return early as valid.
	if (!expressions) {
		return true;
	}
	
	const result = match(value, expressions);
	
	// If results is a boolean check if it is true.
	if (typeof(result) === `boolean` && result) {
		return true;
	}
	// If results is an array check whether everything needs to be true or any will be enough.
	if (Array.isArray(result) && (all ? !result.includes(false) : result.includes(true))) {
		return true;
	}
	
	// Otherwise it is no match.
	return false;
};

/**
 * 
 * @param {String} directory 
 * @param {String|Array} subDirectories 
 * @param {String} layoutName 
 * @param {String} extension 
 */
const getLayout = function(directory, subDirectory, layoutName, extension) {
	let layoutPath = path.join(directory, subDirectory, layoutName.concat(extension));
	debug(`Testing accessibility of file '${layoutName}'.`);
	
	// Check if path already in cache.
	if (layoutCache.indexOf(layoutPath) >= 0) {
		return layoutPath;
	}
	
	try {
		// Check access.
		fs.accessSync(layoutPath, fs.constants.F_OK | fs.constants.R_OK);
		// If not available it would continue to the error catch.
		
		debug(`File at '${layoutPath}' found to be accessible.`);
		// Push path to cache.
		layoutCache.push(layoutPath);
		// Return valid path.
		return layoutPath;
	} catch(error) {
		debug(`File at '${layoutPath}' not accessible.`);
		// Return nothing.
		return;
	}
};

const selectLayout = function(directory, subDirectories, fileName, extension) {
	if (typeof(subDirectories) === `string`) {
		return getLayout(directory, subDirectories, fileName, extension);
	}
	
	// Search through directories.
	let result = null;
	for (let i = 0; i < subDirectories.length; i++) {
		result = getLayout(directory, subDirectories[i], fileName, extension);
		if (result) {
			return result;
		}
	}
	return;
};

/**
 * Matches the extension to the transformer.
 * @param {String} extension The layouts extension.
 */
const getTransformer = function(extension) {
	// If transformer already cached return that.
	if (extension in transformersCache) {
		return transformersCache[extension];
	}
	
	// Retrieve the transformer if available.
	const transformer = totransformer(extension);
	transformersCache[extension] = transformer ? jstransformer(transformer) : false;
	
	// Return transformer.
	return transformersCache[extension];
};

/**
 * Transforms files content using layouts.
 * @param {Object} options The module options.
 */
module.exports = function(options) {
	debug(`Initializing module.`);
	
	// Legacy support for the directory option.
	if (options.directory && !options.directories) {
		debug(`the 'directory' options has been deprecated and replaced with 'directories', see the documentation for more information.`);
		options.directories = options.directory;
	}
	
	validateOptions(options);
	debug(`Validated options.`);
	options = Object.assign({
		directories: ``,
		extension: ``,
		options: {},
		patternOptions: {}
	}, options);
	
	const mod = async function(hoast, files) {
		debug(`Running module.`);
		await Promise.all(
			// Loop through files.
			files.map(function(file) {
				return new Promise((resolve, reject) => {
					debug(`Processing file: '${file.path}'.`);
					
					// Check if read module has been used.
					assert(
						file.content !== null,
						`hoast-layout: No content found on file, read module needs to be called before this.`
					);
					
					// Check if file content is text.
					if (file.content.type !== `string`) {
						debug(`File content not valid for processing.`);
						return resolve();
					}
					// Check against glob patterns.
					if (!isMatch(file.path, this.expressions, options.patternOptions.all)) {
						debug(`File path not valid for processing.`);
						return resolve();
					}
					
					debug(`File is valid for processing.`);
					
					// Get layout from frontmatter.
					let layoutName = options.layout;
					if (file.frontmatter && file.frontmatter.layout) {
						assert(typeof(file.frontmatter.layout) === `string`, `hoast-layout: layout specified in frontmatter must be of type string.`);
						layoutName = file.frontmatter.layout;
					}
					debug(`Searching layout '${layoutName}'.`);
					
					let layoutPath = selectLayout(hoast.options.source, options.directories, layoutName, options.extension);
					if (!layoutPath) {
						reject(`No accessible file found as layout for ${file.path}.`);
					}
					debug(`Using layout at '${layoutPath}'.`);
					
					// Use given engine or retrieve transformer automatically.
					const transformer = getTransformer(layoutPath.split(`.`).pop());
					if (!transformer) {
						debug(`No valid transformer found for extension '${layoutPath.split(`.`).pop()}'.`);
						return resolve();
					}
					
					// Combine metadata and file data.
					const data = Object.assign({}, hoast.options.metadata, file.frontmatter, { content: file.content.data });
					// Override content and extension.
					file.content.data = transformer.renderFile(layoutPath, options.options, data).body;
					
					debug(`Rendered file.`);
					resolve();
				});
			}, mod)
		);
	};
	
	mod.before = function() {
		debug(`Running module before.`);
		
		// Parse glob patterns into regular expressions.
		if (options.patterns) {
			this.expressions = parse(options.patterns, options.patternOptions, true);
			debug(`Patterns parsed into expressions: ${this.expressions}.`);
		}
	};
	
	return mod;
};