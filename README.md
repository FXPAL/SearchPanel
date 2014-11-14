SearchPanel
===========

The SearchPanel browser extension helps people manage their web search activity.  It provides an unobtrusive interactive representation of the retrieved documents that can be used for sense-making, for navigation, and for re-finding documents. When you run a search, shows which pages you found before, which ones you viewed, and which are new to you.

SearchPanel comes in two versions, as a Chrome or Firefox browser extension. Both implementations are in JavaScript.

SearchPanel parses search results pages (SERPs) of Google, Yahoo and Bing. Since implementation of SERPs changes overtime, SearchPanel may not be able to parse correctly the search results.

Feel free to fork and improve this project according to its license.

System requirements

SearchPanel requires:

1.	JQuery 2.0.0 or higher (http://jquery.com/)
2.	JQuery UI 1.10 or higher (http://jqueryui.com/)
3.	MD5 2.2 or higher (http://pajhome.org.uk/crypt/md5)
4.	Html2canvas 0.4.0 or higher (http://html2canvas.hertzen.com)
5.	Pure CSS speech bubbles (http://nicolasgallagher.com/pure-css-speech-bubbles/)

Getting SearchPanel

Source code is available on github.

Build instruction
Standard procedure for creating Chrome and Firefox extensions.


Known Issues:

At last try, SearchPanel did not do well on Bing search result pages. 

All features may not be implemented in the Firefox version.


Frequently asked questions:

Q: Why does SearchPanel ask for history and bookmark permissions on installation?
History permissions are required to reflect your interaction with web pages in SearchPanel. Bookmark permissions are required for an experimental version. You can edit and manage bookmarks as before.

Q: The extension did not install; Chrome reported error “Download was not a CRX”
This is a known issue with the Chrome browser. As documented here, there are some workarounds to this problem:
1.	If you have an account with Google, try installing the extension while logged in.
2.	Try loading it while in incognito mode:  Go into Incognito Mode with Ctrl-Shift-N, load the page of the extension in that mode and then click on install.
3.	Other possibilities are documented in the ghacks article.
Q: The widget is not displayed correctly or looks unfinished!
A: A bug in the Chrome browser is responsible for this. A simple reload
of the page or a hiding & showing of the widget through the widget
control button on the top right of the browser should fix it.

Q: What kind of data is stored by the extension and where is this
information saved?
A: The widget keeps track of your search queries and results. Even
though information is stored locally on your computer,
queries and URLs are saved in a hashed way to ensure your privacy. Bookmarks are
saved in the browser itself, and  the local browser history is queried to determine if a page has been visited
before.

Q: Does SearchPanel log information on a server?
A: Although all data that SearchPanel needs is stored in your browser, SearchPanel does create a log on a server. This log is used to analyze SearchPanel performance and to understand people’s web searching behavior. This logging is done for research purposes only, and does not reveal any personally-identifying information. Queries and retrieved pages are transformed via an MD5 hash to random character strings prior to being logged. Thus we can tell whether two queries retrieved the same web page, but we cannot know what those queries or web pages are. You can see what information is sent to the log by opening the browser debugging console. It is possible to opt out of logging and still use the plugin.

Q: How do I open the browser console to see what is logged?
A: Either by pressing F12 or by clicking on the settings button on the
top right edge of the browser, selecting Tools and then “Developer tools”.
After that a click on the
“Console” tab shows you the console with the logs in it.

Q: How do I opt out of logging?
A: You can opt out of logging either temporarily or permanently.
To disable the extension temporarily, click on its icon near the URL bar (three bars). A red circle with a line through it ( ) will appear on top of the icon, indicating that the extension is temporarily disabled. Click on the icon again to re-enable it.
To turn logging off completely, use the options menu.

Q: If I look into the console, sometimes there are 404 (Not found)
errors or warnings about insecure access of a favicon.
A: This is because the widget tries to fetch all needed icons for a
website. If there is no favicon available, the error is logged to the
console but can be ignored. The insecure connection warning is also part
of this process, and can also be ignored.

Q: How can I uninstall the extension?
A: Open the extension page (Settings menu -> Tools -> Extensions), click
the little trash icon next to the Query Preview entry.

