var suraj = suraj || {};

suraj.Audio = {};
suraj.Audio.sounds = {};

suraj.Audio.init = function(){
	if(window.AudioContext||window.webkitAudioContext){
		suraj.Audio._ctx = new (window.AudioContext||window.webkitAudioContext)();
		suraj.Audio._panner = suraj.Audio._ctx.createPanner();
		suraj.Audio._panner.connect(suraj.Audio._ctx.destination);
	}
	else {
		suraj.Audio._ctx = null;
	}

	suraj.Audio.posMultipler = 1.5;
};

suraj.Audio.init();

suraj.Audio.addSound = function(src, id, loop, callback, usePanner){
	var ctx = suraj.Audio._ctx;
	var audio = new Audio();
	
	if(ctx){
		var audio = { src: null, gainNode: null, bufferNode: null, loop: loop };
		var xhr = new XMLHttpRequest();
		xhr.responseType = 'arraybuffer';

		xhr.onload = function(){
			ctx.decodeAudioData(xhr.response, function(b){
				// Create Gain Node
				var gainNode = ctx.createGain();

				if(usePanner === true){
					gainNode.connect(suraj.Audio._panner);
				}
				else {
					gainNode.connect(ctx.destination);
				}

				// Add the audio source
				audio.src = b;

				//Remember the gain node
				audio.gainNode = gainNode;
				
				callback();
			}, function(e){
				console.error('Audio decode failed!', e);
			});
		};

		xhr.open('GET', src, true);
		xhr.send(null);
	}
	else {
		// Workaround for old Safari
		audio.addEventListener('canplay', function(){
			audio.pause();
			audio.currentTime = 0;

			callback();
		}, false);

		audio.autoplay = true;
		audio.loop = loop;
		audio.src = src;
	}
	
	suraj.Audio.sounds[id] = audio;
};

suraj.Audio.play = function(id){
	var ctx = suraj.Audio._ctx;

	if(ctx){
		var sound = ctx.createBufferSource();
		sound.connect(suraj.Audio.sounds[id].gainNode);
		
		sound.buffer = suraj.Audio.sounds[id].src;
		sound.loop = suraj.Audio.sounds[id].loop;

		suraj.Audio.sounds[id].gainNode.gain.value = 1;
		suraj.Audio.sounds[id].bufferNode = sound;

		sound.start ? sound.start(0) : sound.noteOn(0);
	}
	else {
		if(suraj.Audio.sounds[id].currentTime > 0){
			suraj.Audio.sounds[id].pause();
			suraj.Audio.sounds[id].currentTime = 0;
		}

		suraj.Audio.sounds[id].play();
	}
};

suraj.Audio.stop = function(id){
	var ctx = suraj.Audio._ctx;

	if(ctx){
		if(suraj.Audio.sounds[id].bufferNode !== null){
			var bufferNode = suraj.Audio.sounds[id].bufferNode;
			bufferNode.stop ? bufferNode.stop(ctx.currentTime) : bufferNode.noteOff(ctx.currentTime);
		}
	}
	else {
		suraj.Audio.sounds[id].pause();
		suraj.Audio.sounds[id].currentTime = 0;
	}
};

suraj.Audio.volume = function(id, volume){
	var ctx = suraj.Audio._ctx;

	if(ctx){
		suraj.Audio.sounds[id].gainNode.gain.value = volume;
	}
	else {
		suraj.Audio.sounds[id].volume = volume;
	}
};

suraj.Audio.setListenerPos = function(vec){
	if(suraj.Audio._ctx){
		var panner = suraj.Audio._panner;
		var vec2 = vec.normalize();
		panner.setPosition(
			vec2.x * suraj.Audio.posMultipler,
			vec2.y * suraj.Audio.posMultipler,
			vec2.z * suraj.Audio.posMultipler
		);
	}
};

suraj.Audio.setListenerVelocity = function(vec){
	if(suraj.Audio._ctx){
		var panner = suraj.Audio._panner;
		panner.setVelocity(vec.x, vec.y, vec.z);
	}
};