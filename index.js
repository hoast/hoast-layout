// Node modules.
const assert = require('assert'),
	  { join } = require('path');
// Dependency modules.
const jstransformer = require('jstransformer'),
	  nanomatch = require('nanomatch'),
	  totransformer = require('inputformat-to-jstransformer');
// If debug available require it.
let debug; try { debug = require('debug')('hoast-layout'); } catch(error) { debug = function() {}; }

// Cached transformers.
const transformers = {};

/**
 * Matches the extension to the transformer.
 * @param {String} extension The layouts extension.
 */
const getTransformer = function(extension) {
	// If transformer already cached return that.
	if (extension in transformers) {
		return transformers[extension];
	}
	
	// Retrieve the transformer if available.
	const transformer = totransformer(extension);
	transformers[extension] = transformer ? jstransformer(transformer) : false;
	
	// Return transformer.
	return transformers[extension];
};

const validateOptions = function(options) {
	assert(typeof(options) === 'object', 'hoast.layout: options must be of type object.');
	if (options.directory) {
		assert(typeof(options.directory) === 'string', 'hoast-layout: directory must be of type string.');
	}
	assert(typeof(options.layout) === 'string', 'hoast-layout: layout is a required parameter and must be of type string.');
	if (options.options) {
		assert(typeof(options.options) === 'object', 'hoast-layout: options must be of type object.');
	}
	if (options.patterns) {
		assert(typeof(options.patterns) === 'string' || (Array.isArray(options.patterns) && options.patterns.length > 0 && typeof(options.patterns[0] === 'string')), 'hoast-layout: patterns must be of type string or an array of strings.');
	}
};

/**
 * Transforms files content using layouts.
 * @param {Object} options The module options.
 */
module.exports = function(options) {
	debug(`Initializing module.`);
	
	validateOptions(options);
	debug(`Validated options.`);
	options = Object.assign({
		directory: '',
		options: {}
	}, options);
	
	return async function(hoast, files) {
		debug(`Running module.`);
		await Promise.all(
			// Loop through files.
			files.map(function(file) {
				return new Promise(function(resolve) {
					debug(`Processing file: '${file.path}'.`);
					
					assert(file.content !== null, 'hoast-layout: No content found on file, read module needs to be called before this.');
					// Has to be a string and patterns if specified.
					if (file.content.type !== 'string' || (options.patterns && !nanomatch.any(file.path, options.patterns))) {
						debug(`File not valid for processing.`);
						return resolve();
					}
					debug(`File content is valid.`);
					
					// Get layout from rontmatter.
					let layout = options.layout;
					if (file.frontmatter && file.frontmatter.layout) {
						assert(typeof(file.frontmatter.layout) === 'string', 'hoast-layout: layout specified in frontmatter must be of type string.');
					}
					// Get layout extension.
					layout = join(hoast.options.source, options.directory, layout);
					debug(`Using layout '${layout}'.`);
					
					// Use given engine or retrieve transformer automatically.
					const transformer = getTransformer(layout.split('.').pop());
					if (!transformer) {
						debug(`No valid transformer found for extension '${layout.split('.').pop()}'.`);
						resolve();
					}
					
					// Combine metadata and file data.
					const data = Object.assign({}, hoast.options.metadata, file.frontmatter, { content: file.content.data });
					
					// Override content and extension.
					file.content.data = transformer.renderFile(layout, options.options, data).body;
					
					debug(`Rendered file.`);
					resolve();
				})
			})
		);
	};
};