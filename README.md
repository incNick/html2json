# jQuery Plug-in: Html2Json #

You can translate HTML (if not very complex because recursion depth reason) to JSON now. Of course, you also can translate the JSON to HTML again.

Maybe jQuery already have a similar package, but without making any reference here.

## Why use it? ##
It is mean you can manage the HTML format same as Array management.

## Why create it? ##
We build one complex angularJS Directives and used same complex template, too many ng-if used, so I think may use jQuery build it then `$compile(angular.element(ourElement).contents())($scope);` is better way.

## How to use it ##
```

var jsonTemplate = {
    'title': { //Don't name it is number, unique key
        'h1': { //Html tag name
            'style'     : 'color: green', //Attribute value always quote by Double quotes
            '_text_'    : 'HTML 2 JSON' //Default innerText
        }
    },
    'content': {
        'div': {
            '_html_': '<strong>Default content</strong>', //Default innerHTML
        }
    },
    'foot-hr': {
        'hr': {
            'style': 'border-color: green'
        },
    }, 
    'foot-p': {
        'p': {}
    },
    '_init_': [{ //The element tree
        '_ref_': 'title'
    },{
        '_ref_'     : 'content',
        '_html_'    : '<strong>Author:</strong><span style="margin-left: 2em;">Nick</span><p>Version 2.0</p>', //override attribute
        '_child_'   : [{
            '_ref_' : 'foot-hr'
        }, {
            '_ref_'     : 'foot-p',
            'style' : 'color: white; background: black',
            '_child_'   : [{
                '_ref_'     : '_text_',
                '_value_'   : 'Version 2.0'
            }, {
                '_ref_'     : '_html_',
                '_value_'   : '<span style="margin-left: 2em;">MIT LICENSE</span>'
            }]
        }]
    }]
};

/* Json to Html */
var html = $.html2json.parseJsonTemplate(jsonTemplate);
$('body').append(html);

/* HTML string to JSON */
console.log($.html2json.toJsonTemplate(html));

/* Update json template */
var newJsonTemplateSection = {
    'title': { //Don't name it is number, unique key
        'h1': { //Html tag name
            'style'     : 'color: blue', //Attribute value always quote by Double quotes
            '_text_'    : 'JSON 2 HTML'
        }
    },
    'foot-hr': {
        'hr': {
            'style': 'border-color: blue'
        },
    },
    'notice': {
        'p': {
            'style'     : 'color: #00f',
            '_text_'    : '2016.07.15'
        }
    },
    '_init_': [{
        '_ref_'     : 'notice'
    }, {
      '_ref_'       : 'foot-hr',
      'style'       : 'border-color: red;'
    }]
};
$.html2json.updateJsonTemplate( jsonTemplate, newJsonTemplateSection, 'content/foot-p', 'after');

/* Json to jQuery HTML elements */
var elements = $.html2json.parseJsonTemplate(jsonTemplate, true);
$('body').append(elements);

/* Elements to JSON */
var jsonObject2 = $.html2json.toJsonTemplate(elements);
console.log(jsonObject2);
```

----------

**Update log**
V 0.1: 

>1. Use $.parseJsonTemplate get HTML and use $.fn.toJsonTemplate get JSON

V 1.0: 
>1. Package function to html2json.
>2. Use $.html2json.parseJsonTemplate and $.html2json.toJsonTemplate instead original.
>3. Add updateJsonTemp feature.

V 2.0:
>1. Add key word _html_ support.
>2. Add attribute _juid_ at final html, so if translate the html to json again, the unique key same as original. In fact, it is mean you can write source by HTML format and set _juid_ there instead write too complex JSON.
>3. Update core logic, support the defined element multiple use in _init_ section.
	