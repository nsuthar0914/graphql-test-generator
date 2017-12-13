const fs = require('fs');
const path = require('path');
const mkdir = require('mkdirp');
const gqlExtract = require("gql-extract");
const tmp = require("tmp");
const generateTest = require('./generateTest');

function errorExit(err) {
	if (err) {
		console.error(err.stack);
		process.exit(1);
	}
}

function writeFile(filename, query, queryName, schemaLocation, importLocation) {
	fs.writeFileSync(
		filename,
		generateTest({ query, queryName, schemaLocation, importLocation })
	);
	console.log(`test generated for ${queryName}`);
}

function gqlTestExtraction({ entry, output, schemaLocation, overwriteFiles, importLocation }) {
	tmp.dir({ unsafeCleanup: true}, (err, graphqlOutput, cleanup) => {
		fs.readdir(entry, (err, files) => {
			console.log("files")
			console.log(files, graphqlOutput)
			errorExit(err);
			let finishedCount = 0;
			files.forEach(file => {
				fs.stat(path.join(entry, file), (err, stat) => {
					errorExit(err);
					if (stat.isFile() && file.includes(".js")) {
						fs.readFile(path.join(entry, file), "utf8", (err, data) => {
							errorExit(err);
							console.log("data")
							console.log(data)
							const { queriesWritten } = gqlExtract({
								source: data,
								filePath: graphqlOutput
							});
							if (!queriesWritten.size) {
								const queries = require(path.join(entry, file)).default;
								Object.keys(queries).forEach(key => {
								    queriesWritten.set(key, queries[key].loc.source.body);
								});
							}
							console.log("queriesWritten")
							// console.log(queriesWritten);
							if (queriesWritten.size) {
								queriesWritten.forEach((query, queryName) => {
										console.log("query, queryName");
										console.log(query, queryName);
										errorExit(err);
										mkdir(output, err => {
											errorExit(err);
											const filename = path.join(output, `${queryName}-test.js`);

											if (overwriteFiles) {
												writeFile(filename, query, queryName, schemaLocation, importLocation);
												finishedCount++;
												if (finishedCount === files.length) {
													cleanup();
												}
											} else {
												fs.stat(filename, function(err, stat) {
													const fileDoesNotExist = err || !stat.isFile();
													if (fileDoesNotExist) {
														writeFile(filename, query, queryName, schemaLocation, importLocation);
														finishedCount++;
													}
													if (finishedCount === files.length) {
														cleanup();
													}
												});
											}

										});
								});
							}
						});
					}
					else if (!stat.isFile()) {
						gqlTestExtraction({
							entry: path.join(entry, file),
							output,
							graphqlOutput,
							schemaLocation,
							overwriteFiles,
							importLocation
						});
					}
				});
			});
		});
	});
}

module.exports = gqlTestExtraction;
