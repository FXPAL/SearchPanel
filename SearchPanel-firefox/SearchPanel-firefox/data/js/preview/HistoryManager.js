/**
 * This class is responsible for checking the browser history 
 * 
 * 2013 May 22 Simon Tretter
 */


function HistoryManager() {
	var callbackStorage = {};
	
	// checks if a given URL is in the browser history
	this.checkEntry = function(url,foundCallback, notfoundCallback) {		
		var callback = function(results) {
			   if(results && results.length > 0)
			   {
				   if(foundCallback) foundCallback(url,results);
					return;
			   }
			   
			   // if we reach this point the entry wasn't found
			   if(notfoundCallback) notfoundCallback(url);
			};

		// workaround: we save the reference in a local variable, and resume this after we got a response
		callbackStorage[url] = callback;
		
		postMessage({
			'command': 'search_visithistory',
			'url': url
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
}
