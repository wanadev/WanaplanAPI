/* global API */
/* global console */


/*
 * @module Wanaplan
 * @submodule Component
 */

 var ApiTopMenuComponent = (function() {

    /*
     * Adds a new top menu 'Energy'
     *
     * @class ApiTopMenuComponent
     * @constructor
     * @extends BaseComponent2D
     */
    var apiTopMenuComponent = function(core) {
		BaseComponent2D.call(this, core, "ApiTopMenuComponent");

		// Create the main menu item with some children.
		this._headerItem = {
			"title": "Energy",
			"icon": "http://goo.gl/eHrvof",
			"id": "energyMenu",
			"items": [
				{
					"title": "Solar power",
					"action": "user.energy.click"
				},
				{
					"title": "Wind power",
					"action": "user.energy.click"
				}
			],
			"index": "40", 
			"context": "3D"
		};

		// A new children
		this._headerChildrenItem = {
			"title": "Geothermal power",
			"action": "user.energy.click",
			"params": {
				"MyCustomParameter": 42
			}
		};
	};

	apiTopMenuComponent.prototype = Object.create(BaseComponent2D.prototype);

	apiTopMenuComponent.prototype.initialize = function() {
		// Add the header item with its children.
		API.ui.addMainMenuItem(this._headerItem);

		// Add a children to the menu who has energyMenu as id.
		API.ui.addMainMenuItem(this._headerChildrenItem, "energyMenu");

		document.addEventListener("user.energy.click", onItemClick, false);
	};

	function onItemClick (event) {
		console.log(event.id, event.params);
	}

	return apiTopMenuComponent;
})();
