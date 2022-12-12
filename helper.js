var moment  = require('moment'),
    _		= require('lodash'),
    glob	= require('glob');

function getGlobbedFiles(globPatterns, removeRoot) {
	//console.log('function called - getGlobbedFiles -> '+globPatterns);
	// URL paths regex
	var urlRegex = new RegExp('^(?:[a-z]+:)?\/\/', 'i');

	// The output array
	var output = [];

	try {
		// If glob pattern is array so we use each pattern in a recursive way, otherwise we use glob
		if (_.isArray(globPatterns)) {
			globPatterns.forEach(function(globPattern) {
				output = _.union(output, getGlobbedFiles(globPattern, removeRoot));
			});
		} else if (_.isString(globPatterns)) {
			if (urlRegex.test(globPatterns)) {
				output.push(globPatterns);
			} else {
				glob(globPatterns, {
					sync: true
				}, function(err, files) {
					if (removeRoot) {
						files = files.map(function(file) {
							return file.replace(removeRoot, '');
						});
					}

					output = _.union(output, files);
				});
			}
		}

		return output;
	} catch (error) {
		console.error(error)
		return output;
	}

}

function formataData(data) {
	if(!data)
		return '';
	return moment(data).format('DD/MM/YYYY HH:mm');
}

module.exports = {
    getGlobbedFiles: getGlobbedFiles,
    formataData: formataData,
}