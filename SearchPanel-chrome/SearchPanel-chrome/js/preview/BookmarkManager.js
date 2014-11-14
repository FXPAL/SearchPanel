/**
 * This class is responsible for bookmark managing 
 * look for entries and add entries if requested. 
 * 
 * 2013 May 17 Simon Tretter
 */


function BookmarkManager() {
	var callbackStorage = {};
	
	// checks if a given URL is stored in the bookmarks
	this.checkEntry = function(url,foundCallback, notfoundCallback) {
		// check if this url exists in the bookmarks
		
		var callback = function(results) {
			   if(results)
			   {
				   for( var i=0; i<results.length; i++ ) {
						if(results[i].url == url)
						{
							if(foundCallback) foundCallback(url);
							return;
						}
					}
			   }
			   
			   // if we reach this point the entry wasn't found
			   if(notfoundCallback) notfoundCallback(url);
			};

		// workaround: we save the reference in a local variable, and resume this after we got a response
		callbackStorage[url] = callback;
		
		chrome.extension.connect().postMessage({
			'command': 'search_bookmark',
			'query': url
			//'callback': {''} // unfortunately cannot pass functions, tricky workaround (see above)
		});
	};
	
	this.resumeCheckEntry = function(url,results)
	{
		// execute
		callbackStorage[url](results);
		
		// free it	 (somehow this is not a good idea... todo: look into that)
		//delete callbackStorage[url];
	};
	
	// adds a URL with a given caption to the bookmarks
	this.addToFav =  function(url,title) {
		$(document).trigger('preview_triggers_newBookmark', [url, title]);
		
		var d = new Date();
		var subfolder_name = d.toLocaleDateString();
		
		chrome.extension.connect().postMessage({
			'command': 'add_bookmark',
			'url': url,
			'title': title,
			'subfolder': subfolder_name
		});
	};
	
	// deletes a URL from the bookmarks
	this.delFromFav =  function(url) {
		$(document).trigger('preview_triggers_delBookmark', [url]);
		
		chrome.extension.connect().postMessage({
			'command': 'del_bookmark',
			'url': url
		});
	};
}
