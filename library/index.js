// If debug available require it.
let debug; try { debug = require(`debug`)(`hoast-layout`); } catch(error) { debug = function() {}; }
// Node modules.
const assert = require(`assert`),
	fs = require(`fs`),
	path = require(`path`);
// Dependency modules.
const parse = require(`planckmatch/parse`),
	match = require(`planckmatch/match`);
const jstransformer = require(`jstransformer`),
	totransformer = require(`inputformat-to-jstransformer`);

// Cached layouts, and transformers.
const layoutCache = [],
	transformersCache = {};

/**
 * Validate properties of options.
 * @param {Object} options The module options.
 */
const validateOptions = function(options) {
	if (!options) {
		// Return since no option is required.
		return;
	}
	
	assert(
		typeof(options) === `object`,
		`hoast-layout: options must be of type object.`
	);
	
	/**
	 * Validate a potential array.
	 * @param {Object} property Name of property to validate.
	 * @param {String} type Object type.
	 */
	const validateArray = function(property, type) {
		property = options[property];
		const message = `hoast-layout: ${property} must be of type ${type} or an array of ${type}s.`;
		if (Array.isArray(property)) {
			property.forEach(function(item) {
				assert(
					typeof(item) === type,
					message
				);
			});
		} else {
			assert(
				typeof(property) === type,
				message
			);
		}
	};
	
	if (options.directories) {
		validateArray(`directories`, `string`);
	}
	
	if (options.layouts) {
		validateArray(`layouts`, `string`);
	}
	if (options.wrappers) {
		validateArray(`wrappers`, `string`);
	}
	
	if (options.options) {
		assert(
			typeof(options.options) === `object`,
			`hoast-layout: options must be of type object.`
		);
	}
	
	if (options.patterns) {
		validateArray(`patterns`, `string`);
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
 * @returns {Boolean} Whether the value matched the criteria.
 */
const isMatch = function(value, expressions, all) {
	// If no expressions return early as valid.
	if (!expressions) {
		return true;
	}
	
	const result = match(value, expressions);
	
	// If results is an array.
	if (Array.isArray(result)) {
		// Check whether all or just any will result in a match, and return the outcome.
		return all ? !result.includes(false) : result.includes(true);
	}
	
	// Otherwise result is a boolean and can be returned directly.
	return result;
};

/**
 * Returns the valid file path found in any of the subdirectories.
 * @param {String} directory Absolute path to root directory.
 * @param {Array|String} subDirectories Subdirectories to search through.
 * @param {String} fileName The relative file path to the subdirectory.
 * @param {String} extension The file extension.
 * @returns {String} The valid path of the file, or null if no valid path found.
 */
const getLayout = function(directory, subDirectories, fileName, extension) {
	if (Array.isArray(subDirectories)) {
		let result = null;
		for (let i = 0; i < subDirectories.length; i++) {
			result = getLayout(directory, subDirectories[i], fileName, extension);
			if (result) {
				return result;
			}
		}
		return;
	}
	
	let layoutPath = path.join(directory, subDirectories, fileName.concat(extension));
	debug(`Testing accessibility of file '${fileName}'.`);
	
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

/**
 * Transform the content using a layout.
 * @param {String} layoutPath Absolute path to the layout.
 * @param {Object} options The transformer options.
 * @param {String} content File content to transform.
 * @param {Object} metadata Any metadata of the file to give to the layout.
 * @returns {String} Transformed content.
 */
const transform = function(options, layoutPath, content, metadata) {
	const extension = layoutPath.split(`.`).pop();
	// Get transformer.
	let transformer;
	// If transformer already cached return that.
	if (extension in transformersCache) {
		transformer = transformersCache[extension];
	} else {
		// Retrieve the transformer if available.
		transformer = totransformer(extension);
		transformersCache[extension] = transformer ? jstransformer(transformer) : false;
		transformer = transformersCache[extension];
	}
	// Still no transformer found return content as is.
	if (!transformer) {
		debug(`No valid transformer found for extension '${extension}'.`);
		return content;
	}
	
	// Override content and extension.
	metadata.content = content;
	return transformer.renderFile(layoutPath, options, metadata).body;
};

/**
 * Use layouts on content.
 * @param {*} options Module options.
 * @param {*} layoutNames 
 * @param {*} content 
 * @param {*} metadata 
 */
const layout = function(source, options, layoutNames, content, metadata) {
	// Iterate over array.
	if (Array.isArray(layoutNames)) {
		// Call itself for each layout name.
		layoutNames.forEach(function(layoutName) {
			content = layout(source, options, layoutName, content, metadata);
		});
		// Return finished content.
		return content;
	}
	
	// Get path to layout file.
	const layoutPath = getLayout(source, options.directories, layoutNames, options.extension);
	if (!layoutPath) {
		debug(`No accessible file found as layout for '${layoutNames}', therefore ignored.`);
		return content;
	}
	debug(`Using layout at '${layoutPath}'.`);
	
	// Transform content.
	return transform(options.options, layoutPath, content, metadata);
};

/**
 * Transforms files content using layouts.
 * @param {Object} options The module options.
 * @returns {Function} The module's function.
 */
module.exports = function(options) {
	debug(`Initializing module.`);
	
	// Legacy support for the directory and layout option.
	if (options.directory && !options.directories) {
		debug(`The 'directory' options has been deprecated and replaced with 'directories', see the documentation for more information.`);
		options.directories = options.directory;
	}
	if (options.layout && !options.layouts) {
		debug(`The 'layout' options has been deprecated and replaced with 'layouts', see the documentation for more information.`);
		options.layouts = options.layout;
	}
	if (options.wrapper && !options.wrappers) {
		debug(`The 'wrapper' options has been deprecated and replaced with 'wrappers', see the documentation for more information.`);
		options.wrappers = options.wrapper;
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
				return new Promise((resolve) => {
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
					
					// Combine metadata and file data.
					const metadata = Object.assign({}, hoast.options.metadata, file.frontmatter);
					let content = file.content.data;
					
					// Get layout from frontmatter.
					let layoutNames = options.layouts;
					if (file.frontmatter) {
						if (file.frontmatter.layouts) {
							debug(`Using layouts defined in frontmatter.`);
							layoutNames = file.frontmatter.layouts;
						} else if (file.frontmatter.layout) {
							debug(`Using layout defined in frontmatter.`);
							layoutNames = file.frontmatter.layout;
						}
					}
					// Go over layouts listed.
					if (layoutNames) {
						debug(`Found layout names '${layoutNames}'.`);
						content = layout(hoast.options.source, options, layoutNames, content, metadata);
					}
					
					// Go over wrappers listed.
					if (options.wrappers) {
						content = layout(hoast.options.source, options, options.wrappers, content, metadata);
					}
					
					// Write content to file content data.
					file.content.data = content;
					
					debug(`Rendered file.`);
					resolve();
				});
			}, mod)
		);
	};
	
	// Parse glob patterns into regular expressions.
	if (options.patterns) {
		mod.expressions = parse(options.patterns, options.patternOptions, true);
		debug(`Patterns parsed into expressions: ${mod.expressions}.`);
	}
	
	return mod;
};