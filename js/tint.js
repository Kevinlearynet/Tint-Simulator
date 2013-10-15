/**
 * Tint Simulator
 *
 * INCLUDES
 *
 * @codekit-prepend "vendor/handlebars.js"
 * @codekit-prepend "vendor/jquery.color.js"
 */
(function($) {

function TintSimulator() { 
	
	
	/**
	 * Options & globals
	 */
	var self = this;
	this.resetProducts = this.resetShades = null;
	this.options = {
		dataFeed: 'js/data.json',
		transitionTime: 300,
		dropdownSelector: '.filter-control select'
	};


	/**
	 * Handle events
	 */
	this.construct = function(){
		self.populate();	// Populate initial data from feed
	};
	
	
	/**
	 * Initialize dropdown events
	 */
	this.events = function() {
		$(this.options.dropdownSelector).on('change', self.updateDropdowns);
	};
	

	/**
	 * Generate dropdown filters
	 *
	 * Use a modular Handlebars template to load the data from JSON file
	 */
	this.populate = function() {
		$.getJSON(this.options.dataFeed, function(data) {
			
			// Create dropdown data
			var dropdowns = [
				{ filter: "Brand", items: [{
					"label": "All",
					"value": "all"
				}] },
				{ filter: "Product", items: [] },
				{ filter: "Shade", items: [] },
			];
			
			// Fill fields values
			$.each(data.tints, function(key, val) {
				
				// Store brand items
				var brandID = val.brand.toLowerCase();
				dropdowns[0].items.push({
					"label": val.brand,
					"value": brandID,
					'class' : ''
				});
				
				// Work with product data
				$.each( val.products, function(key, val) {
				
					var product_id = val.name.toLowerCase().replace( " ", "-" );
					
					// Store products
					dropdowns[1].items.push({
						'label' : val.name,
						'value' : product_id,
						'class' : brandID
					});
					
					// Store shades
					$.each( val.shades, function(key, val) {
						dropdowns[2].items.push({
							'label' : val.id,
							'value' : val.color,
							'class' : product_id
						});
					} );
					
				} );
			});
			
			// Output dropdown fields using JS templates
			var source	 = $("#dropdown-filter").html();
			$.each(dropdowns, function(key, val) {
				
				// Populate template content
				var template = Handlebars.compile(source);
				var html	 = template(dropdowns[key]);
				var selector = '#dropdown-' + val.filter.toLowerCase().replace( " ", "-" );
				$(selector).html(html);
			});
			
			// Store original <option>'s
			self.resetProducts = $('#Product').html();
			self.resetShades = $('#Shade').html();
			
			// Initialize event handlers
			self.events();
		   
		   // Select the default tint to show
		   self.selectOption('#Brand', 'Madico');
		   self.selectOption('#Product', 'Charcool');
		   self.selectOption('#Shade', '35 PS SR');
		   
		   // Trigger change event to update display
		   $('.simulator .loading').delay( self.options.transitionTime * 3 ).fadeOut(self.options.transitionTime);
		});
	}; // end populate()
	
	
	/**
	 * Update Selected Dropdown Option
	 */
	this.selectOption = function( dropdownSelector, text ) {
	   $(dropdownSelector + ' option:selected').prop('selected', false);
	   $(dropdownSelector + ' option').filter(function() { 
	      return ( $(this).text() == text );
	   }).prop('selected', true);
	   $(dropdownSelector).trigger('change');
	}; // end selectOption
	
	
	/**
	 * Selective Options
	 *
	 * Display specific dropdown values based on previous selections
	 */
	this.updateDropdowns = function(event) {
	
		event.stopPropagation();
		
		// Vars
		var value = $(this).val();
		var id = $(this).attr('id');
		var className = value.toLowerCase().replace( " ", "-" );
		
		// Brand dropdown
		if ( id == 'Brand' ) {
			$('#Product').html( self.resetProducts );
			if ( value != 'all' ) {
				$('#Product option' ).filter(':not(.' + className + ')').remove();
			}
			$('#Product').trigger('change');
		}
		
		// Brand dropdown
		else if ( id == 'Product' ) {
			$('#Shade').html( self.resetShades );
			$('#Shade option' ).filter(':not(.' + className + ')').remove();
			$('#Shade').trigger('change');
		}
		
		// Brand dropdown
		else if ( id == 'Shade' ) {
		
			var label = $('option[value="' + value + '"]', this).text();
			var num = parseInt( label.replace( /^\D+/g, '') );
			var transparency = '.' + (100 - num);
	
			// Switch tint color
			$('.sedan .tint').animate({
				backgroundColor: value,
				opacity: transparency
			}, self.options.transitionTime);
			
			// Update primary title
			var brand = $('#Product option[value="' + $('#Product').val() + '"]').attr('class');
			var brand = brand.replace( "-", " " );
			var brand = self.ucwords(brand);
			var brand = brand.replace( " ", "-" );
			
			var product = $('#Product').val();
			var product = product.replace( "-", " " );
			var product = self.ucwords(product);
			
			var shade = $('#Shade option[value="' + value + '"]').text();
			var title = brand + ' ' + product + ' ' + shade;
			
			// Crossfade title effect
			var title_selector = $('.primary h2');
			var clone = title_selector.clone();
			clone.css('position', 'absolute');
			clone.css('top', '0');
			clone.css('width', '100%');
			$('.primary').prepend(clone);
			
			title_selector.hide();
			title_selector.text( title );
			
			clone.fadeOut(self.options.transitionTime, function(){
				clone.remove();
			});
			title_selector.fadeIn(self.options.transitionTime);
		}
	}; // updateDropdowns()
	
	
	/**
	 * Helper function: PHP ucwords() equivalent
	 */
	this.ucwords = function(str) {
		return (str + '').replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function ($1) {
			return $1.toUpperCase();
		});
	};

} // end TintSimulator class

// Instantiate
var TintSimulatorInstance = new TintSimulator();
TintSimulatorInstance.construct();

})(jQuery);