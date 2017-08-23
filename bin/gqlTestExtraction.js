#!/usr/bin/env node
const program = require("commander");
const gqlTestExtraction = require("../gqlTestExtraction");

program
.version('0.0.0')
.option('-e, --entry [value]', 'in directory')
.option('-o, --output [value]', 'out directory')
.option('-s, --schema [value]', 'schema location')
.option('-ow, --overwrite [value]', 'overwrite existing test files')
.parse(process.argv);

if (program.entry && program.output && program.schema) {
	gqlTestExtraction({ entry: program.entry, output: program.output, schemaLocation: program.schema, overwriteFiles: program.overwrite });	
}