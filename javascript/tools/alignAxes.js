/*
	WebPlotDigitizer - http://arohatgi.info/WebPlotDigitizer

	Copyright 2010-2013 Ankit Rohatgi <ankitrohatgi@hotmail.com>

	This file is part of WebPlotDigitizer.

    WebPlotDigitizer is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    WebPlotDigitizer is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with WebPlotDigitizer.  If not, see <http://www.gnu.org/licenses/>.


*/

var wpd = wpd || {};

wpd.xyCalibration = (function () {

    function start() {
        wpd.popup.show('xyAxesInfo');
    }

    function pickCorners() {
        wpd.popup.close('xyAxesInfo');
        var tool = new wpd.AxesCornersTool();
        wpd.graphicsWidget.setTool(tool);
        tool.onComplete = align;
    }

    function align() {

    }

    return {
        start: start,
        pickCorners: pickCorners,
        align: align
    };
})();


wpd.AxesCornersTool = (function () {

    var Tool = function() {
        var points = [],
            ctx = wpd.graphicsWidget.getAllContexts();
        wpd.graphicsWidget.resetData();

        this.onMouseClick = function(ev, pos, imagePos) {
            
            var len = points.length;
            points[len] = imagePos.x;
            points[len+1] = imagePos.y;

            ctx.dataCtx.beginPath();
    		ctx.dataCtx.fillStyle = "rgb(200,0,0)";
	    	ctx.dataCtx.arc(pos.x, pos.y, 3, 0, 2.0*Math.PI, true);
		    ctx.dataCtx.fill();

            ctx.oriDataCtx.beginPath();
    		ctx.oriDataCtx.fillStyle = "rgb(200,0,0)";
	    	ctx.oriDataCtx.arc(parseInt(imagePos.x,10), parseInt(imagePos.y,10), 3, 0, 2.0*Math.PI, true);
		    ctx.oriDataCtx.fill();

            if(len/2 === 4) {
                wpd.graphicsWidget.removeTool();
                wpd.graphicsWidget.resetData();
                this.onComplete(points);
            }

            wpd.graphicsWidget.updateZoomOnEvent(ev);
        };

        this.onRedraw = function() {
            for(var i = 0; i < points.length; i+=2) {
                var pos = wpd.graphicsWidget.screenPx(points[i], points[i+1]);
                ctx.dataCtx.beginPath();
        		ctx.dataCtx.fillStyle = "rgb(200,0,0)";
	        	ctx.dataCtx.arc(parseInt(pos.x, 10), parseInt(pos.y, 10), 3, 0, 2.0*Math.PI, true);
		        ctx.dataCtx.fill();
            }
        };

        this.onComplete = function(points) {};
    };

    return Tool;
})();



/** Have the axes been picked? true/false. */
var axesPicked; // axes picked?

/** Number of axes points picked. */
var axesN; 

/** Total number of axes points needed to align. */
var axesNmax;

/** XY-Axes data. */
var xyAxes;

/** Axes alignment data */
var axesAlignmentData = [];

/** Plot type. Options: 'XY', 'bar', 'polar', 'ternary' or 'map' */
var plotType; 

/**
 * Start the alignment process here. Called from the Plot Type option wpd.popup.
 */ 
function initiatePlotAlignment() {
  axesPicked = 0;
  xyEl = document.getElementById('r_xy');
  polarEl = document.getElementById('r_polar');
  ternaryEl = document.getElementById('r_ternary');
  mapEl = document.getElementById('r_map');
  imageEl = document.getElementById('r_image');
  
  wpd.popup.close('axesList');
  
  if (xyEl.checked === true)
    wpd.xyCalibration.start();
  else if(polarEl.checked === true)
    setAxes('polar');
  else if(ternaryEl.checked === true)
    setAxes('ternary');
  else if(mapEl.checked === true)
    setAxes('map');
  else if(imageEl.checked === true)
    setAxes('image');
}

/**
 * Entry point for Axes alignment. 
 * @param {String} ax_mode Plot Type. Options: 'XY', 'bar', 'polar', 'ternary'
 */
function setAxes(ax_mode) {

	plotType = ax_mode;
	wpd.sidebar.clear();
	canvasMouseEvents.removeAll();
	canvasMouseEvents.add('click',pickCorners,true);
	axesN = 0;
	xyAxes = [];

	if ((plotType === 'XY')||(plotType === 'bar')) {
		axesNmax = 4;
		wpd.popup.show('xyAxesInfo');
	} else if (plotType === 'polar') {
		axesNmax = 3;
		wpd.popup.show('polarAxesInfo');
	} else if (plotType === 'ternary') {
		axesNmax = 3;
		wpd.popup.show('ternaryAxesInfo');
	} else if (plotType === 'map') {
		axesNmax = 2;
		wpd.popup.show('mapAxesInfo');
	} else if (plotType === 'image') {
		axesNmax = 0;
		alignAxes();
	}
}

/**
 * Handles mouseclick in axis alignment mode. Axes point are defined using this.
 * @param {Event} ev Mouse event.
 */
