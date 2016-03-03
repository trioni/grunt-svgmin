'use strict';
var chalk = require('chalk');
var eachAsync = require('each-async');
var prettyBytes = require('pretty-bytes');
var logSymbols = require('log-symbols');
var SVGO = require('svgo');

module.exports = function (grunt) {
	grunt.registerMultiTask('svgmin', 'Minify SVG', function () {
		var options = this.options({
			verbose: true
		});
		var verbose = false;
		var done = this.async();
		var svgo = new SVGO(options);
		var totalSaved = 0;
		var totalFiles = 0;

		eachAsync(this.files, function (el, i, next) {
			var srcPath = el.src[0];
			var srcSvg = grunt.file.read(srcPath);

			svgo.optimize(srcSvg, function (result) {
				if (result.error) {
					grunt.warn(srcPath + ': ' + result.error);
					next();
					return;
				}

				var saved = srcSvg.length - result.data.length;
				var percentage = saved / srcSvg.length * 100;
				totalSaved += saved;
				totalFiles += 1;

				if (options.verbose) {
					grunt.log.writeln(logSymbols.success + ' ' + srcPath + chalk.gray(' (saved ' + chalk.bold(prettyBytes(saved)) + ' ' + Math.round(percentage) + '%)'));
				}
				grunt.file.write(el.dest, result.data);
				next();
			});
		}, function () {
			grunt.log.writeln('Total saved: ' + chalk.green(prettyBytes(totalSaved)) + ', for ' + chalk.green(totalFiles) + ' files');
			done();
		});
	});
};
