var ySets = [
	{ slug: 'difference_vote', name: 'The difference in percentage points between the popular vote for Trump and the popular vote for Clinton.' },
	{ slug: 'poll_vote_538', name: 'The difference the margin of victory projected by 538 and the actual margin.' },
	{ slug: 'poll_vote_rcp', name: 'The difference the margin of victory projected by RCP and the actual margin.' },
	{ slug: 'poll_vote_gcs', name: 'The difference the margin of victory projected by GCS and the actual margin.' }
];

var xSets = [
	{ slug: 'ratio_tweet', name: 'The ratio of the number of tweets by exclusive Trump followers to the number of tweets by exclusive Clinton followers.' },
	{ slug: 'ratio_tweets_per_follower', name: 'The ratio of the average number of tweets per follower for Trump followers to the average number of tweets per follower for Clinton followers.' },
	{ slug: 'ratio_follower', name: 'The ratio of exclusive Trump followers to Clinton followers.' }
];

var colors = [
	{ slug: 'none', name: 'Remove coloring.' },
	{ slug: 'is_hispanic_15_percent', name: 'Color states that are at least 15 percent hispanic.' },
	{ slug: 'is_midwestern', name: 'Color midwestern states.' }
];

var els = {};

els.yAxisList = d3.select( '#y-axis-dropdown ul' );
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

els.svg = d3.select( '#svg-wrapper' ).append( 'svg' )
	.attr( 'width', sizes.width )
	.attr( 'height', sizes.height );

els.guts = els.svg.append( 'g' )
	.attr( 'transform', 'translate(' + padding.left + ',' + padding.top + ')' );

d3.json( 'data/scatter.json', function ( data ) {

	els.yAxisList.selectAll( 'li' )
		.data( ySets )
		.enter()
		.append( 'li' )
		.classed( 'y-axis-li', true )
		.text( function ( d ) { return d.name; } );

	var activeYAxisItem;

	document.getElementById( 'y-axis-dropdown-open-target' ).addEventListener( 'click', function () {
		document.getElementById( 'y-axis-dropdown' ).classList.toggle( 'active' );
	} );

	[].forEach.call( document.getElementsByClassName( 'y-axis-li' ), function ( el ) {
		el.addEventListener( 'click', function () {
			d3.select( '.y-axis-li.active').classed( 'active', false );
			el.classList.toggle( 'active' );
			activeYAxisItem = d3.select( '.y-axis-li.active' ).datum().slug;
			document.getElementById( 'current-y-axis' ).innerHTML = 'current y-axis: ' + d3.select( '.y-axis-li.active' ).datum().name;
			show();
		} );
	} );

	els.xAxisList.selectAll( 'li' )
		.data( xSets )
		.enter()
		.append( 'li' )
		.classed( 'x-axis-li', true )
		.text( function ( d ) { return d.name; } );

	var activeXAxisItem;

	document.getElementById( 'x-axis-dropdown-open-target' ).addEventListener( 'click', function () {
		document.getElementById( 'x-axis-dropdown' ).classList.toggle( 'active' );
	} );

	[].forEach.call( document.getElementsByClassName( 'x-axis-li' ), function ( el ) {
		el.addEventListener( 'click', function () {
			d3.select( '.x-axis-li.active').classed( 'active', false );
			el.classList.toggle( 'active' );
			activeXAxisItem = d3.select( '.x-axis-li.active' ).datum().slug;
			document.getElementById( 'current-x-axis' ).innerHTML = 'current x-axis: ' + d3.select( '.x-axis-li.active' ).datum().name;
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

		if ( !( activeXAxisItem && activeYAxisItem ) ) {
			return;
		}

		var circleData = data.filter( function ( d ) {
			return d[activeYAxisItem] !== null;
		} );

		d3.selectAll( '.viz-el' ).remove();

		var yMin = d3.min( circleData, function ( d ) {
			return d[activeYAxisItem];
		} );

		yMin = Math.floor( yMin * 100 ) / 100;

		var yMax = d3.max( circleData, function ( d ) {
			return d[activeYAxisItem];
		} );

		yMax = Math.ceil( yMax * 100 ) / 100;

		scales.y = d3.scaleLinear()
			.domain( [ yMin, yMax ] )
			.range( [ sizes.cheight, 0 ] );

		var xMax = d3.max( circleData, function ( d ) {
			return d[activeXAxisItem];
		} );

		var xMin = 0;

		scales.x = d3.scaleLinear()
			.domain( [ 0, xMax ] )
			.range( [ 0, sizes.cwidth ] );

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
			.attr( 'cx', function ( d ) {
				return scales.x( d[activeXAxisItem] );
			} )
			.attr( 'cy', function ( d ) {
				return scales.y( d[activeYAxisItem] );
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
				document.getElementById( 'state-name' ).innerHTML = 'state: ' + d3.select( this ).datum().state;
			} );;

		var lineData = circleData.map( function ( d ) {
			return [ d[activeXAxisItem], d[activeYAxisItem] ];
		} );

		var regression = ss.linearRegression( lineData );
		var regressionLine = ss.linearRegressionLine( regression );

		var correlation = ss.sampleCorrelation( lineData.map( function ( d ) { return d[0]; } ), lineData.map( function ( d ) { return d[1]; } ) );
		var rSquared = ss.rSquared( lineData, regressionLine );

		document.getElementById( 'correlation' ).innerHTML = 'correlation: ' + correlation;
		document.getElementById( 'r-squared' ).innerHTML = 'r-squared: ' + rSquared;

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