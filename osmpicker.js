/**
 * @summary GPS coordinate picker with OpenStreetMap
 *
 * Turns an input element to a GPS coordinate picker using the default OpenStreetMap layer.
 * 
 * @access public
 *
 * @class
 *
 * @param {string} selector - The HTML element ID of the input element.
 * @param {Object} settings - Configuration.
 * @param {Object} settings.View - The default GPS and zoom the map should show when there is nothing else to show.
 * @param {Object|Array} settings.View.latLng - Latitude and longitude coordinates in Leaflet LatLng object or array form.
 * @param {Integer} settings.View.zoom - The Leaflet map's zoom level.
 * @param {Boolean} settings.readOnly - Input element readOnly attribute.
 * @param {String} settings.display - CSS display value for the input element.
 */
function OsmPicker(selector, settings) {

	/**
	 * The input element we will turn into a picker.
	 *
	 * @access private
	 * @property {Object} _inputElement - Input DOM element.
	 */
	var _inputElement = null;

	/**
	 * The DOM element where we render the Leaflet map.
	 *
	 * @access private
	 * @property {Object} _mapElement - Leaflet map DOM element.
	 */
	var _mapElement = null;

	/**
	 * The Leaflet map.
	 *
	 * @access private
	 * @property {Object} _map - Leaflet map.
	 */
	var _map = null;

	/**
	 * The current Leaflet marker on the map.
	 *
	 * @access private
	 * @property {Object} _marker - Leaflet marker.
	 */
	var _marker = null;

	/**
	 * @summary Process the passed settings object and
	 * calculate default settings from it then create
	 * the picker.
	 *
	 * @access private
	 */
	function _initialize() {
		// Default settings.
		settings.defaultView = settings.View || {};
		settings.defaultView.latLng = settings.defaultView.latLng || L.latLng(47.4953, 19.0645);
		settings.defaultView.zoom = settings.defaultView.zoom || 14;
		settings.readOnly = (settings.readOnly === true);

		// Configure input element.
		_inputElement = document.getElementById(selector);
		_inputElement.readOnly = settings.readOnly;
		if (settings.display) {
			_inputElement.style.display = settings.display;
		}

		// Create map element.
		_mapElement = document.createElement('div');
		_mapElement.id = selector + '-osm-picker';
		_mapElement.style = 'height:300px;cursor:crosshair;';
		_insertAfter(_mapElement, _inputElement);

		// Create Leaflet map on map element.
		_map = L.map(selector + '-osm-picker');
		L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(_map);

		var inputLatLng = _getLatLngFromInput();
		_map.setView(inputLatLng || settings.defaultView.latLng, settings.defaultView.zoom);
		
		// Add default marker if input isn't empty.
		if (inputLatLng) {
			_setMarker(inputLatLng);
		}
		
		// Handle map clicks, input changes (marker placement).
		_map.on('click', function (e) {
			_inputElement.value = e.latlng.lat + ',' + e.latlng.lng;
			_setMarker(e.latlng);
		});
		_inputElement.addEventListener('change', function () {
			_setMarker(_getLatLngFromInput());
		});
	}

	/**
	 * @summary Return the Leaflet map object used by the picker.
	 *
	 * @access public
	 *
	 * @return {Object} Leaflet map.
	 */
	this.getMap = function () {
		return _map;
	}

	/**
	 * @summary Set the picker to the passed GPS coordinate.
	 *
	 * @access public
	 *
	 * @param {Object|Array} latLng - Latitude and longitude coordinates in Leaflet LatLng or array format.
	 */
	this.setInputFromLatLng = function (latLng) {
		_inputElement.value = (Array.isArray(latLng)) ? latLng.join(',') : latLng.lat + ',' + latLng.lng;
		_map.setView(latLng);
		_setMarker(latLng);
	}

	/**
	 * @summary Create Leaflet LatLng object from the input value.
	 *
	 * @access private
	 *
	 * @return {Object} Leaflet LatLng representing the input GPS coordinate.
	 */
	function _getLatLngFromInput() {
		return (_inputElement.value !== '') ? L.latLng.apply(this, _inputElement.value.split(',')) : null;
	}

	/**
	 * @summary Set the picker's marker to the passed GPS coordinate.
	 *
	 * @access private
	 *
	 * @param {Object|Array} latLng - Latitude and longitude coordinates in Leaflet LatLng or array format.
	 */
	function _setMarker(latLng) {
		if (_marker !== null) {
			_map.removeLayer(_marker);
		}
		_marker = L.marker(latLng).addTo(_map);
	}

	/**
	 * @summary Insert a DOM element after another one.
	 *
	 * @access private
	 *
	 * @param {Object} newNode - The new DOM element to insert.
	 * @param {Object} referenceNode - The DOM element after the insertion should happen.
	 */
	function _insertAfter(newNode, referenceNode) {
		referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
	}

	_initialize();
}