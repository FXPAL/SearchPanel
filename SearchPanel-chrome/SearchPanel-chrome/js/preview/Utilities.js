/**
 * 2012 Sep 24 Gene Golovchinsky
 * 2013 May 17 Simon Tretter
 */
var urlStateMapping = {};

$(document).on("preview_triggers_updatePreview", function(adapter) {
	//reset these variables on updatePreview
	urlStateMapping = {};
});

function makeAbsolute(url) {
	return (url && url[0] == '/') ?
		document.location.origin + url :
		url;
}

function saveWidgetPosition(pos,notpersistent) {
	localStorage['preview_position'] = pos;
	// save persitent
	if(!notpersistent)
	{
		$(document).trigger('preview_triggers_widgetMoved',pos);
		chrome.extension.connect().postMessage({
			command: 'save_top', 
			value: pos});
	}
}

function getWidgetPosition() {
	var position = localStorage['preview_position'] || 300;
	if(position > $(window).height() || position == 'undefined')
		position = 300;
	
	if(!localStorage['preview_position'] || localStorage['preview_position'] == 'undefined')
	{
		// returns avlue from localStorage, but also tries to retrieve the value from the persistent storage
		chrome.extension.connect().postMessage({
			command: 'get_top'});
	}
	
	return position + 'px';
}


function updateUrlState(url,newState) {
	var elem = urlStateMapping[url].elem;
	
	$(document).trigger('preview_triggers_urlState',[url, newState]);
	
	elem.removeClass('pp_clicked');
	elem.removeClass('pp_new');
	elem.removeClass('pp_unclicked');
	
	switch(newState)
	{
		case 'clicked':
			elem.addClass('pp_clicked');
			break;
		case 'new':
			elem.addClass('pp_new');
			break;
		case 'unclicked':
			elem.addClass('pp_unclicked');
			break;
	}
}

function checkLinkHistory(elm,info, initialstate) {
	// check history
	if(!urlStateMapping[info.url])
	{
		urlStateMapping[info.url] = {elem: elm, info: info};
	}
	
	historyManager.checkEntry(info.url, function() { 
		// entry found
		updateUrlState(info.url, 'clicked');
	}, function() {
		updateUrlState(info.url, initialstate);
	});	
}

// for tab restorage..
// (history,url,referer,page title,..) and make an unique id out of it
function getUniqueTabSignature() {
	return {
		history: history.length,
		url: document.location.href,
		referer: document.referer
	};
}

//This is tied to existing anchors to capture results selection
function recordClick() {
	var url = makeAbsolute($(this).attr('href'));
	searchHistory.recordClick(url);
};

//This is tied to the preview widget to capture selection and then
//to trigger navigation
function previewClickHandler(url, rank) {
	return function() {
		searchHistory.recordClick(url, rank, site, 'w');
		//document.location.href = url;
	};
}

function getPreviewContainer() {
	return $('.'+previewContainerClass);
}

function getSnippetContainer() {
	return $('.'+snippetContainerClass);
}

// returns an unique hash for an array
function calculateHash(results) {
	var str = '';
	for (var i=0; i<results.length; i++)
	{
		if(typeof results[i] == "string")
			str += results[i];
		else
			str += JSON.stringify(results[i]);
	}
	//console.log('md5ing', str);
	return b64_md5(str);
};

function trim(stringToTrim) {
	return stringToTrim == null ? '' : stringToTrim.replace(/^\s+|\s+$/g,"");
}

