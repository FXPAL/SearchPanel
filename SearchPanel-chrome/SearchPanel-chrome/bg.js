var on = localStorage["extension_on"];
on = on == null || on == 'true';

var active = false;

//setTimeout(setOn, 250);
setOn(); // gets only called once (when the plugin loads)

var tab;

chrome.bookmarks.onCreated.addListener(
	function(id, bookmark) {
		if(!tab) return;
		//console.log('bookmark added',bookmark);
		chrome.tabs.sendMessage(tab.id, {	
			'command': 'bookmark_added', 
			'url': bookmark.url
		});
	});

chrome.bookmarks.onRemoved.addListener(
	function(id, removeInfo) {
		if(!tab) return;
		//console.log('bookmark_deleted', removeInfo);
		chrome.tabs.sendMessage(tab.id, {	
			'command': 'bookmark_deleted'
		});
});

chrome.tabs.onActivated.addListener(function(info) {
	notifyTabOfState(info.tabId);
});


chrome.extension.onConnect.addListener(function(port) {
	tab = port.sender.tab;
    // This will get called by the content script we execute in
    // the tab as a result of the user pressing the browser action.
    port.onMessage.addListener(function(info, sender, sendResponse) {
    	if(!info.command)
		{
    		console.log('invalid command',info);
    		return;
		}
    	
    	console.log('new message: '+info.command,info);
    	
    	switch(info.command)
    	{
	    	case 'load_data':
	    		if(info.specific == 'tab') 	mkey = info.key + '.' + uniqueTabId(tab, info.tabhash);
	    		else mkey = info.key;
	    		
	    		var postData = function(key,value) {
		    		chrome.tabs.sendMessage(tab.id, {
						'command': 'data', 
						'key': key,
						'value': value
					}); 
		    	};
	    		
	    		if(backendStorage == 'db') {
	    			var obj = {};
	    			obj[mkey] = null;

	    			chrome.storage.local.get(obj, function(res) {
	    				//console.log(res, mkey, res[mkey]);
	    				$.each(res, function(k,v) {
	    					if(k.indexOf('.')!=-1)
	    						k = k.substring(0, k.indexOf('.'));
	    					//console.log("key",k);
	    					
	    					postData(k, v); 
	    				});
	    			});
	    		}
	    		else
	    		{
	    			postData(info.key, readValue(mkey));
	    		}
	    		break;
	    	case 'load_vars':
	    		chrome.tabs.sendMessage(tab.id, {
					'command': 'initVars', 
					'versionType': versionType,
					'UUID': UUID
				}); 
	    		break;
	    	case 'save_data':
	    		if(info.specific == 'tab') 	mkey = info.key + '.' + uniqueTabId(tab, info.tabhash);
	    		else mkey = info.key;
	    		
	    		if(backendStorage == 'db') {
	    			var obj = {};
	    			obj[mkey] = info.value;
	    			console.log(obj);
	    			chrome.storage.local.set(obj);
	    		}
	    		else
    			{
	    			storeValue(mkey, info.value);
    			}
	    		break;

	    	case 'save_top':
	    		storeValue('top', info.value);
	    		break;
	    	case 'get_top':
	    		//console.log('get top');
	    		chrome.tabs.sendMessage(tab.id, {
	    						'command': 'top_position', 
	    						'value': readValue('top')
	    					});
	    		break;
	    	case 'search_visithistory':
	    		chrome.history.getVisits({url: info.url}, function(results) {
			    		chrome.tabs.sendMessage(tab.id, {	
								'command': 'history_visitresult', 
								'results': results,
								'url': info.url
		    			});
	    		});
	    		break;
	    	case 'search_bookmark':
	    		chrome.bookmarks.search(info.query, function(results) { 
	    				chrome.tabs.sendMessage(tab.id, {	
	    						'command': 'bookmark_result', 
	    						'results': results,
	    						'query': info.query
						});
	    		});
	    		break;
	    	case 'capture_screen':
	    		chrome.tabs.captureVisibleTab(null, {format: "png"}, function(data) {
		    		//console.log("capture_screen got data", data);
		    		cropData(data, info.coords, function(res) {
		    			
		    			chrome.tabs.sendMessage(tab.id, {	
		 					'command': 'screen_captures', 
		 					'results': res
		 				});
		    			//console.log("capture_screen done", res);
		    		});
		    	});
	    		break;
	    	case 'add_bookmark':
	    		// needed parameters:
	    		// - url
	    		// - title
	    		// - subfolder
	    		// NOTE: we only give feedback on success
	    		
	    		/* steps:
	    		1. check if main folder exists
	    		1.1 if not, create them
	    		2. look for folder
	    		3. check if subfolder exists (date, but specified by parameter)
	    		4.1 if not, create it
	    		5. add bookmark
	    		*/
	    		
	    		var createBookmark = function(subFolder) {
	    			// create bookmark
	    			chrome.bookmarks.create({'parentId': subFolder.id,
                        'title': info.title,
                        'url': info.url},function(res) { // gets triggered by the new bookmark listener anyway
                        	//console.log(res);
	                        //chrome.tabs.sendMessage(tab.id, {	
	    					//	'command': 'bookmark_added', 
	    					//	'results': res,
	    					//	'url': info.url
	    					//});
                        });
	    		};
	    		
	    		var createSubFolder = function(newFolder,callback) {
					// create subfolder
					chrome.bookmarks.create(
							{'parentId': newFolder.id, 'title': info.subfolder},
							function(newFolder) {
								// add bookmark
								//console.log("added folder: " + newFolder.title);
								callback(newFolder);
							});
    				//console.log("added folder: " + newFolder.title);
    			};
	    		
	    		searchFolderNameInBookmarks(mainBookmarkFolderName, 
	    				function(folderName,mainFolder) {
	    					// found mainFolder
	    					//console.log('found main folder',mainFolder);
	    					searchFolderNameInBookmarks(info.subfolder, 
	    						function(folderName,subFolder) {
	    							// found
	    							//console.log('all folders exist');
	    							createBookmark(subFolder);
	    						},
	    						function(folderName) { 
	    							// not found
	    							//console.log('missing subfolder');
	    							createSubFolder(mainFolder,createBookmark); // create subfolder and on success create bookmark
	    						},
	    						mainFolder,
	    						1);
	    				},
	    				function(folderName) {
	    					// mainFolder not found -> create main folder
	    					chrome.bookmarks.create(
	    							{'title': mainBookmarkFolderName},
	    							function(newFolder) { createSubFolder(newFolder,createBookmark); } // create subfolder and on success create bookmark
	    		    			);
	    				},
	    				false,
	    				2);
	    		
	    		break;
	    	case 'del_bookmark':
	    		// needed parameters:
	    		// - url
	    		
	    		var deleteEntry = function(askForPermission,entry,subFolder) {
	    			if(askForPermission) {
	    				if(confirm('This bookmark is in a custom subfolder ('+subFolder.title+')! Do you really want to delete it?')==false)
	    					return;
	    			}
	    			
	    			chrome.bookmarks.remove(entry.id,function(res) { // gets triggered by the delete bookmark listener anyway
	    				/*console.log(res);
	    					if(res)
	    					{
		    					chrome.tabs.sendMessage(tab.id, {	
			 						'command': 'bookmark_deleted', 
			 						'results': res,
			 						'url': info.url
			 					});
	    					}*/
	    				});
	    		};
	    		
	    		chrome.bookmarks.search(info.url, function(results) {
	    			//console.log(results);
	    			$.each(results,function(k,v) { 
	    				// check if this bookmark is in our subfolder.. if not, ask for permission to remove it...
	    				chrome.bookmarks.get(v.parentId,function(resO) {
	    					if(resO[0].parentId) { 
	    						chrome.bookmarks.get(resO[0].parentId,function(res) {
	    							if(res[0].title != mainBookmarkFolderName) 
	    								deleteEntry(true,v,resO[0]);  // wrong subfolder, ask for permission to delete this entry
	    							else 
	    								deleteEntry(false,v); // all fine, we can remove this without asking again
	    						});
	    					}
	    					else 
	    						deleteEntry(true,v,resO[0]); // no subfolder, ask for permission to delete this entry
	    				});
	    			} );
	    		});
	    		break;
	    	case 'log':
	    		if(localStorage['noLogging'])
	    		{
	    			console.log('logging is deactivated!');
	    			return;
	    		}
	    		info.data.p = chrome.app.getDetails().id;
	    		//console.log('log', info.data);
	    		$.ajax({url: logUrl,
	    			data: info.data});
	    		break;
	    	case 'status':
	    		//console.log("tab status", info);
	    		//console.log(info.site);
	    	    updateIcon(info.site !== false);
	        	
	    	    setOn();
	    		
	    		break;
    		default:
    			console.log('Houston, we\'ve got a problem...command '+info.command+' is unknown. help me with that:', info);
    	}
   });
});

