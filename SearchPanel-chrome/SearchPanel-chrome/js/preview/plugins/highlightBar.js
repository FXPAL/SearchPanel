
function HighlightBar() {
	var self = this;
	var urlHighlightMapping = {};


	$(document).on("preview_triggers_updatePreview", function(trigger, adapter) {
		//reset these variables on updatePreview
		urlHighlightMapping = {};
	});
	
	$(document).on('preview_triggers_newBar', function(trigger,$barcontainer, currentUrl, $bar) {
		self.highlightBarCheck($barcontainer,currentUrl);
	});


	$(document).on('preview_triggers_addedBookmark', function(trigger, url) {
		self.updateUrlHighlight(url, 'in_bookmarks');
	});
	
	
	$(document).on('preview_triggers_deletedBookmark', function(trigger, url) {
		if(url) // we got an url..update only this entry...
		{
			self.updateUrlHighlight(url, 'no_highlight');
		}
		else // no url, update whoel widget
		{
			self.updateAllUrlHiglights();
		}
	});
	
	this.highlightBarCheck = function(elm,info) {
		// check bookmarks
		if(!urlHighlightMapping[info.url])
		{
			urlHighlightMapping[info.url] = {elem: $('<div>'), info: info};
			urlHighlightMapping[info.url].elem.addClass('pp_barBookmark');
			if(elm.find('.pp_selected').length!=0) {
				urlHighlightMapping[info.url].elem.addClass('pp_currentPage');
			}
			urlHighlightMapping[info.url].elem.attr('title', 'add to bookmarks');
			
			elm.append(urlHighlightMapping[info.url].elem);
		}
		
		bookmarkManager.checkEntry(info.url, function() { 
			// entry found
			self.updateUrlHighlight(info.url, 'in_bookmarks');
			urlHighlightMapping[info.url].elem.attr('title', 'remove from bookmarks');
		}, function() {
			self.updateUrlHighlight(info.url, 'no_highlight');
		});
		
		
		// check own database about the usefulness of this link based on earlier visits
		// TODO, class: pp_barHighlightIntelligence
	};
	
	this.updateAllUrlHiglights = function () {
		$.each(urlHighlightMapping, function(k,v) {
			self.highlightBarCheck(v.elem, v.info);
		});
	};
	
	this.updateUrlHighlight = function (url,newState) {
		if(!urlHighlightMapping[url])
			{
			console.log('no entry for url '+url, urlHighlightMapping);
			return;
			}
		var info = urlHighlightMapping[url].info;
		var elem = urlHighlightMapping[url].elem;
		
		$(document).trigger('preview_triggers_urlHighlight',[url, newState]);
		
		//elem.removeClass('pp_barBookmark');
		elem.removeClass('pp_barHighlightBookmark');
		elem.removeClass('pp_barHighlightIntelligence');
		
		elem.unbind('click');
		
		switch(newState){
			case 'no_highlight':
				//elem.addClass('pp_barBookmark');
				elem.click(function() { bookmarkManager.addToFav(info.url,info.title); });
				break;
			case 'in_bookmarks':
				elem.addClass('pp_barHighlightBookmark');
				elem.click(function() { bookmarkManager.delFromFav(info.url); });
				break;
			case 'suggestion':
				elem.addClass('pp_barHighlightIntelligence');
				elem.click(function() { bookmarkManager.addToFav(info.url,info.title); });
				break;
		}
	};
}
	