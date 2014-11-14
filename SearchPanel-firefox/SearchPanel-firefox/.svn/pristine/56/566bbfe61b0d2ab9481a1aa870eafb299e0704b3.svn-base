// log 4 simon and gene
// this script is listening to two actions for initialization:
/* - parsed results (with the related divs as parameter)
*	//- mouseover container -> measure time when the mouse is within a container (hashed url, time spent, ranking)
*	- click -> click on a search result (hashed url, ranking (just think about it: 2nd page??), history-state (new,unseen,seen))
*	- (new) search query (hash of query, hash of result urls)
*	- 
*/
// - widget ready (widget parameters)
/* 	- click on widget links (hash url, ranking) //isinFav, history-state (new,unseen,seen))
 *  - activities (show search snippet,widget closed, move widget, add to fav, remove from fav) 
 *  - if NOT search result page: (consider: alsof or search result page? maybe needed information is already in the snippet or provided by google)
 *  	clicks on page (number)
 *  	time spent on page (time)
 *  	exit page (boolean)
 *  	text copied from page (number of times)
 *  	page scrolled
 *  	added to fav
 */

/* triggers:
* preview_triggers_updatePreview
* ('preview_triggers_previewList',barContainerList);
* ('preview_triggers_newUrl',newurl);
* ('preview_triggers_updatePreview', [adapter, currentUrls]);
* ('preview_triggers_previewList',barContainerList);
* ('preview_triggers_showSnippet', [ url, $snippet])
* 'preview_triggers_newQuery', [query, adapterResult.results]
* ('preview_triggers_delBookmark', [url])
* ('preview_triggers_newBookmark', [url, title])
* preview_triggers_addedBackButton, button
*/

