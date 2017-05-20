import axios from 'axios';
import baffle from 'baffle';

const getRecentTracksURL = "http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=getmicah&api_key=b4678efadfadbcf8882ed8e5432173b1&format=json";
const gibberish = ['\u2588','\u2593','\u2592','\u2591','\u2588','\u2593','\u2592','\u2591','\u2588','\u2593','\u2592','\u2591','\u003c','\u003e','\u002f'];

export default class nowPlaying {
	constructor(el) {
		this.el = baffle(el, {
			characters: gibberish,
			speed: 50
		});
		this.duration = 500;
		this.delay = 500;
	}
	fetch() {
		axios.get(getRecentTracksURL)
			.then(this.success.bind(this))
			.catch(this.fail.bind(this));
	}
	success(response) {
		let track = response.data.recenttracks.track[0];
		let data = track.artist['#text'] + ' - ' + track.name;
		this.show(data);
	}
	fail(error) {
		let data = 'Error: could\'t connect to last.fm';
		this.show(data, true);
	}
	show(data) {
		this.el.start().text(text => data).reveal(this.duration, this.delay);
	}
}
