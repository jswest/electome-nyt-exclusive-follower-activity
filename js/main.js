var isRatio = true;

var els = {};

els.ratioToggle = document.getElementById( 'ratio-toggle' );
els.percentToggle = document.getElementById( 'percent-toggle' );
els.statesList = d3.select( '#states-dropdown ul' );
els.key = d3.select( '#key' );

var width = window.innerWidth;
var height = window.innerHeight - 100;

var padding = {
	top: 10,
	right: 10,
	bottom: 50,
	left: 50
};

var sizes = {
	width: width,
	height: height,
	cwidth: width - padding.left - padding.right,
	cheight: height - padding.top - padding.bottom
};

els.svg = d3.select( 'body' ).append( 'svg' )
	.attr( 'width', sizes.width )
	.attr( 'height', sizes.height );

els.guts = els.svg.append( 'g' ).attr( 'id', 'guts' )
	.attr( 'transform', 'translate(' + padding.left + ',' + padding.top + ')' );

els.xAxis = els.guts.append( 'g' ).attr( 'id', 'x-axis' )
	.classed( 'axis', true )
	.attr( 'transform', 'translate(0,' + sizes.cheight + ')' );

els.yAxis = els.guts.append( 'g' ).attr( 'id', 'y-axis' )
	.classed( 'axis', true );

var scales = {};

scales.color = d3.scaleOrdinal().range( d3.schemeCategory20 );

scales.x = d3.scaleUtc()
	.domain( [ new Date( '2016-01-01' ), new Date( '2016-11-08' ) ] )
	.range( [ 0, sizes.cwidth ] );

scales.y = d3.scaleLinear()
	.range( [ sizes.cheight, 0 ] );