chrome.tabs.onCreated.addListener(function(tab) {
	if (tab.openerTabId) {
		if(backendStorage == 'db') {
			var obj = {};
			obj['currentSearch.' + tab.openerTabId] = null;
			obj['currentSnaps.' + tab.openerTabId] = null;
			chrome.storage.local.get(obj, function(res) {
				var newO = {};
				newO['currentSearch.' + tab.id] = res['currentSearch.' + tab.openerTabId];
				newO['currentSnaps.' + tab.id] = res['currentSnaps.' + tab.openerTabId];
				chrome.storage.local.set(newO);
			});
		}
		else
		{
			localStorage['currentSearch.' + tab.id] = localStorage['currentSearch.' + tab.openerTabId];
			localStorage['currentSnaps.' + tab.id] = localStorage['currentSnaps.' + tab.openerTabId];
		}
		notifyTabOfState(tab.id);
	}
});

chrome.tabs.onRemoved.addListener(function(tabid, removeInfo) {
	if(backendStorage == 'db') {
		var obj = {};
		obj['currentSearch.' + tab.openerTabId] = null;
		obj['currentSnaps.' + tab.openerTabId] = null;
		chrome.storage.local.get(obj, function(res) {
			var newO = {};
			newO['currentSearch.' + tab.id] = res['currentSearch.' + tab.openerTabId];
			newO['currentSnaps.' + tab.id] = res['currentSnaps.' + tab.openerTabId];
			chrome.storage.local.set(newO);
		});
	}
	else
	{
		localStorage['currentSearch.' + tabid] = localStorage['currentSearch.' + tab.openerTabId];
		localStorage['currentSnaps.' + tabid] = localStorage['currentSnaps.' + tab.openerTabId];
	}
});

