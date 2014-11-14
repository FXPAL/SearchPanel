/**
 * This function manages the history of a given tab and coordinates updates
 * to the plugin's persistent store
 * 
 * 2012 Sep 24 Gene Golovchinsky
 * 2013 May 22 Simon Tretter
 */

function SearchHistory(tabSignature) {
	//var self = this;
	// this.signature = tabSignature;
	//this.isLoaded = false;
	//console.log("Creating history", self);
	
	var neededDataCalls = -1; 
	var signatureHash = calculateHash(getUniqueTabSignature());
	//var useLocalStorage = false; // in config.js now: $backendStorage (local or db)
	
	// Initialization
	var data = {
			'queryHistory': [], //hashes of already used queries
			'retrievedHistory': {}, //amount of retrieves by url
			'currentSearch': {
				'results': [], //current result list (from last successful parsed search query)
				'indexUrl': [], // url of last search query
				'query': false, // last query
				'adapter': false, // used adapter
				'lastSelectedPage': false // last selected page
			},
			'currentSnaps': {}
	};
	
	var storageSpecification = {
			'currentSearch': 'tab',
			'currentSnaps': 'tab'
	};
	
	// load my data
	neededDataCalls = 0;
	$.each(data, function(key,val) {
		neededDataCalls++;
		chrome.extension.connect().postMessage({
			'command': 'load_data',
			'key': key,
			'specific': storageSpecification[key],
			'tabhash': signatureHash
		});
	});
	
	/** general setters and getters for data */
	this.setData = function(key, value, datacall) {
		if(value) data[key] = value;
		if(datacall) neededDataCalls--;
	};
	
	this.getData = function(key) {
		return data[key];
	};
	
	this.isReady = function() {
		//console.log('neededDataCalls',neededDataCalls);
		return (neededDataCalls<=0);
	};
	
	/** search history */
	// checks if a query is in our queryHistory
	this.isInQueryHistory = function(adapterResult) {
		hash = adapterResult.site+'_'+hex_md5(adapterResult.query.trim())+'_'+adapterResult.resultPageOffset;
		
		if($.inArray(hash, data['queryHistory'])!==-1)
		{
			console.log('isInQueryHistory = true', hash);
			return true;
		}
		console.log('isInQueryHistory = false', hash);
		return false;
	};
	
    this.deleteHistory = function() {
        data['queryHistory'] = [];
        data['retrievedHistory'] = {};
        
        // save it
        save('queryHistory');
    	save('retrievedHistory');
    };

	this.addQueryToHistory = function(adapterResult) {
		hash = adapterResult.site+'_'+hex_md5(adapterResult.query.trim())+'_'+adapterResult.resultPageOffset;
		data['queryHistory'].push(hash);

		// save it
		save('queryHistory');
	};
	
	// adds a url to the retrieved history
	this.markUrlAsRetrieved = function(urls) {
		var addEntry = function(url, seconds) {
			//url = hex_md5(url);
			if(!data['retrievedHistory'][url])
				data['retrievedHistory'][url] = [];
			
			data['retrievedHistory'][url].push(seconds);
		};
		
		var seconds = Math.round(new Date().getTime()/1000) - 1348000000;
		
		if($.isArray(urls))
		{
			$.each(urls, function(k,url) { addEntry(url,seconds); } );
		}else
		{
			addEntry(urls,seconds);
		}
		
		// save it
		save('retrievedHistory');
	};
	
	this.markResultAsRetrieved = function(results) {
		var addEntry = function(url, seconds) {
			//url = hex_md5(url);
			if(!data['retrievedHistory'][url])
				data['retrievedHistory'][url] = [];
			
			data['retrievedHistory'][url].push(seconds);
		};
		
		var seconds = Math.round(new Date().getTime()/1000) - 1348000000;
		
		if($.isArray(results))
		{
			$.each(results, function(k, res) { addEntry(res.url,seconds); } );
		}else
		{
			addEntry(results.url,seconds);
		}
		
		// save it
		save('retrievedHistory');
	};
	
	this.wasUrlRetrieved = function(url) {
		//url = hex_md5(url);
		if(!data['retrievedHistory'][url])
		{
			//console.log('url has never been retrieved', url);
			return 0;
		}
		return data['retrievedHistory'][url].length;
	};
	
	// all about the current results
	this.updateCurrentResults = function(results) {
		data['currentSearch']['results'] = results;
		
		// save it
		save('currentSearch');
	};
	
	this.getCurrentResults = function() {
		//console.log(data);
		return data['currentSearch']['results'];
	};
	
	this.getCurrentResultsAsUrl = function() {
		var currentUrls = [];
		if(data['currentSearch']['results'])
		{
			for(var i=0; i<data['currentSearch']['results'].length; i++) {
				currentUrls.push(data['currentSearch']['results'][i].url);
			}
		}
		return currentUrls;
	};
	
	this.updateCurrentSearch = function(indexUrl,query,adapter,results) {
		if(!indexUrl || !query || !results)
		{
			console.log('updateCurrentSearch(): somethign is missing. indexUrl='+(indexUrl==false)+",query="+(query==false)+",results="+(results==false), indexUrl, query, results);
			return false;
		}
		
		data['currentSearch']['indexUrl'] = indexUrl;
		data['currentSearch']['query'] = query;
		data['currentSearch']['adapter'] = adapter; // site code
		data['currentSearch']['results'] = results;

		// save it
		save('currentSearch');
	};
	
	this.setNewLastSelectedPagae = function(currentpage) {
		data['currentSearch']['lastSelectedPage'] = currentpage;

		// save it
		save('currentSearch');
	};
	
	this.getLastSelectedPagae = function() {
		return data['currentSearch']['lastSelectedPage'];
	};
	
	this.getCurrentSearchUrl = function() {
		return data['currentSearch']['indexUrl'];
	};
	
	this.getCurrentSearchQuery = function() {
		return data['currentSearch']['query'];
	};
	
	this.getCurrentSearchAdapterCode = function() {
		return data['currentSearch']['adapter'];
	};
	
	this.getCurrentSearchAdapter = function() {
		return searchAdapters.getAdapterByCode(data['currentSearch']['adapter']);
	};
	
	/** all about the snippets */
	this.getSnippets = function() {
		//console.log('getSnippets',data['currentSnaps']);
		return data['currentSnaps'];
	};
	
	this.saveSnippets = function(snippets) {
		//console.log('saving snippets',snippets);
		var saveMe = {};
		$.each(snippets,function(url,canvas) {
			saveMe[url] = {img: canvas.toDataURL(snippetQuality.format, snippetQuality.quality), //compress file.. we have some space troubles
						width: canvas.width,
						height: canvas.height,
						saved: true};
		});
		 
		data['currentSnaps'] = saveMe;
		
		// save it
		save('currentSnaps');
	};
	
	/** internal methods */
	function save(key) {
		if(key)
			value = data[key];
		else
			value = data;
		
		//console.log("trying to save "+key, value);
		
		chrome.extension.connect().postMessage({
			command: 'save_data',
			'key': key,
			'value': value,
			'specific': storageSpecification[key],
			'tabhash': signatureHash
			});
	};
};
