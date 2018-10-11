// Dependency modules.
const test = require(`ava`);
// Custom module.
const Layout = require(`../library`);

test(`layout`, async function(t) {
	// Create module options.
	const options = {
		directories: `test/layouts`,
		layout: `a.hbs`,
		patterns: `*.html`
	};
	
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
	const layout = Layout(options);
	await layout({
		options: {
			source: `.`,
			metadata: {
				title: `hoast layout`
			}
		}
	}, files);
	
	// Compare files.
	t.deepEqual(files, filesOutcome);
});