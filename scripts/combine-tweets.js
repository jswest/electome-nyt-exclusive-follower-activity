var fs = require( 'fs' );

var sets = {
	all: require( './../data/raw/all.json' ),
	trump: require( './../data/raw/donald-trump.json' ),
	clinton: require( './../data/raw/hillary-clinton.json' )
};

var states = sets.all.aggregates.map( function ( d ) {
	return d.state_abbrev;
} );

var dates = sets.all.aggregates[0].timeline.map( function ( d ) {
	return d[0];
} ).slice( 0, -1 );

var candidates = [ 'clinton', 'trump' ]

var data = [];

dates.forEach( function ( date ) {

	var datum = {
		date: date
	};

	states.forEach( function ( state ) {

		datum[state] = {};

		var allRaw = sets.all.aggregates.find( function ( d ) {
			return d.state_abbrev === state;
		} ).timeline.find( function ( d ) {
			return d[0] === date;
		} )[1];

		candidates.forEach( function ( candidate ) {

			var candidateRaw = sets[candidate].aggregates.find( function ( d ) {
				return d.state_abbrev === state;
			} ).timeline.find( function ( d ) {
				return d[0] === date;
			} )[1];

			datum[state][candidate] = candidateRaw / allRaw;

		} );

		datum[state].ratio = datum[state].trump / datum[state].clinton;

	} );

	datum.all = {};

	var allRaw = states.reduce( function ( accumulated, current ) {
		return accumulated + sets.all.aggregates.find( function ( d ) {
			return d.state_abbrev === current;
		} ).timeline.find( function ( d ) {
			return d[0] === date;
		} )[1];
	}, 0 );

	candidates.forEach( function ( candidate ) {

		var candidateRaw = states.reduce( function ( accumulated, current ) {
			return accumulated + sets[candidate].aggregates.find( function ( d ) {
				return d.state_abbrev === current;
			} ).timeline.find( function ( d ) {
				return d[0] === date;
			} )[1];
		}, 0 );

		datum.all[candidate] = candidateRaw / allRaw;

	} );

	datum.all.ratio = datum.all.trump / datum.all.clinton;

	data.push( datum );

} );

data = data.sort( function ( a, b ) {
	return Date.parse( a.date ) > Date.parse( b.date ) ? 1 : -1;
} );

fs.writeFile( 'data/tweets.json', JSON.stringify( data, null, 2 ), function ( e ) {
	console.log( e ? e : 'JSON file written.' );
} );

var csv = 'date,all_ratio,all_clinton,all_trump';
states.forEach( function ( state ) {
	csv += ',' + state + '_ratio';
	candidates.forEach( function ( candidate ) {
		csv += ',' + state + '_' + candidate;
	} );
} );
csv += '\n';

data.forEach( function ( d ) {
	csv += d.date;
	csv += ',' + d.all.ratio;
	csv += ',' + d.all.clinton;
	csv += ',' + d.all.trump;
	states.forEach( function ( state ) {
		csv += ',' + d[state].ratio;
		candidates.forEach( function ( candidate ) {
			csv += ',' + d[state][candidate];	
		} );
	} );
	csv += '\n';
} );

fs.writeFile( 'data/tweets.csv', csv, function ( e ) {
	console.log( e ? e : 'CSV file written.' );
} );


