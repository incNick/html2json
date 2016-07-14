(function($) {
	/**
	 * Parse json template to html source
	 * @param Object	jsonTemplate
	 * @param Boolean	If true then return jQuery Html Elements, else return HTML string
	 * @return jQueryHtmlElements|string
	 */
	$.extend({
		parseJsonTemplate: function (jsonTemplate, jQueryObject) {
			var format = jsonTemplate._init_;
			delete jsonTemplate._init_;
			for (var key in jsonTemplate) {
				jsonTemplate[key] = optionsToHtml(jsonTemplate[key]);
			}
			var element = $('<div></div>');
			jQueryElement(format, jsonTemplate, element);
			if (jQueryObject) return element.children();
			return element.html();
			
			/**
			 * Group element
			 * @param Array|Object node
			 * @param Array|Object jsonTemplate referece: jsonTemplate._init_
			 * @param jQueryObject parentNode
			 * @return void
			 */
			function jQueryElement(node, jsonTemplate, parentNode) {
				if ($.isArray(node)) {
					for (var i = 0, l = node.length; i < l; i ++) {
						jQueryElement(node[i], jsonTemplate, parentNode);
					}
				} else {
					if (node.ref === '_text_') {
						var element = document.createTextNode(node.value);
					} else {
						var element = $(jsonTemplate[node.ref]);
						if (node.child)	{
							jQueryElement(node.child, jsonTemplate, element);
						}
					}
					parentNode.append(element);
				}
			}

			/**
			 * Translate json node to html source
			 * @param Array|Object jsonTemplate
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
		}
	});
	$.fn.extend({
		/**
		 * Translate current elements to JSON
		 * @return Object
		 */
		toJsonTemplate: function () {
			var totalTags = {};
			var jsonTemplate = {};
			var elements = $(this);
			var format = parseJQueryElement(elements.toArray(), totalTags, jsonTemplate);
			jsonTemplate._init_ = format;
			return jsonTemplate;

			/**
			 * Parse jQuery object
			 * @param jQueryElements elements
			 * @param Object totalTags use for build unique node key
			 * @param Object jsonTemplate
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
						format = {ref: '_text_', value: element[0].nodeValue};
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
						format.ref = key;
						var childs = element.contents().toArray();
						if (childs.length) {
							format.child = parseJQueryElement(childs, totalTags, jsonTemplate);
						}
					}
				}
				return format;
			}
		}
	});
})(jQuery);