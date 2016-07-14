# jQuery Plug-in: Html2Json #

You can translate HTML (if not very complex because recursion depth reason) to JSON now. Of course, you also can translate the JSON to HTML again.

Maybe jQuery already have a similar package, but without making any reference here.

## Why use it? ##
It is mean you can manage the HTML format same as Array management.

## Why create it? ##
We build one complex angularJS Directives and used same complex template, too many ng-if used, so I think may use jQuery build it then `$compile(angular.element(ourElement).contents())($scope);` is better way.

## Standard JSON format ##
```
var jsonTemplate = {
    'uniqueKeyOfHtmlElementNode1': { //Don't name it is number, unique
        'tagName': { //Html tag name
            'attributeName1': 'attributeValue', //Attribute value always quote by Double quotes
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
        '_ref_'     : 'uniqueKeyOfHtmlElementNode1',
        '_child_'   : [{    //_child_ attribute should be []
            '_ref_'     : 'uniqueKeyOfHtmlElementNode2',
            '_child_'   : [{
                '_ref_'     : '_text_', //_text_ mean it is text node
                '_value_'   : 'HTML to JSON'
            }]
        }]
    }]
};
```

## How to use it ##
```
/* Json to Html */
var html = $.html2json.parseJsonTemplate(jsonTemplate);
/*	The html source should be like (but not formatted)
<tagName attributeName1="attributeValue" attributeName2="attributeValue">
	<tagName attributeName1="attributeValue" attributeName2="attributeValue">
		HTML to JSON
	</tagName>
</tagName>
*/

/* Update json template
var newJsonTemplateSection = {
    'strong': {
        'h1': {
            'style': 'color: #00f'
        }
    },
    '_init_': [{
        '_ref_'     : 'strong',
        '_child_'   : [{
            '_ref_'     : '_text_', //_text_ mean it is text node
            '_value_'   : 'Hello World!'
        }]
    }]
};
$.html2json.updateJsonTemplate(
    jsonTemplate, newJsonTemplateSection, 
    'uniqueKeyOfHtmlElementNode1/uniqueKeyOfHtmlElementNode2');

/* Json to jQuery HTML elements */
var elements = $.html2json.parseJsonTemplate(jsonTemplate, true);
/*	The html source should be like (but not formatted)
<tagName attributeName1="attributeValue" attributeName2="attributeValue">
	<tagName attributeName1="attributeValue" attributeName2="attributeValue">
		<h1>
			Hello World!
		</h1>
	</tagName>
</tagName>
*/

/* HTML string to JSON */
var jsonObject1 = $.html2json.toJsonTemplate(html);

/* Elements to JSON */
var jsonObject2 = $.html2json.toJsonTemplate(elements);

console.log(html);
console.log(jsonTemplate);
console.log(elements);
console.log(jsonObject1);
console.log(jsonObject2);
```
