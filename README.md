A chrome extension to filter out specific files in a pull request by specifying them in your pull request description.


* You must have hgfilter and then an unordered list of regular expressions immediately following. (look at examples)
* Filters are all specified via JavaScript Regular Expressions.


Filter out all PHP files:

    hgfilter
    - .*\.php
    

Filter out all libraries

    hgfilter
    - lib/support/.*
    

Filter PHP files, a specific JS file and a library path

    hgfilter
    - .*\.php
    - lib/support/.*
    - lib/myfile.js

After specifiying a filter and creating a pull request. You must go to the files tab in your pull request and then hit the filter icon for the extension which is to the right of URL.
