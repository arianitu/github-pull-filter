chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	var currentURL = document.URL;
	var regex = /github\.com\/+(.+)\/+(.+)\/+pull\/+(\d+)\/+files/;
	var result = regex.exec(currentURL);
	if (! result || ! result[1] || ! result[2] || ! result[3]) {
		return;
	}
	var requestURL = "https://github.com/" + result[1] + "/" + result[2] + "/pull/" + result[3];
	
	var request = new XMLHttpRequest();
	request.onload = function justDoIt() {
		if (request.readyState !== request.DONE) {
			return;
		}
		if (request.status !== 200) {
			return;
		}
		
		var requestDocument = request.responseXML;
		var commentBody = requestDocument.querySelector(".comment-body");

		var filterName = "ghfilter";
		var unorderedListOfRegexIdx = undefined;
		for (var childIdx = 0; childIdx < commentBody.children.length; childIdx++) {
			var child = commentBody.children[childIdx];
			if (! child instanceof HTMLParagraphElement) {
				continue;
			}
			
			if (child.innerHTML.substring(0, filterName.length) !== filterName) {
				continue;
			}
			if (commentBody.children.length == (childIdx + 1)) {
				continue;
			}
			
			// make sure next child is an unordered list
			var nextChild = commentBody.children[childIdx + 1];
			if (nextChild instanceof HTMLUListElement) {
				unorderedListOfRegexIdx = childIdx + 1;
				break;
			}
		}

		if (typeof unorderedListOfRegexIdx === "undefined") {
			return;
		}

		var arrRegularExpresions = [];
		var hgfilters = commentBody.children[unorderedListOfRegexIdx];
		for (var childIdx = 0; childIdx < hgfilters.children.length; childIdx++) {
			arrRegularExpresions.push(new RegExp(hgfilters.children[childIdx].innerHTML));
		}

		var allCollapsedButtons = document.querySelectorAll("button.btn-octicon");
		for (var buttonIdx = 0; buttonIdx < allCollapsedButtons.length; buttonIdx++) {
			var button = allCollapsedButtons[buttonIdx];
			
			// NOTE: if this breaks again, we must figure a resilient method of doing this.
			var fileName = button.parentNode.parentNode.dataset.path;
			fileName = fileName.trim();
			var shouldCollapse = false;
			for (var regularExpressionIdx = 0; regularExpressionIdx < arrRegularExpresions.length; regularExpressionIdx++) {
				if (arrRegularExpresions[regularExpressionIdx].test(fileName)) {
					shouldCollapse = true;
					break;
				}
			}

			if (shouldCollapse) {
				button.click();
			}
		}
	};

	request.open("GET", requestURL);
	request.responseType = "document";
	request.send();
});
