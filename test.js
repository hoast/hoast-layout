// Dependecy modules.
const test = require(`ava`);
// Custom module.
const Layout = require(`.`);

test(`layout`, async function(t) {
	// Create module options.
	const options = {
		directory: `test-src`,
		layout: `d.hbs`,
		patterns: `**/*.html`
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
			layout: `e.hbs`
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
			data: `<html>\n	<head>\n		<title>hoast layout</title>\n		<meta name="description" content="a module">\n	</head>\n	<body>\n		<p>file content</p>\n	</body>\n</html>`
		},
		frontmatter: {
			description: `a module`
		}
	}, {
		path: `c.html`,
		content: {
			type: `string`,
			data: `<html>\n	<head>\n		<meta name="description" content="a module">\n		<title>hoast layout</title>\n	</head>\n	<body>\n		<p>file content</p>\n	</body>\n</html>`
		},
		frontmatter: {
			description: `a module`,
			layout: `e.hbs`
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