d3.json( 'data/tweets.json', function ( data ) {

	// Filter out the date where there was no data.
	// data = data.filter( function ( d ) {
	// 	return d.date !== '2016-05-28 00:00:00';
	// } );

	var states = Object.keys( data[0] ).filter( function ( d ) {
		return d !== 'all' && d !== 'date';
	} );
	els.statesList.selectAll( 'li' )
		.data( states.sort() )
		.enter()
		.append( 'li' )
		.classed( 'state-li', true )
		.text( function ( d ) { return d; } );

	var activeStates = [ 'all' ];

	document.getElementById( 'states-dropdown-open-target' ).addEventListener( 'click', function () {
		document.getElementById( 'states-dropdown' ).classList.toggle( 'active' );
	} );

	[].forEach.call( document.getElementsByClassName( 'state-li' ), function ( el ) {
		el.addEventListener( 'click', function () {
			el.classList.toggle( 'active' );
			// update color
			// update key
			activeStates = [ 'all' ];
			d3.selectAll( '.state-li.active' ).each( function ( d, i ) {
				activeStates.push( d );
			} );
			if ( isRatio ) {
				showRatio();
			} else {
				showPercents();
			}
		} );
	} );

	var line = d3.line()
		.x( function ( d ) { return scales.x( d.x ) } )
		.y( function ( d ) { return scales.y( d.y ) } );

	var createAxes = function () {
		var axes = {};

		axes.x = d3.axisBottom( scales.x )
			.tickSize( -sizes.cheight );

		axes.y = d3.axisLeft( scales.y )
			.tickSize( -sizes.cwidth );

		els.xAxis.call( axes.x );
		els.yAxis.call( axes.y );
	};

	var checkDatum = function ( set, index ) {
		if (
			index > 0 &&
			set[index].y &&
			set[index].y > 0 &&
			set[index].y < Infinity &&
			set[index - 1].y > 0 &&
			set[index - 1].y < Infinity
		) {
			return true;
		} else {
			return false;
		}
	};

	var showRatio = function () {

		var yMaxPool = activeStates.reduce( function ( accumulated, current ) {
			return accumulated.concat( data.map( function ( d ) { return d[current].ratio } ) );
		}, [] );

		var yMax = d3.max( yMaxPool, function ( d ) {
			return d;
		} );

		scales.y.domain( [ 0, yMax ] );

		createAxes();
		
		els.guts.selectAll( '.viz-el' ).remove();
		els.key.selectAll( 'div' ).remove();

		activeStates.forEach( function ( state, stateIndex ) {

			var entry = els.key.append( 'div' ).classed( 'entry', true );
			entry.append( 'div' ).classed( 'colorblock', true )
				.style( 'background-color', function () {
					return state === 'all' ? '#cccccc' : scales.color( stateIndex );
				} );
			entry.append( 'p' ).classed( 'text', true ).text( state );

			var ratioData = data.map( function ( d ) {
				return { x: new Date( d.date ), y: d[state].ratio };
			} );

			var ratioLineWrapper = els.guts.append( 'g' )
				.classed( 'line-wrapper', true )
				.classed( 'viz-el', true );

			ratioData.forEach( function ( d, i ) {
				if ( checkDatum( ratioData, i ) ) {
					ratioLineWrapper.append( 'path' )
						.datum( ratioData.slice( i - 1, i + 1 ) )
						.classed( 'line-segment', true )
						.classed( 'line', true )
						.classed( 'ratio-line', true )
						.attr( 'd', line )
						.style( 'stroke', function () {
							return state === 'all' ? '#cccccc' : scales.color( stateIndex );
						} );
				}
			} );

		} );

	};

	var showPercents = function () {

		var yMaxPool = activeStates.reduce( function ( accumulated, current ) {
			return accumulated
				.concat( data.map( function ( d ) { return d[current].clinton } ) )
				.concat( data.map( function ( d ) { return d[current].trump } ) );
		}, [] );

		var yMax = d3.max( yMaxPool, function ( d ) {
			return d;
		} );

		scales.y.domain( [ 0, yMax ] );

		createAxes();

		els.guts.selectAll( '.viz-el' ).remove();
		els.key.selectAll( 'div' ).remove();

		activeStates.forEach( function ( state, stateIndex ) {

			var entry = els.key.append( 'div' ).classed( 'entry', true );
			entry.append( 'div' ).classed( 'colorblock', true )
				.style( 'background-color', function () {
					return state === 'all' ? '#cccccc' : scales.color( stateIndex );
				} );
			entry.append( 'p' ).classed( 'text', true ).text( 'Trump: ' + state );

			var entry = els.key.append( 'div' ).classed( 'entry', true );
			entry.append( 'div' ).classed( 'colorblock', true )
				.style( 'background-color', function () {
					return state === 'all' ? '#cccccc' : scales.color( stateIndex );
				} )
				.style( 'opacity', 0.25 );
			entry.append( 'p' ).classed( 'text', true ).text( 'Clinton: ' + state );

			var clintonData = data.map( function ( d ) {
				return { x: new Date( d.date ), y: d[state].clinton };
			} );

			var clintonLineWrapper = els.guts.append( 'g' )
				.classed( 'line-wrapper', true )
				.classed( 'viz-el', true );

			clintonData.forEach( function ( d, i ) {
				if ( checkDatum( clintonData, i ) ) {
					clintonLineWrapper.append( 'path' )
						.datum( clintonData.slice( i - 1, i + 1 ) )
						.classed( 'line-segment', true )
						.classed( 'line', true )
						.classed( 'candidate-line', true )
						.classed( 'clinton-line', true )
						.attr( 'd', line )
						.style( 'stroke', function () {
							return state === 'all' ? '#cccccc' : scales.color( stateIndex );
						} )
						.style( 'opacity', 0.5 );
				}
			} );

			var trumpData = data.map( function ( d ) {
				return { x: new Date( d.date ), y: d[state].trump };
			} );

			var trumpLineWrapper = els.guts.append( 'g' )
				.classed( 'line-wrapper', true )
				.classed( 'viz-el', true );

			trumpData.forEach( function ( d, i ) {
				if ( checkDatum( trumpData, i ) ) {
					trumpLineWrapper.append( 'path' )
						.datum( trumpData.slice( i - 1, i + 1 ) )
						.classed( 'line-segment', true )
						.classed( 'line', true )
						.classed( 'candidate-line', true )
						.classed( 'clinton-line', true )
						.attr( 'd', line )
						.style( 'stroke', function () {
							return state === 'all' ? '#cccccc' : scales.color( stateIndex );
						} );	
				}
			} );

		} );

	};

	els.ratioToggle.addEventListener( 'click', function () {
		els.ratioToggle.classList.add( 'active' );
		els.percentToggle.classList.remove( 'active' );
		isRatio = true;
		showRatio();
	} );

	els.percentToggle.addEventListener( 'click', function () {
		els.percentToggle.classList.add( 'active' );
		els.ratioToggle.classList.remove( 'active' );
		isRatio = false;
		showPercents();
	} );

	if ( isRatio ) {
		showRatio();
	} else {
		showPercents();
	}

} );

