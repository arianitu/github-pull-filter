chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	var butHtml = '<div class="button-group"><a href="#collapse_diff" style="margin-left: 5px" class="diff-collapse-button minibutton" rel="nofollow">Collapse</a></div>';
	var collapsedHtml = '<div class="image diff-collapsed-message" style="display: none"><a href="#" class="expand-diff-link">Diff suppressed. Click to show.</a></div>';

	var expand = function(button, content, message) {
		button.textContent = 'Collapse';
		content.style.display = ''; // Restore original display (table/block)
		if(message) { message.style.display = 'none'; }

	};

	var collapse = function(button, content, message) {
		button.textContent = 'Expand';
		content.style.display = 'none';
		if(message) { message.style.display = 'block'; }
	};

	var bindToggler = function(buttonContainer, tableToToggle, addPlaceHolder) {
		var messageDiv, button;
		if(!tableToToggle) { return; }

		buttonContainer.insertAdjacentHTML('afterbegin', butHtml);
		tableToToggle.insertAdjacentHTML('afterend', collapsedHtml);
		button = buttonContainer.querySelector('.diff-collapse-button');

		if(addPlaceHolder) {
			messageDiv = tableToToggle.parentElement.querySelector('.diff-collapsed-message');
			messageDiv.querySelector('.expand-diff-link').addEventListener('click', function(e) {
				e.preventDefault();
				expand(button, tableToToggle, messageDiv);
			}, true);
		}

		button.addEventListener('click', function(e) {
			e.preventDefault();
			if (button.textContent !== 'Collapse') {
				expand(button, tableToToggle, messageDiv);
			} else {
				collapse(button, tableToToggle, messageDiv);
			}
		}, true);
	};

	var fileContainers = document.querySelectorAll('#files .file');
	for (var i = 0; i < fileContainers.length; ++i) {
		bindToggler(fileContainers[i].querySelector('.file-actions'),
		            fileContainers[i].querySelector('table.file-diff, .diff-table'), true);
	}

	var discussions = document.querySelectorAll('.mini-discussion-bubble-action');
	for (var i = 0; i < discussions.length; ++i) {
		var buttonContainer = discussions[i].appendChild(document.createElement('div'));
		buttonContainer.style.cssText = 'float:right';
		bindToggler(buttonContainer, discussions[i].nextElementSibling, false);
	}

	var currentURL = document.URL;
	var regex = /github\.com\/+(.+)\/+(.+)\/+pull\/+(\d+)\/+files/;
	var result = regex.exec(currentURL);
	if (! result || ! result[1] || ! result[2] || ! result[3]) {
		return;
	}
	var requestURL = "https://github.com/" + result[1] + "/" + result[2] + "/pull/" + result[3];
	var request = new XMLHttpRequest();

	request.onload = function justDoIt() {
		var commentSection = document.querySelector(".comment-content");
		var commentBody = document.querySelector(".comment-body");

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

		// div.file-info > span.js-selectable-text
		var allCollapsedButtons = document.querySelectorAll(".diff-collapse-button");
		for (var buttonIdx = 0; buttonIdx < allCollapsedButtons.length; buttonIdx++) {
			var button = allCollapsedButtons[buttonIdx];
			var fileName = button.parentNode.parentNode.parentNode.querySelector("div.file-info > span.user-select-contain").innerHTML;
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
