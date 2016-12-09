var fs = require( 'fs' );
var d3 = require( 'd3' );

var tweets = require( './../data/averages.json' );

var states = d3.csvParse( fs.readFileSync( './data/raw/states.csv' ).toString() );

var stateResults = d3.csvParse( fs.readFileSync( './data/raw/state-results.csv' ).toString() );

var pollError = d3.csvParse( fs.readFileSync( './data/raw/polling-data.csv' ).toString() );

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

	var e = pollError.find( function ( e ) {
		return e.state === d.state;
	} );

	return {
		state: d.state,
		clinton_vote: d.clinton,
		trump_vote: d.trump,
		difference_vote: d.difference,
		clinton_tweet: t.clinton,
		trump_tweet: t.trump,
		ratio_tweet: t.ratio,
		poll_vote_538: e ? parseFloat( e['538 error'] ) : false,
		poll_vote_rcp: e ? parseFloat( e['rcp error'] ) : false,
		poll_vote_gcs: e ? parseFloat( e['gcs error'] ) : false,
		is_hispanic_15_percent: e ? parseFloat( e['>= 15% hispanic'] ) : false,
		is_midwestern: e ? parseFloat( e['midwest'] ) : false
	};

} );

fs.writeFile( './data/scatter.json', JSON.stringify( data, null, 2 ), function ( e ) {
	console.log( e ? e : 'File written.' );
} );