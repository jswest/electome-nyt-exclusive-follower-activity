var sets = [
	{ slug: 'difference_vote', name: 'difference in popular vote' },
	{ slug: 'poll_vote_538', name: '538 error' },
	{ slug: 'poll_vote_rcp', name: 'RCP error' },
	{ slug: 'poll_vote_gcs', name: 'GCS error' }
];

var colors = [
	{ slug: 'none', name: false },
	{ slug: 'is_hispanic_15_percent', name: '15 percent hispanic' },
	{ slug: 'is_midwestern', name: 'Midwestern state' }
];

var els = {};

els.xAxisList = d3.select( '#x-axis-dropdown ul' );
els.colorList = d3.select( '#color-dropdown ul' );

var sizes = {
	width: 500,
	height: 500
};

var padding = {
	top: 10,
	right: 10,
	bottom: 50,
	left: 50
};

sizes.cwidth = sizes.width - padding.left - padding.right;
sizes.cheight = sizes.height - padding.top - padding.bottom;

els.svg = d3.select( 'body' ).append( 'svg' )
	.attr( 'width', sizes.width )
	.attr( 'height', sizes.height );

els.guts = els.svg.append( 'g' )
	.attr( 'transform', 'translate(' + padding.left + ',' + padding.top + ')' );

d3.json( 'data/scatter.json', function ( data ) {

	els.xAxisList.selectAll( 'li' )
		.data( sets )
		.enter()
		.append( 'li' )
		.classed( 'x-axis-li', true )
		.text( function ( d ) { return d.name; } );

	var activeXAxisItem = 'poll_vote_538';

	document.getElementById( 'x-axis-dropdown-open-target' ).addEventListener( 'click', function () {
		document.getElementById( 'x-axis-dropdown' ).classList.toggle( 'active' );
	} );

	[].forEach.call( document.getElementsByClassName( 'x-axis-li' ), function ( el ) {
		el.addEventListener( 'click', function () {
			d3.select( '.x-axis-li.active').classed( 'active', false );
			el.classList.toggle( 'active' );
			activeXAxisItem = d3.select( '.x-axis-li.active' ).datum().slug;
			show();
		} );
	} );

	els.colorList.selectAll( 'li' )
		.data( colors )
		.enter()
		.append( 'li' )
		.classed( 'color-li', true )
		.text( function ( d ) { return d.name; } );

	var activeColorItem = false;

	document.getElementById( 'color-dropdown-open-target' ).addEventListener( 'click', function () {
		document.getElementById( 'color-dropdown' ).classList.toggle( 'active' );
	} );

	[].forEach.call( document.getElementsByClassName( 'color-li' ), function ( el ) {
		el.addEventListener( 'click', function () {
			d3.select( '.color-li.active').classed( 'active', false );
			el.classList.toggle( 'active' );
			activeColorItem = d3.select( '.color-li.active' ).datum().slug;
			show();
		} );
	} );


	data = data.filter( function ( d ) {
		return d.state !== 'all';
	} );

	var scales = {};

	var show = function () {

		var circleData = data.filter( function ( d ) {
			return d[activeXAxisItem] !== null;
		} );

		d3.selectAll( '.viz-el' ).remove();

		var xMin = d3.min( circleData, function ( d ) {
			return d[activeXAxisItem];
		} );

		xMin = Math.floor( xMin * 100 ) / 100;

		var xMax = d3.max( circleData, function ( d ) {
			return d[activeXAxisItem];
		} );

		xMax = Math.ceil( xMax * 100 ) / 100;

		scales.x = d3.scaleLinear()
			.domain( [ xMin, xMax ] )
			.range( [ 0, sizes.cwidth ] );

		var yMax = d3.max( circleData, function ( d ) {
			return d.ratio_tweet;
		} );

		var yMax = Math.ceil( yMax );

		scales.y = d3.scaleLinear()
			.domain( [ 0, yMax ] )
			.range( [ sizes.cheight, 0 ] );

		var axes = {};

		axes.x = d3.axisBottom( scales.x )
			.tickSize( -sizes.cheight );

		axes.y = d3.axisLeft( scales.y )
			.tickSize( -sizes.cwidth );

		els.xAxis = els.guts.append( 'g' ).attr( 'id', 'x-axis' )
			.classed( 'viz-el', true )
			.classed( 'axis', true )
			.attr( 'transform', 'translate(0,' + sizes.cheight + ')' )
			.call( axes.x );

		els.yAxis = els.guts.append( 'g' ).attr( 'id', 'y-axis' )
			.classed( 'viz-el', true )
			.classed( 'axis', true )
			.call( axes.y );

		els.guts.selectAll( 'circle' )
			.data( circleData )
			.enter()
			.append( 'circle' )
			.classed( 'viz-el', true )
			.attr( 'r', 5 )
			.attr( 'cy', function ( d ) {
				return scales.y( d.ratio_tweet );
			} )
			.attr( 'cx', function ( d ) {
				return scales.x( d[activeXAxisItem] );
			} )
			.style( 'opacity', 0.25 )
			.style( 'fill', function ( d ) {
				if ( activeColorItem === false ) {
					return '#000000';
				} else {
					return d[activeColorItem] === 1 ? '#ff0000' : '#000000';
				}
			} )
			.on( 'mouseover', function () {
				console.log( d3.select( this ).datum().state );
			} );;

		var lineData = circleData.map( function ( d ) {
			return [ d[activeXAxisItem], d.ratio_tweet ];
		} );

		var regression = ss.linearRegression( lineData );
		var regressionLine = ss.linearRegressionLine( regression );

		var correlation = ss.sampleCorrelation( lineData.map( function ( d ) { return d[0]; } ), lineData.map( function ( d ) { return d[1]; } ) );
		var rSquared = ss.rSquared( lineData, regressionLine );

		document.getElementById( 'correlation' ).innerHTML = 'correlation: ' + correlation;
		document.getElementById( 'r-squared' ).innerHTML = 'rSquare: ' + rSquared;

		var line = els.guts.append( 'line' )
			.classed( 'viz-el', true )
			.attr( 'x1', scales.x( xMin ) )
			.attr( 'x2', scales.x( xMax ) )
			.attr( 'y1', scales.y( regressionLine( xMin ) ) )
			.attr( 'y2', scales.y( regressionLine( xMax ) ) )
			.style( 'stroke-width', 2 )
			.style( 'stroke', '#000000' );

	};


} );