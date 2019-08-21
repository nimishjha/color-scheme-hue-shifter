var colors = {
	text: "",
	textNew: "",
	arrHexCodesOrig: [],
	arrHexCodesNew: [],
	arrRgbCodes: []
};

function extractHexCodes(s)
{
	let arrHexCodes = s.match(/#[0-9A-F]{3,6}/gi);
	if(!arrHexCodes)
		return;
	colors.arrHexCodesOrig = arrHexCodes;
	let arrRgbCodes = [];
	for(let i = 0, ii = arrHexCodes.length; i < ii; i++)
	{
		arrRgbCodes.push(hexToRgb(arrHexCodes[i]));
	}
	return arrRgbCodes;
}

function hexToRgb(strHexCode)
{
	var r, g, b;
	var rr, gg, bb;
	strHexCode = strHexCode.substr(1, strHexCode.length);
	if(strHexCode.length === 3)
	{
		rr = strHexCode.substr(0, 1) + strHexCode.substr(0, 1);
		gg = strHexCode.substr(1, 1) + strHexCode.substr(1, 1);
		bb = strHexCode.substr(2, 1) + strHexCode.substr(2, 1);
		r = parseInt(rr, 16);
		g = parseInt(gg, 16);
		b = parseInt(bb, 16);
	}
	else if(strHexCode.length === 6)
	{
		rr = strHexCode.substr(0, 2);
		gg = strHexCode.substr(2, 2);
		bb = strHexCode.substr(4, 2);
		r = parseInt(rr, 16);
		g = parseInt(gg, 16);
		b = parseInt(bb, 16);
	}

	return {
		r: r,
		g: g,
		b: b
	};
}

function buildColorGrid(arrRgbCodes)
{
	var colorDiv, i, ii;
	var parentDiv = get("#colorBlocks");
	parentDiv.innerHTML = "";
	var styleString = "";
	for(i = 0, ii = arrRgbCodes.length; i < ii; i++)
	{
		colorDiv = document.createElement("div");
		colorDiv.className = "colorDiv";
		colorDiv.id = "divColor" + zeroPad(arrRgbCodes[i].r) + zeroPad(arrRgbCodes[i].g) + zeroPad(arrRgbCodes[i].b);
		styleString += "#" + colorDiv.id + "{ background-color: rgb(" + arrRgbCodes[i].r + ", " + arrRgbCodes[i].g + ", " + arrRgbCodes[i].b + "); }";
		parentDiv.appendChild(colorDiv);
	}
	insertStyle(styleString, "styleColors");
}

function zeroPad(n)
{
	n += '';
	if(n.length == 1) n = '00' + n;
	else if(n.length == 2) n = '0' + n;
	return n;
}

function go()
{
	colors.arrRgbCodes = [];
	get("#colorBlocks").innerHTML = "";
	var s = colors.text = get("#input").value;
	if(!s.length)
		return;
	colors.arrRgbCodes = extractHexCodes(s);
	if(colors.arrRgbCodes)
		buildColorGrid(colors.arrRgbCodes);
}

function shiftHues(strDirection)
{
	var i, ii, r, g, b, delta, rgb;
	if(strDirection === "left") delta = -8;
	else delta = 8;
	for(i = 0, ii = colors.arrRgbCodes.length; i < ii; i++)
	{
		r = colors.arrRgbCodes[i].r;
		g = colors.arrRgbCodes[i].g;
		b = colors.arrRgbCodes[i].b;

		rgb = changeHue(rgbToHex(r, g, b), delta);

		colors.arrRgbCodes[i].r = rgb.r;
		colors.arrRgbCodes[i].g = rgb.g;
		colors.arrRgbCodes[i].b = rgb.b;
	}
	buildColorGrid(colors.arrRgbCodes);
	populateNewHexCodes(colors.arrRgbCodes);
	replaceColorsInText();
}

function replaceColorsInText()
{
	var i, ii, regex = "", colorText;

	colorText = colors.text;
	colorText = colorText.replace(/\t/g, "GYZYtab");
	colorText = colorText.replace(/\r/g, "GYZYnl");
	colorText = colorText.replace(/\n/g, "GYZYnl");

	for(i = 0, ii = colors.arrHexCodesOrig.length; i < ii; i++)
	{
		regex = new RegExp(colors.arrHexCodesOrig[i], "gi");
		colorText = colorText.replace(regex, colors.arrHexCodesNew[i]);
	}

	colorText = colorText.replace(/GYZYtab/g, "\t");
	colorText = colorText.replace(/GYZYnl/g, "\r\n");

	get("#output").value = colorText;
}

function populateNewHexCodes(arrRgbCodes)
{
	var i, ii;
	for(i = 0, ii = arrRgbCodes.length; i < ii; i++)
	{
		colors.arrHexCodesNew[i] = rgbToHex(colors.arrRgbCodes[i].r, colors.arrRgbCodes[i].g, colors.arrRgbCodes[i].b);
	}
}

function handleKeyDown(e)
{
	var k = e.keyCode;
	if(e.altKey || e.ctrlKey || e.shiftKey)
		return;
	if(!(k === 37 || k === 39))
		return;
	e.stopPropagation();
	switch(k)
	{
		case 37: // left arrow
			shiftHues("left");
			break;
		case 39: // right arrow
			shiftHues("right");
			break;
	}
}

function main()
{
	get("#input").addEventListener("input", go);
	document.addEventListener("keydown", handleKeyDown, false);
	go();
}

//
//			Utilities
//

function insertStyle(str, identifier, important)
{
	if(identifier && identifier.length && get("#" + identifier))
		del("#" + identifier);
	if(important)
		str = str.replace(/;/g, " !important;");
	const head = getOne("head");
	const style = document.createElement("style");
	const rules = document.createTextNode(str);
	style.type = "text/css";
	if(style.styleSheet)
		style.styleSheet.cssText = rules.nodeValue;
	else
		style.appendChild(rules);
	if(identifier && identifier.length)
		style.id = identifier;
	head.appendChild(style);
}

function get(s)
{
	let nodes = document.querySelectorAll(s);
	if(s.indexOf("#") === 0 && !~s.indexOf(" ") && !~s.indexOf("."))
		return document.querySelector(s);
	if(nodes.length)
		return Array.from(nodes);
	return false;
}

function getOne(s)
{
	return document.querySelector(s);
}

function del(arg)
{
	if(!arg)
		return;
	let i, ii;
	if(arg.nodeType)
		arg.parentNode.removeChild(arg);
	else if(arg.length)
		if(typeof arg === "string")
			del(get(arg));
		else
			for(i = 0, ii = arg.length; i < ii; i++)
				del(arg[i]);
}

//
//			Hue-rotate code
//

// Changes the RGB/HEX temporarily to a HSL-Value, modifies that value
// and changes it back to RGB/HEX.

function changeHue(rgb, degree)
{
	var hsl = rgbToHSL(rgb);
	hsl.h += degree;
	if (hsl.h > 360)
	{
		hsl.h -= 360;
	}
	else
	if (hsl.h < 0)
	{
		hsl.h += 360;
	}
	return hslToRGB(hsl);
}

function rgbToHSL(rgb)
{
	rgb = rgb.replace(/^\s*#|\s*$/g, '');
	if (rgb.length == 3)
	{
		rgb = rgb.replace(/(.)/g, '$1$1');
	}
	var r = parseInt(rgb.substr(0, 2), 16) / 255,
		g = parseInt(rgb.substr(2, 2), 16) / 255,
		b = parseInt(rgb.substr(4, 2), 16) / 255,
		cMax = Math.max(r, g, b),
		cMin = Math.min(r, g, b),
		delta = cMax - cMin,
		l = (cMax + cMin) / 2,
		h = 0,
		s = 0;
	if (delta == 0)
	{
		h = 0;
	}
	else
	if (cMax == r)
	{
		h = 60 * (((g - b) / delta) % 6);
	}
	else
	if (cMax == g)
	{
		h = 60 * (((b - r) / delta) + 2);
	}
	else
	{
		h = 60 * (((r - g) / delta) + 4);
	}
	if (delta == 0)
	{
		s = 0;
	}
	else
	{
		s = delta / (1 - Math.abs(2 * l - 1));
	}
	return {
		h: h,
		s: s,
		l: l
	};
}

function hslToRGB(hsl)
{
	var h = hsl.h,
		s = hsl.s,
		l = hsl.l,
		c = (1 - Math.abs(2 * l - 1)) * s,
		x = c * (1 - Math.abs((h / 60) % 2 - 1)),
		m = l - c / 2,
		r, g, b;
	if (h < 60)
	{
		r = c;
		g = x;
		b = 0;
	}
	else if (h < 120)
	{
		r = x;
		g = c;
		b = 0;
	}
	else if (h < 180)
	{
		r = 0;
		g = c;
		b = x;
	}
	else if (h < 240)
	{
		r = 0;
		g = x;
		b = c;
	}
	else if (h < 300)
	{
		r = x;
		g = 0;
		b = c;
	}
	else
	{
		r = c;
		g = 0;
		b = x;
	}
	r = normalize_rgb_value(r, m);
	g = normalize_rgb_value(g, m);
	b = normalize_rgb_value(b, m);
	return {
		r: r,
		g: g,
		b: b
	};
}

function normalize_rgb_value(color, m)
{
	color = Math.floor((color + m) * 255);
	if (color < 0)
	{
		color = 0;
	}
	return color;
}

function rgbToHex(r, g, b)
{
	return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

main();