function pickCorners(ev) {
	if (axesN < axesNmax) {
		var posn = getPosition(ev);
		var xi = posn.x;
		var yi = posn.y;
		xyAxes[axesN] = new Array();
		xyAxes[axesN][0] = parseFloat(xi);
		xyAxes[axesN][1] = parseFloat(yi);
		axesN = axesN + 1;	

		dataCtx.beginPath();
		dataCtx.fillStyle = "rgb(0,0,200)";
		dataCtx.arc(xi,yi,3,0,2.0*Math.PI,true);
		dataCtx.fill();
		
		wpd.zoomView.updateZoom(ev);

		if (axesN === axesNmax) {
				axesPicked = 1;
				
				canvasMouseEvents.remove('click',pickCorners,true);
				
				if (plotType === 'XY') {
					wpd.popup.show('xyAlignment');
				} else if (plotType === 'polar') {
					wpd.popup.show('polarAlignment');
				} else if (plotType === 'ternary') {
					wpd.popup.show('ternaryAlignment');
				} else if (plotType === 'map') {
					wpd.popup.show('mapAlignment');
				}

				dataCanvas.width = dataCanvas.width;
		}
	}
	
}


/**
 * Store the alignment data.
 */
function alignAxes() {
    if (plotType === 'XY') {
	    var xminEl = document.getElementById('xmin');
	    var xmaxEl = document.getElementById('xmax');
	    var yminEl = document.getElementById('ymin');
	    var ymaxEl = document.getElementById('ymax');
	    var xlogEl = document.getElementById('xlog');
	    var ylogEl = document.getElementById('ylog');

		var inputParser = new InputParser(),
			parsedVal,
			x1Date = false,
			y1Date = false,
			x2Date = false,
			y2Date = false;

		var raiseError = function(parsedValue) {
				if(!inputParser.isValid || parsedValue == null) {
					wpd.popup.close('xyAlignment');
					wpd.popup.show('inputError');
					return null;
				} 
				return parsedValue;
			};

		parsedVal = raiseError(inputParser.parse(xminEl.value));
		if(parsedVal === null) { return; }		
	    axesAlignmentData[0] = parsedVal;
		if(inputParser.isDate) {
			x1Date = true;
		}

		parsedVal = raiseError(inputParser.parse(xmaxEl.value));
		if(parsedVal === null) { return; }		
	    axesAlignmentData[1] = parsedVal;
		if(inputParser.isDate) {
			x2Date = true;
		}

		parsedVal = raiseError(inputParser.parse(yminEl.value));
		if(parsedVal === null) { return; }		
	    axesAlignmentData[2] = parsedVal;
		if(inputParser.isDate) {
			y1Date = true;
		}

		parsedVal = raiseError(inputParser.parse(ymaxEl.value));
		if(parsedVal === null) { return; }		
	    axesAlignmentData[3] = parsedVal;
		if(inputParser.isDate) {
			y2Date = true;
		}

	    if (xlogEl.checked === true)
	        axesAlignmentData[4] = true;
	    else
	        axesAlignmentData[4] = false;
	        
	    if (ylogEl.checked === true)
	        axesAlignmentData[5] = true;
	    else
	        axesAlignmentData[5] = false;

		// Date checks:
		if ((x1Date !== x2Date) || (y1Date !== y2Date)) {
			wpd.popup.close('xyAlignment');
			wpd.popup.show('inputError');
			return;
		}

		if(x1Date && x2Date) {
			axesAlignmentData[6] = true;
			axesAlignmentData[8] = dateConverter.getFormatString(xminEl.value);
		} else {
			axesAlignmentData[6] = false;
		}

		if(y1Date && y2Date) {
			axesAlignmentData[7] = true;
			axesAlignmentData[9] = dateConverter.getFormatString(yminEl.value);
		} else {
			axesAlignmentData[7] = false;
		}

	    wpd.popup.close('xyAlignment');
    } else if (plotType == 'polar') {
	    var r1El = document.getElementById('rpoint1');
	    var theta1El = document.getElementById('thetapoint1');
	    var r2El = document.getElementById('rpoint2');
	    var theta2El = document.getElementById('thetapoint2');
	
	    var degreesEl = document.getElementById('degrees');
	    var radiansEl = document.getElementById('radians');
	    var orientationEl = document.getElementById('clockwise');
	
	    axesAlignmentData[0] = parseFloat(r1El.value);
	    axesAlignmentData[1] = parseFloat(theta1El.value);
	    axesAlignmentData[2] = parseFloat(r2El.value);
	    axesAlignmentData[3] = parseFloat(theta2El.value);
	
	    if (degreesEl.checked === true)
	        axesAlignmentData[4] = true;
	    else
	        axesAlignmentData[4] = false;
	
	    if (orientationEl.checked === true)
	        axesAlignmentData[5] = true;
	    else
	        axesAlignmentData[5] = false;
	
	
	    wpd.popup.close('polarAlignment');

    } else if (plotType === 'ternary') {

	    var range1El = document.getElementById('range0to1');
	    var range100El = document.getElementById('range0to100');
	    var ternaryNormalEl = document.getElementById('ternarynormal');
	
	    if (range100El.checked === true)
	      axesAlignmentData[0] = true;
	    else
	      axesAlignmentData[0] = false;
	
	    if (ternaryNormalEl.checked === true)
	      axesAlignmentData[1] = true;
	    else
	      axesAlignmentData[1] = false;
		
	    wpd.popup.close('ternaryAlignment');

    } else if (plotType === 'map') {

	    var scaleLength = document.getElementById('scaleLength');
	
	    axesAlignmentData[0] = parseFloat(scaleLength.value);
	
	    wpd.popup.close('mapAlignment');

    } else if (plotType === 'image') {

	  axesPicked = 1;
	  axesAlignmentData[0] = imageDimensions[0]; // xmin
	  axesAlignmentData[1] = imageDimensions[2]; // xmax
	  axesAlignmentData[2] = imageDimensions[1]; // ymin
	  axesAlignmentData[3] = imageDimensions[3]; // ymax
    }

	if(axesPicked === 1) {
		acquireData();
	}
    
}
