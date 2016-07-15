/**
 * ****************************************************************************
 * 
 *    /\_/\             HTML to JSON 
 *  ( ^ v ^ )_______    Author: Nick, Tian Jin, China 
 * (~) Version: 2.0 ()  License: MIT
 * 
 * ****************************************************************************
 * 2016.07.14           https://github.com/incNick/html2json 
 * ****************************************************************************
 */
(function($) {
    var html2json = {
        /**
         * Update html group settings
         * 
         * @param Object        source      The json html template
         * @param Array|Object  jsonSection
         * @param Array|string  path        Not required, Example: 'uniqueKey'
         * @param string        action      if null then update
         * @return void
         */
        updateJsonTemplate: function (source, jsonSection, path, action) {
            var actions = ['update', 'prepend', 'append', 'after', 'before', 'remove'], format = _format = false, target = latest = '';
            if (! action || ! $.inArray(action.toLowerCase(), actions)) action = 'update';
            action = action.toLowerCase();
            if (path && (jsonSection._init_ && $.isArray(jsonSection._init_) && jsonSection._init_.length || action === 'remove')) {
                format = jsonSection._init_ || {};
                delete jsonSection._init_;
            }
            $.extend(source, jsonSection);
            if (! format) return;
            
            if (! $.isArray(path)) path = path.split('/');
            _format = source._init_;
            for (var i = 0, l = path.length; i < l; i++) {
                if (latest !== '') target += '[' + latest + ']._child_';
                var key = path[i];
                if (isNaN(key)) {
                    for (var n = 0, x = _format.length; n < x; n ++) {
                        if (_format[n]._ref_ === key) {
                            latest = n;
                            break;
                        }
                    }
                } else {
                    latest = key;
                }
                _format = _format[latest]._child_;
            }
            switch(action) {
                case 'update':
                    eval('source._init_' + target + '[' + latest + ']._child_ = format');
                    break;
                case 'prepend':
                    eval('source._init_' + target + '[' + latest + ']._child_.unshift(format)');
                    break;
                case 'append':
                    eval('source._init_' + target + '[' + latest + ']._child_.push(format)');
                    break;
                case 'before':
                    eval('source._init_' + target + '.splice(' + latest + ', 0, format)');
                    break;
                case 'after':
                    eval('source._init_' + target + '.splice(' + (latest + 1) + ', 0, format)');
                    break;
                case 'remove':
                    eval('source._init_' + target + '.splice(' + latest + ', 1)');
                    break;
            }
        },
        /**
         * Parse json template to html source
         * 
         * @param Object    jsonTemplate
         * @param Boolean   returnObject    If true then return jQuery Html Elements, else return HTML string
         * @return jQueryHtmlElements|string
         */
        parseJsonTemplate: function (jsonTemplate, returnObject) {
            var template = $.extend(true, {}, jsonTemplate);
            var format = template._init_, element = $('<div></div>');
            delete template._init_;
            jQueryElement(format, template, element);
            if (returnObject) return element.children();
            return element.html();
            
            /**
             * Group element
             * 
             * @param Array|Object      node
             * @param Array|Object      jsonTemplate referece: jsonTemplate._init_
             * @param jQueryObject      parentNode
             * @return void
             */
            function jQueryElement(node, jsonTemplate, parentNode) {
                if ($.isArray(node)) {
                    for (var i = 0, l = node.length; i < l; i ++) {
                        jQueryElement(node[i], jsonTemplate, parentNode);
                    }
                } else {
                    if (node._ref_ === '_text_') {
                        element = formatText(node._value_);
                    } else if (node._ref === '_html_') {
                        element = $(node._value_);
                    } else {
                        var element = $(optionsToHtml(node._ref_, jsonTemplate[node._ref_], node));
                        if (node._child_)    {
                            jQueryElement(node._child_, jsonTemplate, element);
                        }
                    }
                    parentNode.append(element);
                }
            }
            
            /**
             * Format text
             * @param string str
             * @return string
             */
            function formatText(str) {
                var div = document.createElement("div");
                div.innerHTML = str;
                return div.innerText;
            }

            /**
             * Translate json node to html source
             * 
             * @param Array|Object      jsonTemplate
             * @return string
             */
            function optionsToHtml(tagKey, jsonTemplate, settings) {
                var html = '';
                for (var tag in jsonTemplate) {
                    var innerContent = '';
                    var attributes = ['_juid_="' + tagKey + '"'];
                    var options = {};
                    $.extend(options, jsonTemplate[tag], settings);
                    for (var attribute in options) {
                        if (attribute === '_text_') {
                            innerContent += formatText(options[attribute]);
                            continue;
                        }
                        if (attribute === '_html_') {
                            innerContent += options[attribute];
                            continue;
                        }
                        if ((/^_.+_$/).test(attribute)) continue;
                        if (options[attribute] === false) continue;
                        if (options[attribute] === true) {
                            attributes.push(attribute + '="' + attribute + '"');
                        } else {
                            attributes.push(attribute + '="' + options[attribute] + '"');
                        }
                    }
                    attributes = attributes.join(' ');
                    if (attributes.length > 0)  attributes = ' ' + attributes;
                    html = '<' + tag + attributes;
                    if ($.inArray(tag, ['input', 'img', 'br', 'hr', 'area']) > -1) {
                        html += ' />';
                    } else {
                        html += '>';
                        if (innerContent !== '') html += innerContent;
                        html += '</' + tag + '>';
                    }
                }
                return html;
            }
        },
        /**
         * Translate current elements to JSON
         * 
         * @param Array     elements    Html element(s)
         * @return Object
         */
        toJsonTemplate: function (elements) {
            var totalTags = {}, jsonTemplate = {}, elements = $(elements);
            var format = parseJQueryElement(elements.toArray(), totalTags, jsonTemplate);
            jsonTemplate._init_ = format;
            return jsonTemplate;

            /**
             * Parse jQuery object
             * 
             * @param jQueryElements    elements
             * @param Object            totalTags       Use for build unique node key
             * @param Object            jsonTemplate
             * @return Array|Object
             */
            function parseJQueryElement(elements, totalTags, jsonTemplate) {
                if ($.isArray(elements)) {
                    var format = [];
                    for (var i = 0, l = elements.length; i < l; i ++) {
                        format.push(parseJQueryElement(elements[i], totalTags, jsonTemplate));
                    }
                } else {
                    var format = {}, element = $(elements), key = false;
                    if (element[0].nodeName === '#text') {
                        format = {_ref_: '_text_', _value_: element[0].nodeValue};
                    } else {
                        var tagName = element[0].tagName.toLowerCase();
                        if (element.attr('_juid_')) {
                            key = element.attr('_juid_');
                        } else {
                            if (! totalTags[tagName]) totalTags[tagName] = 0;
                            totalTags[tagName] ++;
                            key = tagName + totalTags[tagName].toString();
                        }
                        var attributes = element[0].attributes;
                        jsonTemplate[key] = {};
                        jsonTemplate[key][tagName] = {};
                        for (var i = 0, l = attributes.length; i < l; i ++) {
                            if (attributes[i].nodeName == '_juid_') continue;
                            jsonTemplate[key][tagName][attributes[i].nodeName] = attributes[i].nodeValue;
                        }
                        format._ref_ = key;
                        var childs = element.contents().toArray();
                        if (childs.length) {
                            format._child_ = parseJQueryElement(childs, totalTags, jsonTemplate);
                        }
                    }
                }
                return format;
            }
        }
    };
    $.extend({
        html2json: html2json
    });
})(jQuery);