// Called when the user clicks on the browser action icon.
chrome.browserAction.onClicked.addListener(function(tab) {
	setOn(!on);
});


chrome.tabs.onRemoved.addListener(
	function(tabId) {
		if(backendStorage == 'db') {
			chrome.storage.local.remove('currentSearch.' + tabId);
			chrome.storage.local.remove('currentSnaps.' + tabId);
		}
		else
		{
			localStorage.removeItem('currentSearch.' + tabId);
			localStorage.removeItem('currentSnaps.' + tabId);
		}
	});
	
//chrome.tabs.onUpdated.addListener(function(tabid, changeInfo, tab) {
//	console.log("tab updated", tabid, changeInfo, tab);
//});

// problems:
// - hash IS not unique
// - hash is not available at listeners (save hash temporary through tab id.. complicated, but would be possible...)
function uniqueTabId(tab,hash) {
	//return hash;
	return tab.id; // 
}

// not used anymore
function cropData(str, coords, callback) {
	var $img = $('<img>');
	
	$img.on('load', function() {
		var $canvas = $('<canvas>');
	
		var results = {};
		$.each(coords, function(url, coord) {
			$canvas.width(coord.w);
			$canvas.height(coord.h);
	
			var ctx = $canvas[0].getContext('2d');
			ctx.drawImage($img[0], coord.x, coord.y, coord.w, coord.h, 0, 0, coord.w, coord.h);
		
			results[url] = $canvas[0].toDataURL(); 
		});
		
		callback(results);
	});
	
	$img.attr('src', str);
}
  
