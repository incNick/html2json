# jQuery Plug-in: Html2Json #

You can translate HTML (if not very complex because recursion depth reason) to JSON now. Of course, you also can translate the JSON to HTML again.

Maybe jQuery already have a similar package, but without making any reference here.

## Why use it? ##
It is mean you can manage the HTML format same as Array management.

## Why create it? ##
We build one complex angularJS Directives and used same complex template, too many ng-if used, so I think may use jQuery build it then `$compile(angular.element(ourElement).contents())($scope);` is better way.

## How to use it ##
```
/* Html to json */
var json = $('body').toJsonTemplate();
/* Json to html */
var html = $.parseJsonTemplate(json);
/* Json to jQuery elements */
var elements = $.parseJsonTemplate(true);
```
## Standard JSON format ##
```
var jsonTemplate = {
	'uniqueKeyOfHtmlElementNode1': {
		'tagName': {
			'attributeName1': 'attributeValue',
			'attributeName2': 'attributeValue'
			//...
		}
	},
	'uniqueKeyOfHtmlElementNode2': {
		'tagName': {
			'attributeName1': 'attributeValue',
			'attributeName2': 'attributeValue'
			//...
		}
	},
	//...
	'_init_': [{ //The element tree, if your tree only has one root node, can define _init_: {}, else then _init_: []
		'ref'	: 'uniqueKeyOfHtmlElementNode1',
		'child'	: [{	//child attribute should be []
			'ref'	: 'uniqueKeyOfHtmlElementNode2',
			'child'	: [{
				'ref'	: '_text_', //_text_ mean it is text node
				'value'	: 'HTML to JSON'
			}]
		}]
	}]
};

console.log($.parseJsonTemplate(jsonTemplate));
/*	The html source should be like (but not formatted)
<tagName attributeName1="attributeValue" attributeName2="attributeValue">
	<tagName attributeName1="attributeValue" attributeName2="attributeValue">
		HTML to JSON
	</tagName>
</tagName>
*/
```
