#!/usr/bin/env node

"use strict";

var util = require("util");
var path = require("path");
var fs = require("fs");
var Transform = require("stream").Transform;
var zlib = require("zlib");

const args = require('minimist')(process.argv.slice(2), {
	boolean: ["help", "in", "out", "compress", "uncompress"],
	string: ["file"]
});


var BASE_PATH = path.resolve(process.env.BASE_PATH || __dirname);

var OUTFILE = path.join(BASE_PATH, "out.txt");

if(args.help) {
	printHelp();
} else if(args.in || args._.includes("-")) {
		processFile(process.stdin);
} else if(args.file) {
		let stream = fs.createReadStream(path.resolve(path.join(BASE_PATH, args.file)));

		processFile(stream);

} else {
		error("Incorrect Usage.", true);
}

// ****************************

function processFile(inStream) {
	var outStream = inStream;

	if(args.uncompress) {
		let gunzipStream = zlib.createGunzip();
		outStream = outStream.pipe(gunzipStream);
	}

	var upperStream = new Transform({
		transform(chunk, enc, cb) {
			this.push(chunk.toString().toUpperCase());
			cb();
		}
	});
	

	outStream = outStream.pipe(upperStream);

	if(args.compress) {
		let gzipStream = zlib.createGzip();
		outStream = outStream.pipe(gzipStream);
		OUTFILE = `${OUTFILE}.gz`;
	}

	var targetStream;
	if(args.out) {
		targetStream = process.stdout;
	} else {
			targetStream = fs.createWriteStream(OUTFILE);
	}

	outStream = outStream.pipe(targetStream);
}

function printHelp() {
	console.log("ex2 usage");
	console.log("	ex2.js --file={FILENAME}")
	console.log("");	
	console.log("");
	console.log("--help						print this help");
	console.log("--file={FILENAME}				process the file");
	console.log("--in,						process stdin");
	console.log("--out						prints to stdout");
	console.log("--compress					gzip the output");
	console.log("--uncompress					gunzip the input");
	console.log("");
}

function error(msg, includeHelp=false) {
	console.error(msg);
	
	if(includeHelp) {
		console.log("");
		printHelp();
	}
}
