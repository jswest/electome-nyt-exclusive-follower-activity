var els = {};

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

	data = data.filter( function ( d ) {
		return d.state !== 'all';
	} );

	var scales = {};

	var xMin = d3.min( data, function ( d ) {
		return d.difference_vote;
	} );

	xMin = Math.floor( xMin * 100 ) / 100;

	var xMax = d3.max( data, function ( d ) {
		return d.difference_vote;
	} );

	xMax = Math.ceil( xMax * 100 ) / 100;

	scales.x = d3.scaleLinear()
		.domain( [ xMin, xMax ] )
		.range( [ 0, sizes.cwidth ] );

	var yMax = d3.max( data, function ( d ) {
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
		.classed( 'axis', true )
		.attr( 'transform', 'translate(0,' + sizes.cheight + ')' )
		.call( axes.x );

	els.yAxis = els.guts.append( 'g' ).attr( 'id', 'y-axis' )
		.classed( 'axis', true )
		.call( axes.y );

	els.guts.selectAll( 'circle' )
		.data( data )
		.enter()
		.append( 'circle' )
		.attr( 'r', 5 )
		.attr( 'cy', function ( d ) {
			return scales.y( d.ratio_tweet );
		} )
		.attr( 'cx', function ( d ) {
			return scales.x( d.difference_vote );
		} )
		.style( 'opacity', 0.25 )
		.style( 'fill', '#000000' )
		.on( 'mouseover', function () {
			console.log( d3.select( this ).datum().state );
		} );;

	var lineData = data.map( function ( d ) {
		return [ d.difference_vote, d.ratio_tweet ];
	} );

	var regression = ss.linearRegression( lineData );
	var regressionLine = ss.linearRegressionLine( regression );

	var correlation = ss.sampleCorrelation( lineData.map( function ( d ) { return d[0]; } ), lineData.map( function ( d ) { return d[1]; } ) );
	var rSquared = ss.rSquared( lineData, regressionLine );

	console.log( 'correlation', correlation );
	console.log( 'r-squared', rSquared );

	var line = els.guts.append( 'line' )
		.attr( 'x1', scales.x( xMin ) )
		.attr( 'x2', scales.x( xMax ) )
		.attr( 'y1', scales.y( regressionLine( xMin ) ) )
		.attr( 'y2', scales.y( regressionLine( xMax ) ) )
		.style( 'stroke-width', 2 )
		.style( 'stroke', '#000000' );


} );