/**
 * ****************************************************************************
 * 
 *    /\_/\             HTML to JSON 
 *  ( ^ v ^ )_______    Author: Nick, Tian Jin, China 
 * (~) Version: 1.0 ()  License: MIT
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
                    eval('source._init_' + target + '.splice(' + (latest - 1) + ', 0, format)');
                    break;
                case 'after':
                    eval('source._init_' + target + '.splice(' + latest + ', 0, format)');
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
            for (var key in template) {
                template[key] = optionsToHtml(template[key]);
            }
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
                        var element = document.createTextNode(node._value_);
                    } else {
                        var element = $(jsonTemplate[node._ref_]);
                        if (node._child_)    {
                            jQueryElement(node._child_, jsonTemplate, element);
                        }
                    }
                    parentNode.append(element);
                }
            }

            /**
             * Translate json node to html source
             * 
             * @param Array|Object      jsonTemplate
             * @return string
             */
            function optionsToHtml(jsonTemplate) {
                var html = '';
                if ($.isArray(jsonTemplate)) {
                    for (var i = 0, l = jsonTemplate.length; i < l; i ++) {
                        html += optionsToHtml(jsonTemplate[i]);
                    }
                } else {
                    for (var tag in jsonTemplate) {
                        var text = false;
                        var attributes = [];
                        for (var attribute in jsonTemplate[tag]) {
                            if (attribute === '_text_') {
                                text = jsonTemplate[tag][attribute];
                                continue;
                            }
                            if (jsonTemplate[tag][attribute] === false) continue;
                            if (jsonTemplate[tag][attribute] === true) {
                                attributes.push(attribute + '="' + attribute + '"');
                            } else {
                                attributes.push(attribute + '="' + jsonTemplate[tag][attribute] + '"');
                            }
                        }
                        attributes = attributes.join(' ');
                        if (attributes.length > 0)  attributes = ' ' + attributes;
                        html = '<' + tag + attributes;
                        if ($.inArray(tag, ['input', 'img', 'br', 'hr', 'area']) > -1) {
                            html += ' />';
                        } else {
                            html += '>';
                            if (text !== false) html += text;
                            html += '</' + tag + '>';
                        }
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
                    var format = {};
                    var element = $(elements);
                    if (element[0].nodeName === '#text') {
                        format = {_ref_: '_text_', _value_: element[0].nodeValue};
                    } else {
                        var tagName = element[0].tagName.toLowerCase();
                        if (! totalTags[tagName]) totalTags[tagName] = 0;
                        totalTags[tagName] ++;
                        var key = tagName + totalTags[tagName].toString();
                        var attributes = element[0].attributes;
                        jsonTemplate[key] = {};
                        jsonTemplate[key][tagName] = {};
                        for (var i = 0, l = attributes.length; i < l; i ++) {
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