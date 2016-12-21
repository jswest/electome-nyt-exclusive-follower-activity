var fs = require( 'fs' );

var request = require( 'request' );
var d3 = require( 'd3' );

var states = d3.csvParse( fs.readFileSync( './data/raw/states.csv' ).toString() );
states = states.map( function ( d ) {
	return d.Abbreviation;
} );
var candidates = [
	'Hillary Clinton',
	'Donald Trump'
];

var cookie = 'session=.eJyNk-FL3DAYxv-VEtBPd70mbe96BdkEz82hTLR-cYzymry9i-s1JUkV5vzf96ZWcLLBoJCk75MneX99-sSOb6rPSX1zvbmqz07ON3V1drFh5ROLFCtZNeAsEkl0gpIGvowEL0VRJsvo00XFnmdvd19efT09Ox_3Qt_Xe_SgwENYW9OiGwtqrztWejsgbXYePE56ax6gpRNfpqjYjLXgfG2xseh2VAnnz7mYi6QKt0jKJI1TwdNkyZ7JTFokN1WDf9UmxVwsK16UPC95FvM0uyVX3IMOB92bXRe7HTaNxlbFj-j8x22oxdLsX3X1A1pNAmLRQOtwxrTCzmuvQz_fnpg0XYfSa0NdsRuHtoM9zi_BuUdj1fx48LuglzBKaLu7NlKHTie_0C152tA6iRPSDGRT64A_X8mkWKUCAZN1nq043EHGIWXP3yc8uicZX4qYr0UsBI0r_oquNdsA-y_geLzO8wBjlLhamqEjbHk2Y-H-_0Gn0_LHv6Uk6LX0gw31nfe9KxcLF28tPFAibPBYvEwXWVNwma84B8ju1k2BjVA8z9KVANUskX9wR1mRHNqjfnuojkavg_T4QJzSI1UXj9CCIa1fLB3N7k3cd9vAslfvUvEuQfk6vf2D-Wj465_kJ-nbdE8cvhAHKhu7hU7_hCkTm5biYUgwYxRQN76rTPRotceo1yjRRXBnBh9RUiJspzCFRNc92j10GD7N-Mf8BiuAKGY.Czsz6A.t0OblkddKRIH9jkbia5R922W0IA';

var base = 'http://dashboard-stage.electome.org/api/authors/tweet/?';
var followerFragment = 'exclusive_follower_of=';
var stateFragment = '&state_abbrev=';

var data = [];

var candidateIndex = 0;
var stateIndex = -1;
	
var makeRequest = function () {

	stateIndex++
	console.log( 'Making request for ' + states[stateIndex] + ' // ' + candidates[candidateIndex] );
	if ( stateIndex >= states.length ) {
		stateIndex = 0;
		candidateIndex++;
		if ( candidateIndex >= candidates.length ) {
			return;
		}
	}

	var url = base + followerFragment + candidates[candidateIndex] + stateFragment + states[stateIndex];
	var options = {
		headers: {
			'Cookie': cookie
		}
	};
	request( url, options, function ( error, response ) {
		try {
			body = JSON.parse( response.body );
		} catch ( e ) {
			body = false;
		} finally {
			if ( body ) {
				var datum = data.find( function ( d ) {
					return d.state === states[stateIndex];
				} );
				if ( !datum ) {
					datum = { state: states[stateIndex] };
					data.push( datum );
				}
				datum[candidates[candidateIndex]] = body.authors.length;
				fs.writeFile( 'data/raw/raw-exclusive-follower-count.json', JSON.stringify( data, null, 2 ), function ( error ) {
					setTimeout( makeRequest, 1000 );
				} );
			} else {
				console.log( error );
				console.log( resopnse );
				makeRequest();
			}			
		}
	} );

};

makeRequest();