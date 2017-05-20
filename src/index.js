require('../index.html');
require('../scss/main.scss');
import LastFmGrabber from './LastFmGrabber';
import { Constellations } from 'canvas-effects';

let nowPlaying = new LastFmGrabber('#now-playing');
nowPlaying.fetch();

const starryNight = new Constellations({
	container: '#foo',
	width: '100%',
	height: '100%',
	seed: 6000,
	point: {
		color: [120,120,120,1]
	},
	line: {
		color: [120,120,120,1]
	}
});