function setOn(p_on)
{
	p_on = p_on == null ? on : p_on;
	
	//console.log('setOn',p_on);
	
    localStorage["extension_on"] = '' + p_on;
    
    on = p_on;
    chrome.browserAction.setIcon(getIcon());
    
    chrome.tabs.getSelected(null, function(tab) {
    	notifyTabOfState(tab.id);
    });
}

function notifyTabOfState(id) {
	//console.log('notifyTabOfState message to ',id, active,on);
    chrome.tabs.sendMessage(id, {
    		'command': 'tabstate', 
    		'active': active,
    		'state': on
    		});
}

function searchFolderNameInBookmarks(folderName, onSuccessCallback, onFailureCallback,subtree,maxdeep,currentdeep) {
	//console.log('searchFolderNameInBookmarks',folderName);
	if(!maxdeep) maxdeep = 10;
	if(!currentdeep) currentdeep = 0;
	
	if(maxdeep < currentdeep)
	{
		//console.log('max deep reached:', maxdeep + "<" + currentdeep);
		return false;
	}
	currentdeep++;
	
	if(!subtree)
	{
		chrome.bookmarks.getTree(function(results) {
			//console.log(results);
			if(results[0].children)
			{
				for(var i=0;i<results[0].children.length;i++)
				{
					var l = results[0].children[i];
					if(l.children)
					{
//						/console.log('root',l.title);
						if(searchFolderNameInBookmarks(folderName,onSuccessCallback, onFailureCallback, l, maxdeep, currentdeep))
							return true;
					}
				}
			}
			if(onFailureCallback) onFailureCallback(folderName);
			//console.log(folderName + " not found");
		});
	}
	else
	{
		//console.log('subtree',subtree.title);

		if(subtree.title == folderName) 
		{
			//console.log('found '+subtree.title+':', onSuccessCallback);
			if(onSuccessCallback) onSuccessCallback(folderName,subtree);
			return true;
		}
		
		for(var i=0;i<subtree.children.length;i++)
		{
			var l = subtree.children[i];
			if(l.children)
			{
				if(searchFolderNameInBookmarks(folderName,onSuccessCallback, onFailureCallback, l, maxdeep, currentdeep))
					return true;
			}
		}
		
		if(currentdeep==1)
		{
			if(onFailureCallback) onFailureCallback(folderName);
			//console.log(folderName + " not found");
		}
	}
	return false;
}

function getIcon() {
	var icon;
	if (on) 
		icon = active ? "icons/on.png" : "icons/inactive.png";
	else
		icon = "icons/off.png";
	return {path: icon};
}

function storeValue(key, value) {
	if (value) {
		var encoded = JSON.stringify(value);
		localStorage.removeItem(key);
		if (encoded != "undefined")
			localStorage[key] = encoded;
		else
			console.log('cannot code '+key);
	}
}

function readValue(key) {
	var value = localStorage[key];
	if (value)
		try {
			value = JSON.parse(value);
		}
	catch(err) {
		console.log("Error reading value at " + key + " from persistent store", err);
		value = null;
	}
	return value;
}

//loadStylesheet
  
function updateIcon(state) {
	//console.log('active',state);
	active = state;
	chrome.browserAction.setIcon(getIcon());
//	  var text = active ? 'ok' : 'foo';
//	  chrome.browserAction.setBadgeText({'text':text});
//	  console.log('updateIcon', text);
}

// show help page after installation
if (!window.localStorage.getItem('hasSeenIntro')) {
  window.localStorage.setItem('hasSeenIntro', 'yep');
  chrome.tabs.create({
    url: '/help.html?firststart'
  });
}