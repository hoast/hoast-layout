// Dependency modules.
const Hoast = require(`hoast`),
	test = require(`ava`);
// Custom module.
const Layout = require(`../library`);

/**
 * Emulates a simplified Hoast process for testing purposes.
 * @param {Object} options Hoast options.
 * @param {Function} mod Module function.
 * @param {Array of objects} files The files to process and return.
 */
const emulateHoast = async function(options, mod, files) {
	const hoast = Hoast(__dirname, options);
	
	if (mod.before) {
		await mod.before(hoast);
	}
	
	files = await mod(hoast, files);
	
	if (mod.after) {
		await mod.after(hoast);
	}
	
	return files;
};

test(`layout`, async function(t) {
	// Create dummy files.
	const files = [{
		path: `a.txt`,
		content: {
			type: `string`,
			data: `<p>file content</p>`
		}
	}, {
		path: `b.html`,
		content: {
			type: `string`,
			data: `<p>file content</p>`
		},
		frontmatter: {
			description: `a module`
		}
	}, {
		path: `c.html`,
		content: {
			type: `string`,
			data: `<p>file content</p>`
		},
		frontmatter: {
			description: `a module`,
			layout: `b.hbs`
		}
	}];
	
	// Expected outcome.
	const filesOutcome = [{
		path: `a.txt`,
		content: {
			type: `string`,
			data: `<p>file content</p>`
		}
	}, {
		path: `b.html`,
		content: {
			type: `string`,
			data: `<html><head><title>hoast layout</title><meta name="description" content="a module"></head><body><p>file content</p></body></html>`
		},
		frontmatter: {
			description: `a module`
		}
	}, {
		path: `c.html`,
		content: {
			type: `string`,
			data: `<html><head><meta name="description" content="a module"><title>hoast layout</title></head><body><p>file content</p></body></html>`
		},
		frontmatter: {
			description: `a module`,
			layout: `b.hbs`
		}
	}];
	
	// Test module.
	await emulateHoast({
		source: `.`,
		metadata: {
			title: `hoast layout`
		}
	}, Layout({
		directories: `test/layouts`,
		layout: `a.hbs`,
		patterns: `*.html`
	}), files);
	
	// Compare files.
	t.deepEqual(files, filesOutcome);
});