var linkify = require('linkifyjs');

function highlightString(origStr, searchStr, searchLink) {
	let searchLower = searchStr.toLowerCase();

	if (origStr == null) {
		return '';
	}

	let urlList = linkify.find(origStr);

	var i = origStr.toLowerCase().indexOf(searchLower);
	var j = i + searchLower.length;
	if (i < 0) {
		return origStr;
	}

	if (searchLink) {
		for (let m in urlList) {
			let url = urlList[m].value;
			let indxInStr = origStr.toLowerCase().indexOf(url.toLowerCase());
			let indxInStrEnd = indxInStr + url.length;
			if (
				(i >= indxInStr && i <= indxInStrEnd) ||
				(j >= indxInStr && j <= indxInStrEnd)
			) {
				return origStr;
			}
		}
	}

	var redText = origStr.substring(i, j);

	return (
		origStr.substring(0, i) +
		"<a style='color: #4486F4; font-weight: bold'>" +
		redText +
		'</a>' +
		origStr.substring(j)
	);
}

export { highlightString };
