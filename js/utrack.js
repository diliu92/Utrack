'use strict';

/*
Put any interaction code here
 */

window.addEventListener('load', function() {
	// You should wire up all of your event handling code here, as well as any
	// code that initiates calls to manipulate the DOM (as opposed to responding
	// to events)

	// Instantiate a TabView and a TabModel, then bind them together.
	var tabModel = new TabModel()
	var tabView = new TabView(tabModel);

	// Instantiate a ActivityCollectionView and a ActivityCollectionModel, then bind them together.
	var activityCollectionModel = new ActivityCollectionModel()
	var activityCollectionView = new ActivityCollectionView(activityCollectionModel);
	addEventListenersForActivityCollectionView();

	// Instantiate a GraphView and a GraphModel, then bind them together.
	var graphView = new GraphView(new GraphModel(), activityCollectionModel, tabModel);

});

var addEventListenersForActivityCollectionView = function(){
	//sync value labels and their corresponding slider
	var input_energy_value = document.getElementById('input-energy-value');
	var input_energy_slider = document.getElementById('input-energy-slider');
	input_energy_slider.addEventListener('input',function(){
		input_energy_value.innerHTML = input_energy_slider.value;
	});

	var input_stress_value = document.getElementById('input-stress-value');
	var input_stress_slider = document.getElementById('input-stress-slider');
	input_stress_slider.addEventListener('input',function(){
		input_stress_value.innerHTML = input_stress_slider.value;
	});

	var input_happiness_value = document.getElementById('input-happiness-value');
	var input_happiness_slider = document.getElementById('input-happiness-slider');
	input_happiness_slider.addEventListener('input',function(){
		input_happiness_value.innerHTML = input_happiness_slider.value;
	});
};




