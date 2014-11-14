/**
 * This class specifies 
 * 1. The URL pattern for a specific search engine
 * 2. How search results should be parsed
 * 3. The site's code for the log.
 * 4. How the used query can be found
 * 
 * 2012 Sep 27 Gene Golovchinsky
 * 2013 May 17 Simon Tretter
 *  */

function SearchAdapters() {
	var initializeAdapters = function() { 
		// TODO: THINK ABOUT HTTP AND HTTPS!!!!
		return [
		        // google
		        new Adapter(/^https?:\/\/www\.google\.\w{1,3}(\/.*)?/, 
		        		{
		        			'title': 'Google Web Search',
		        			'code': 'g', 
		        			'container': '.g',
		        			'resultLink': '.r a',
		        			'category': 'web',
		        			'query': {regex: /(\?|&|#)q=(.*?)(?=&|$|#)/g, parm: 2, loop: true}, // global (g) because we wanna ahve the last occurance of the query parameter in the url..google is weird
		        			'icon': chrome.extension.getURL('icons/favicon_google.ico'),
		        			'searchUrl': 'http://www.google.com/search?q=',
		        			'resultOffset': /(\?|&|#)start=(.*?)(&|$|#)/
		        		}),
	        	// google scholar
		        new Adapter(/^https?:\/\/scholar.google.com\/(\/.*)?/, 
		        		{
		        			'title': 'Google Scholar',
		        			'code': 'gs', 
		        			'container': '#gs_ccl .gs_r',
		        			'resultLink': 'h3.gs_rt > a',
		        			'category': 'research',
		        			'query': {regex: /(\?|&)q=(.*?)(&|$)/, parm: 2, loop: false},
		        			'icon': chrome.extension.getURL('icons/favicon_googles.ico'),
		        			'searchUrl': 'http://scholar.google.com/scholar?q=',
		        			'resultOffset': /(\?|&)start=(.*?)(&|$|#)/
		        		}),
	    		// bing
		        new Adapter(/^https?:\/\/www.bing.com(\/.*)?/, 
		        		{
		        			'title': 'Bing Web Search',
		        			'code': 'b', 
		        			'container': '.sb_results > li', // [, '#wg0 > li'], // if first one fails, the 2nd one is used
		        			'resultLink': '.sb_tlst > h3 > a',
		        			'category': 'web',
		        			'query': {regex: /(\?|&)q=(.*?)(&|$)/, parm: 2, loop: false},
		        			'icon': chrome.extension.getURL('icons/favicon_bing.ico'),
		        			'searchUrl': 'http://www.bing.com/search?q=',
		        			'resultOffset': /(\?|&)first=(.*?)(&|$|#)/
		        		}),
	    		// yahoo
		        new Adapter(/^https?:\/\/search.yahoo.com\/search(.*)/, 
		        		{
		        			'title': 'Yahoo Web Search',
		        			'code': 'y', 
		        			'container': 'div#web ol li',
		        			'resultLink': 'h3 a.yschttl',
		        			'uriGenerator': /[^\*]+\*\*(.*)/,
		        			'category': 'web',
		        			'query': {regex: /(\?|&)p=(.*?)(&|$)/, parm: 2, loop: false},
		        			'icon': chrome.extension.getURL('icons/favicon_yahoo.ico'),
		        			'searchUrl': 'http://search.yahoo.com/search?p=',
		        			'resultOffset': /(\?|&)b=(.*?)(&|$|#)/
		        		}),
	    		// microsoft academic research
		        new Adapter(/^https?:\/\/academic.research.microsoft.com\/Search(.*)/, 
		        		{
		        			'title': 'Microsoft Academic Research',
		        			'code': 'm', 
		        			'container': '.section-wrapper ul li',
		        			'resultLink': '.title-download h3 > a',
		        			'category': 'research',
		        			'query': {regex: /(\?|&)query=(.*?)(&|$)/, parm: 2, loop: false},
		        			'icon': chrome.extension.getURL('icons/favicon_microsoft.ico'),
		        			'searchUrl': 'http://academic.research.microsoft.com/Search?query=',
		        			'resultOffset': /(\?|&)start=(.*?)(&|$|#)/
		        		})
	     ];
	};
	var adapters = initializeAdapters();

	this.getAllAdaptersForCategory = function(category) {
		var result = [];
		$.each(adapters, function(k,v) {
			if(v.getOptions().category == category)
				result.push(v);
		});
		
		return result;
	};
	
	this.getAdapterByCode = function(code) {
		for (var i=0; i<adapters.length; i++) {
   			if(adapters[i].getOptions().code == code) {
    			return adapters[i];
    		}
    	}
		return null;
	};
	
	this.match = function(url) {
		var adapterResult = {
				site: false, // the search engine 
				results: [], // results - dataset
				domLinks: [], // resulst in the dom (original page)
				query: false, // the used query
				resultPageOffset: 0 
		};
		
		for (var i=0; i<adapters.length; i++) {
    		if (adapters[i].matches(url)) {
    			adapterResult = adapters[i].parse();
    			break;
    		};
    	}
		
		return adapterResult;
	};
	
}

function Adapter(urlPattern, paramOptions) {
	var options = {
		code: false,
		container: false, 
		resultLink: false, 
		category: false,
		uriGenerator: null,
		query: false
	};
	
	$.extend(options, paramOptions);
	this.urlPattern = urlPattern;
	
	if(options.resultLink == false) {
		console.log('we cannot initialize this adapater, no pattern for resultLink provided');
		return false;
	}
	
	uriGenerator = createUriGenerator(options.uriGenerator);
	
	this.getOptions = function() {
		return options;
	};
	
	// returns true if the URL matches to this adapter
	this.matches = function(url) {
		return url && this.urlPattern.test(url);
	};
	
	// parses the search result
	this.parse = function() {
		//console.log('parsing search result for matching tags...');
		
		var results = [];
		var domLinks = {};
		// set up a fake 'a' tag to parse the domain name out of a URL
		var urlfetcher = document.createElement('a');
	
		var addTarget = function(container) {
			$.each($(container).find(options.resultLink), function(k,v) {
				//console.log('resultLink', this);
				
				var url = uriGenerator(makeAbsolute($(this).attr('href')));
				var title = $(this).text() || $(this).attr('title');
				urlfetcher.href = url;
				
				results.push({
							url: url, 
							title: title,
							icon: urlfetcher.protocol + "//" + urlfetcher.host + "/favicon.ico"
						});
				
				domLinks[url] = {
							'container': $(container), // if no container is given, this contains the document.. beware!
							'link': this
						};
			});
		};
		
		// walk through all containers (only if we have a container)
		if(options.container) {
			//console.log('looking for containers', options.container);
			$.each($(options.container), function(k,elem) {
				//console.log('container',this);
				addTarget(this);
			});
		}
		else
		{
			addTarget(document);
		}
		
		//populate (new) results
		//console.log('results after parsing search page',results);
		
		query = location.href;
		if(options.query)
		{
			var resTmp,res=null;
			
			if(options.query.loop) {
				var i=0;
				while ((resTmp = options.query.regex.exec(location.href)) && i<20)
				{
					res=resTmp;
					i++;
				};
			}
			else
			{
				res = options.query.regex.exec(location.href);
			}
			
			if(res)
			{
				query = decodeURIComponent(res[options.query.parm].replace(/\+/g,' ')); // decodeURIComponent();
			}
		}
		
		var resultPageOffset = 0;
		if(options.resultOffset)
		{
			res = options.resultOffset.exec(location.href);
			
			if(res)
			{
				resultPageOffset = decodeURIComponent(res[2].replace(/\+/g,' ')); // decodeURIComponent();
			}
		}
		
		return {
			'site': options.code,
			'results': results,
			'domLinks': domLinks,
			'query': query,
			'resultPageOffset': resultPageOffset
			};
	};
	
	function createUriGenerator(uriGen) {
		if (uriGen == null)
			return function(url) { return url; };
		else if (uriGen instanceof RegExp) {
			return function(url) {
				if (uriGen.test(url))
					url = unescape(uriGen.exec(url)[1]);
				return url;
			};
		}
		else if (uriGen instanceof Function)
			return uriGen;
		else
			throw new Exception("Unrecognnized generator " + uriGen + " for " + this.urlPattern);
	}
}