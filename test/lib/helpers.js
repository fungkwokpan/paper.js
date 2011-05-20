// Override equals to convert functions to message and execute them as tests()
function equals(actual, expected, message) {
	if (typeof actual === 'function') {
		if (!message) {
			message = actual.toString().match(
				/^\s*function[^\{]*\{([\s\S]*)\}\s*$/)[1]
					.replace(/    /g, '')
					.replace(/^\s+|\s+$/g, '');
			if (/^return /.test(message)) {
				message = message
					.replace(/^return /, '')
					.replace(/;$/, '');
			}
		}
		actual = actual();
	}
	// Let's be strict
	return strictEqual(actual, expected, message);
}

function test(testName, expected) {
	return QUnit.test(testName, function() {
		var project = new Project();
		expected();
		project.remove();
	});
}

function compareNumbers(number1, number2, message) {
	if (number1 !== 0)
		number1 = Math.round(number1 * 100) / 100;
	if (number2 !== 0)
		number2 = Math.round(number2 * 100) / 100;
	equals(number1, number2, message);
}

function comparePoints(point1, point2, message) {
	compareNumbers(point1.x, point2.x,
			(message || '') + ' x');
	compareNumbers(point1.y, point2.y,
			(message || '') + ' y');
}

function compareRectangles(rect1, rect2, message) {
	compareNumbers(rect1.x, rect2.x,
			(message || '') + ' x');
	compareNumbers(rect1.y, rect2.y,
			(message || '') + ' y');
	compareNumbers(rect1.width, rect2.width,
			(message || '') + ' width');
	compareNumbers(rect1.height, rect2.height,
			(message || '') + ' height');
}

function compareRGBColors(color1, color2, message) {
	color1 = new RGBColor(color1);
	color2 = new RGBColor(color2);
	
	compareNumbers(color1.red, color2.red,
			(message || '') + ' red');
	compareNumbers(color1.green, color2.green,
			(message || '') + ' green');
	compareNumbers(color1.blue, color2.blue,
			(message || '') + ' blue');
	compareNumbers(color1.alpha, color2.alpha,
			(message || '') + ' alpha');
}

function compareHSBColors(color1, color2, message) {
	color1 = new HSBColor(color1);
	color2 = new HSBColor(color2);
	
	compareNumbers(color1.hue, color2.hue,
			(message || '') + ' hue');
	compareNumbers(color1.saturation, color2.saturation,
			(message || '') + ' saturation');
	compareNumbers(color1.brightness, color2.brightness,
			(message || '') + ' brightness');
	compareNumbers(color1.alpha, color2.alpha,
			(message || '') + ' alpha');
}

function compareGrayColors(color1, color2, message) {
	color1 = new GrayColor(color1);
	color2 = new GrayColor(color2);
	
	compareNumbers(color1.gray, color2.gray,
			(message || '') + ' gray');
}

function cloneAndCompare(item) {
	var copy = item.clone();
	compareItems(item, copy);
	// Remove the cloned item to restore the document:
	copy.remove();
}

function compareItems(item, item2) {
	equals(function() {
		return item != item2;
	}, true);

	var itemProperties = ['opacity', 'locked', 'visible', 'blendMode', 'name',
	 		'closed', 'selected'];
	Base.each(itemProperties, function(key) {
		equals(function() {
			return item[key] == item2[key];
		}, true, 'item[\'' + key + '\'] == item2[\'' + key + '\']');
	});

	equals(function() {
		return item.id != item2.id;
	}, true);
	
	if (item._matrix) {
		equals(function() {
			return item._matrix != item2._matrix;
		});
		equals(item._matrix.toString(), item2._matrix.toString(),
				'item._matrix.toString() == item2._matrix.toString()');
	}

	if (item2.segments) {
		equals(item.segments.toString(), item2.segments.toString(),
				'item.segments.toString() == item2.segments.toString()');
	}

	// Path specific
	if (item instanceof PathItem) {
		equals(function() {
			return item._clockwise == item2._clockwise;
		}, true);
	}
	
	// Group specific
	if (item instanceof Group) {
		equals(function() {
			return item._clipped == item2._clipped;
		}, true);
	}
	
	// Layer specific
	if (item instanceof Layer) {
		equals(function() {
			return item.project == item2.project;
		}, true);
	}
	
	// PlacedSymbol specific
	if (item instanceof PlacedSymbol) {
		equals(function() {
			return item.symbol == item2.symbol;
		}, true);
	}
	
	// TODO: Raster specific
	
	// TextItem specific:
	if (item instanceof TextItem) {
		equals(item.content, item2.content, 'item.content == item2.content');
		var characterStyleKeys = ['fontSize', 'font'];
		Base.each(characterStyleKeys, function(key) {
			equals(function() {
				return item2.characterStyle[key];
			}, item.characterStyle[key], 'item.characterStyle[\'' + key
					+ '\'] == item2.characterStyle[\'' + key + '\']');
		});
		var paragraphStyleKeys = ['justification'];
		Base.each(paragraphStyleKeys, function(key) {
			equals(function() {
				return item2.paragraphStyle[key];
			}, item.paragraphStyle[key], 'item.paragraphStyle[\'' + key
					+ '\'] == item2.paragraphStyle[\'' + key + '\']');
		});
	}
	
	// PointText specific:
	if (item instanceof PointText) {
		equals(item.point.toString(), item2.point.toString());
	}
	
	if (item._style) {
		// Path Style
		if (item.fillColor) {
			// The fillColor should not point to the same color object:
			equals(function() {
				return item.fillColor != item2.fillColor;
			}, true, 'The fillColor should not point to the same color object:');
			if (item.fillColor instanceof GradientColor) {
				// TODO!
			} else {
				equals(item.fillColor.toString(), item2.fillColor.toString());
			}
		}

		if (item.strokeColor) {
			equals(function() {
				return item.strokeColor != item2.strokeColor;
			}, true, 'The strokeColor should not point to the same color object:');
			if (item.strokeColor instanceof GradientColor) {
				// TODO
			} else {
				equals(item.strokeColor.toString(), item2.strokeColor.toString());
			}
		}

		Base.each(['strokeCap', 'strokeJoin', 'dashOffset', 'miterLimit',
		'strokeOverprint', 'fillOverprint'], function(key) {
			if (item[key]) {
				equals(function() {
					return item[key] == item2[key];
				}, true, 'item[\'' + key + '\'] == item2[\'' + key + '\']');
			}
		});

		if (item.dashArray) {
			equals(item.dashArray.toString(), item2.dashArray.toString(),
				'item.dashArray.toString(), item2.dashArray.toString()');
		}
	}

	// Check length of children and recursively compare them:
	if (item.children) {
		equals(function() {
			return item.children.length == item2.children.length;
		}, true);
		for (var i = 0, l = item.children.length; i < l; i++) {
			compareItems(item.children[i], item2.children[i]);
		}
	}
}