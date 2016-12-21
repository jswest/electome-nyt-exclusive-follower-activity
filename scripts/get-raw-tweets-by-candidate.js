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

var data = states.map( function ( state ) {

	var datum = { state: state, total: 0 };

	candidates.forEach( function ( candidate ) {
		datum[candidate] = 0;
	} );

	return datum;

} );

var allDatum = {
	state: 'all',
	clinton: 0,
	trump: 0,
	total: 0
};

dates.forEach( function ( date ) {

	states.forEach( function ( state ) {

		var datum = data.find( function ( d ) {
			return d.state === state;
		} );

		var allRaw = sets.all.aggregates.find( function ( d ) {
			return d.state_abbrev === state;
		} ).timeline.find( function ( d ) {
			return d[0] === date;
		} )[1];

		datum.total += allRaw;

		candidates.forEach( function ( candidate ) {

			var candidateRaw = sets[candidate].aggregates.find( function ( d ) {
				return d.state_abbrev === state;
			} ).timeline.find( function ( d ) {
				return d[0] === date;
			} )[1];

			datum[candidate] += candidateRaw;

		} );

	} );

	var allRaw = states.reduce( function ( accumulated, current ) {
		return accumulated + sets.all.aggregates.find( function ( d ) {
			return d.state_abbrev === current;
		} ).timeline.find( function ( d ) {
			return d[0] === date;
		} )[1];
	}, 0 );

	allDatum.total += allRaw;

	candidates.forEach( function ( candidate ) {

		var candidateRaw = states.reduce( function ( accumulated, current ) {
			return accumulated + sets[candidate].aggregates.find( function ( d ) {
				return d.state_abbrev === current;
			} ).timeline.find( function ( d ) {
				return d[0] === date;
			} )[1];
		}, 0 );

		allDatum[candidate] = candidateRaw;

	} );

} );

data.push( allDatum );

fs.writeFile( 'data/raw-tweet-counts.json', JSON.stringify( data, null, 2 ), function ( e ) {
	console.log( e ? e : 'JSON file written.' );
} );