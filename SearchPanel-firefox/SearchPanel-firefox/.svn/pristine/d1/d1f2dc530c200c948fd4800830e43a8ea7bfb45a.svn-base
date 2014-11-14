var points = {};

// reset basic vars
var UUID=false;
var versionType=false;
var logging=true;

var searchHistory = new SearchHistory();


addMessageListener(
  function(request) {      
	if(!request.command)
	{
		  console.log('invalid command',request);
		  return;
	}
  	
	console.log('new message: '+request.command,request);

	switch(request.command)
	{
		case 'initVars':
			versionType = request.versionType;
			UUID = request.UUID;
            logging = request.logging;
            console.log('logging', logging);
			init(); 
			break;
		case 'data':
			searchHistory.setData(request.key,request.value, true);
			break;
	}
});

postMessage({
    'command': 'load_vars'
});

points['complex'] = {1: "52px", 
		2: "76px",
		3: "100px", 
		4: "124px", 
		5: "172px", 
		6: "219px",
		7: "244px"};

points['simple'] = {1: "52px", 
		2: "76px",
		3: "124px",
		4: "219px"};
var current=1;

function next() {
	$('#desc-'+versionType+"-"+current).addClass('small');
	$('#desc-'+versionType+"-"+current).removeClass('current');
	current++;
	$('#desc-'+versionType+"-"+current).hide();
	$('#desc-'+versionType+"-"+current).removeClass('hide');
	$('#desc-'+versionType+"-"+current).addClass('current');
	
	$('#desc-'+versionType+"-"+current).show("clip", {direction: "vertical"}, 600);
	
	if(current <= Object.keys(points[versionType]).length + 1) {
		$('.highlighter').stop(true,true);
			
		$('.highlighter').css('top', points[versionType][current]);
		$('.highlighter').effect('highlight', {duration: 1500});
		
		if(current == Object.keys(points[versionType]).length + 1)
		{
			$('.nav').hide();
			$('.highlighter').hide();
		}
	}
}

var init = function() {
    if(window.location.href.indexOf('reset')!=-1)
    {
          searchHistory.deleteHistory();
    	$('#cleared').show();
    }
    
    console.log('versionType',versionType);
    if(versionType != "simple"){
    	$('#simple').hide();
    	$('#complex').show();
    }
    else
    {
    	$('#simple').show();
    	$('#complex').hide();
    }
    
    if(searchHistory.getData('retrievedHistory')) {
    		$('#historyItems').text(Object.keys(searchHistory.getData('retrievedHistory')).length);
    }
    
    var manifest = getManifest();
    $('#version').text(manifest.version);
    
    if(window.location.href.indexOf('first')==-1)
    {
    	$('#firststart').hide();
    }
    
    
    if(window.location.href.indexOf('nologging')!==-1)
    {
    	console.log(logging);
        
        if(logging)
    	{
    		logging = false
    		$('#loggin_deactivated').show();
    		//alert('Logging deactivated!');
    	}
    	else
    	{
    		$('#loggin_activated').show();
    		logging = true;
    		//alert('Logging ACTIVATED!');
    	}
        
        postMessage({
          'command': 'setLogging',
          'value': logging
        });
    }
    
    
    if(!logging)
	{
		$("#logtext").text("If you want to support us, you can activate logging by clicking");
	}
    
    
    $('.description').click(function() {
    	
    	if($(this).hasClass('current')) next();
    	else {
    		$('.highlighter').stop(true,true);
    		ber = $(this)[0].id.split('-');
    		console.log(ber);
    		if(ber[2]<Object.keys(points[versionType]).length + 1)
    		{
    			$('.highlighter').css('top', points[versionType][ber[2]]);
    			$('.highlighter').effect('highlight', {duration: 1500});
    		}
    		$(this).toggleClass('small');  
    	}
    	});
    
    
    $('.button').click(next);
}