function Logging(info) {
	var self = this;
	var version_info = info;
	var urlInfos = {};
	var doLogging = true;
	
	var lastTabstate=false;
	
	/*** LISTENER METHODS ***/
	/* gets triggered when the widget gets drawn */
	$(document).on('preview_triggers_updatePreview', function(trigger, adapter, currentUrls) {
		var currentUrlsOnly = [];
		
		//console.log("got trigger: updatePreview", adapter,currentUrls);
		if(adapter) {
			$.each(adapter.domLinks, function(url,k) {
				
				if(!$(k.container).attr('pp_setlistener'))
				{
					currentUrlsOnly.push(url);
					var startTime=0;
					// container (search page)
					$(k.container).mouseenter(
							function() {
								startTime = new Date().getTime();
							}
					);
					
					$(k.container).mouseleave(
							function() {
								totalTime = new Date().getTime() - startTime;
								self.log('mouseover', self.hashIt(url), 'page', {'time': totalTime/1000, 'rank': currentUrlsOnly.indexOf(url)+1});
							}	
					);
					
					$(k.container).on('click', function() {
						var info = {};
						info.rank = currentUrlsOnly.indexOf(url)+1;
						self.addInfoForUrl(info, url);
						
						self.log('click', self.hashIt(url), 'page', info);				
					});
					$(k.container).attr('pp_setlistener', true);
				}
			});
		}
	});
	
	$(document).on('preview_triggers_showSnippet', function(trigger, url, snippet) {
		var startTime=0;
		
		snippet.unbind('mouseenter');
		snippet.unbind('mouseleave');
		snippet.unbind('click');
		
		snippet.mouseenter(
				function() {
					startTime = new Date().getTime();
				}
		);
		
		snippet.mouseleave(
				function() {
					totalTime = new Date().getTime() - startTime;
					self.log('mouseover', self.hashIt(url), 'snippet', {'time': totalTime/1000});
				}
		);
		
		snippet.on('click', function() {
			var info = {};
			self.addInfoForUrl(info, url);
			self.log('click', self.hashIt(url), 'snippet', info);				
		});
	});

	$(document).on('preview_triggers_addedBackButton', function(trigger, button) {
		$(button).on('click', function() {
			/* gets triggered when the back to search result button on the widget is clicked */
			self.log('click', '_back', 'widget');				
		});
	});
	
	$(document).on('preview_triggers_addedSearchSwitchButton', function(trigger, button, engine) {
		$(button).on('click', function() {
			/* gets triggered when the back to search result button on the widget is clicked */
			self.log('click', '_switchengine', 'widget', {'new': engine});				
		});
	});
	
	/* gets triggered after a new position for the widget was saved */
	$(document).on('preview_triggers_widgetMoved', function(trigger, pos) {
		self.log('widgetmoved', pos, 'widget');				
	});
	
	/* gets triggered after the widget is drawn */
	$(document).on('preview_triggers_previewList', function(trigger, barContainerList) {
		//console.log("got trigger: previewList", barContainerList);
		/* watch for clicks in the widget {log: 'click', context: 'widget'} */
		var currentUrlsOnly = [];
		
		$.each(barContainerList, function(url,v) {
			currentUrlsOnly.push(url);
			
			var startTime=0;
			// container (search page)
			v.mouseenter(
					function() {
						startTime = new Date().getTime();
					}
			);
			
			v.mouseleave(
					function() {
						totalTime = new Date().getTime() - startTime;
						self.log('mouseover', self.hashIt(url), 'widget', {'time': totalTime/1000, 'rank': currentUrlsOnly.indexOf(url)+1});
					}
			);
			
			v.find('a').on('click', function() {
				var info = {};
				info.rank =  currentUrlsOnly.indexOf(url)+1;
				self.addInfoForUrl(info, url);
				self.log('click', self.hashIt(url), 'widget', info);				
			});
		});
	});

	/* gets triggered at a new query */ 
	$(document).on('preview_triggers_newQuery', function(trigger, query, adapter) {
		//console.log("got trigger: newQuery", query, adapter); //.results
		
		var newRes = [];
		$.each(adapter.results, function(k,v) {
			newRes.push(self.hashIt(v.url));
		});
		
		var q = {};
		
		q.queryLength = query.length;
		var substrings = query.trim().split(" ");
		q.queryWords = substrings.length;
		q.query = self.hashIt(query);
		
		self.log('newquery', '_'+adapter.site, 'page', {'query': q, 'offset': adapter.resultPageOffset, 'results': newRes});	
	});
	
	/* gets triggered at an already performed query */ 
	$(document).on('preview_triggers_oldQuery', function(trigger, query, adapter) {
		//console.log("got trigger: newQuery", query, adapter); //.results
		
		var newRes = [];
		$.each(adapter.results, function(k,v) {
			//console.log(v);
			newRes.push(self.hashIt(v.url));
		});
		
		var q = {};
		
		q.queryLength = query.length;
		var substrings = query.trim().split(" ");
		q.queryWords = substrings.length;
		q.query = self.hashIt(query);
		
		self.log('oldquery', '_'+adapter.site, 'page', {'query': q, 'offset': adapter.resultPageOffset, 'results': newRes});	
	});
	
	
	/* gets triggered when a click occurs on a special field (e.g. preview of a snippet) */
	/*$(document).on('preview_triggers_specialclick', function(trigger, url, info) {
		//console.log("got trigger: delBookmark", url); //.results
		
		self.log('specialclick', self.hashIt(url), 'widget', info);	
	});*/
	
	
	/* gets triggered when a bookmark gets deleted (click by the widget only) */
	$(document).on('preview_triggers_delBookmark', function(trigger, url) {
		//console.log("got trigger: delBookmark", url); //.results
		
		self.log('delbookmark', self.hashIt(url), 'widget');	
	});
	
	/* gets triggered when a bookmark is added (click by the widget only) */
	$(document).on('preview_triggers_newBookmark', function(trigger, url, title) {
		//console.log("got trigger: addBookmark", url, title); //.results
		
		self.log('addbookmark', self.hashIt(url), 'widget');	
	});
	
	/* gets triggered when widget will deactivated/activated/active/etc... */
	$(document).on('preview_triggers_tabstate', function(trigger, tabstate) {
		//console.log("got trigger: addBookmark", url, title); //.results
		if(lastTabstate)
		{
			if(lastTabstate.active != tabstate.active ||
					lastTabstate.state != tabstate.state)
			{
				self.log('newtabstate', null, 'widget',tabstate);
			}
			doLogging = tabstate.state;
		}
		lastTabstate = tabstate;
	});
	
	$(document).on('preview_triggers_urlState', function(trigger, url, state) {
		if(!urlInfos[url])
			urlInfos[url] = {};
		urlInfos[url].state = state;
	});
	
	$(document).on('preview_triggers_urlHighlight', function(trigger, url, state) {
		if(!urlInfos[url])
			urlInfos[url] = {};
		urlInfos[url].highlight = state;
	});
    
	/*** INTERNAL METHODS ***/
	this.hashIt = function(string) {
		//return string;
		return b64_md5(string);
	};	

	this.addInfoForUrl = function(info, url) {
		if(urlInfos[url])
			$.extend(info, urlInfos[url]);
	};
	
	// types: click, action, mouseover
	// context: page, widget
	this.log = function(type,url,context, info) {
		// append query to session data
		if(typeof searchHistory != 'undefined')
		{
			version_info.query = this.hashIt(searchHistory.getCurrentSearchQuery());
		}

		if(lastTabstate)
		{
			version_info.state = lastTabstate.state;
			version_info.active = lastTabstate.active;
		}

		var data = {'session': version_info, 'type': type, 'url': url, 'context': context, 'info': info};
		
		if(!doLogging || !logging)
			return;
		
		console.log('[SearchPanel] new log entry', data);
        $.ajax({url: logUrl,
			data: data});
		/*postMessage({
			'command': 'log',
			'data': data
		});*/
	};
	
	this.logDirect = function(type,url,context,info) {
		var data = {'type': type, 'url': url, 'context': context, 'info': info};
		//data.p = chrome.app.getDetails().id;
		
		//console.log('log', data);
		$.ajax({url: logUrl,
			data: data});
	};
}