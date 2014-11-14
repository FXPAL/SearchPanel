var mySelf = self;

function getManifest()
{
    var manifest = {'version': '0.81ff-partialbookmarksupport'};
    return manifest;
    //return chrome.runtime.getManifest();
}

function addMessageListener(f)
{
    //self.worker.on('message', function(a) f(a));
    mySelf.on('message' , f);
    //chrome.extension.onMessage.addListener(f);
}

function postMessage(msg)
{
    console.log('send message',msg.command); 
    //self.port.emit('message',msg);
    try {
        mySelf.postMessage(msg);
    }
    catch(e)
    { 
        console.log('unable to send message'); 
        console.log(msg);
    }
    //chrome.extension.connect().postMessage(msg);
}

function getURL(url)
{
    if(typeof data != 'undefined')
        return data.url(url);
    else if(self.options.dataURL)
        return self.options.dataURL + url;
    else
        url;
    //return chrome.extension.getURL(url);
}


console.log('wrapper done');