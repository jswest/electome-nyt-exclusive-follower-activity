var fs = require( 'fs' );
var d3 = require( 'd3' );

var tweets = require( './../data/averages.json' );

var states = d3.csvParse( fs.readFileSync( './data/raw/states.csv' ).toString() );

var stateResults = d3.csvParse( fs.readFileSync( './data/raw/state-results.csv' ).toString() );

var stateData = stateResults.map( function ( stateResult ) {

	var trump = parseInt( stateResult.trump.split( ',' ).join( '' ) );
	var clinton = parseInt( stateResult.clinton.split( ',' ).join( '' ) );
	var others = parseInt( stateResult.others.split( ',' ).join( '' ) );
	var total = trump + clinton + others;

	if ( stateResult.State === 'total' ) {
		return {
			state: 'all',
			clinton: clinton / total,
			trump: trump / total,
			difference: ( trump - clinton ) / total
		};

	}

	var state = states.find( function ( state ) {
		return state.State.toLowerCase() === stateResult.State.replace( '*', '' ).toLowerCase()
	} ).Abbreviation;

	return {
		state: state,
		clinton: clinton / total,
		trump: trump / total,
		difference: ( trump - clinton ) / total
	};

} );

var data = stateData.map( function ( d ) {

	var t = tweets.find( function ( t ) {
		return t.state === d.state;
	} );

	return {
		state: d.state,
		clinton_vote: d.clinton,
		trump_vote: d.trump,
		difference_vote: d.difference,
		clinton_tweet: t.clinton,
		trump_tweet: t.trump,
		ratio_tweet: t.ratio
	};

} );

fs.writeFile( './data/scatter.json', JSON.stringify( data, null, 2 ), function ( e ) {
	console.log( e ? e : 'File written.' );
} );