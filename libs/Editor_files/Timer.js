/*!
 * @class suraj.Timer
 *
 * new Date().getTime() wrapper to use as timers.
 * 
 * @author SURAJ SR ABUBAKAR'
 */

/**
 * RAF shim
 */
window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

/*!
 * @package suraj
 */
var suraj = suraj || {};

/*!
 * Creates a new timer, inactive by default.
 * Call Timer.start() to activate.
 */
suraj.Timer = function()
{
	this.time = {
		start: 0,
		current: 0,
		previous: 0,
		elapsed: 0,
		delta: 0
	}

	this.active = false;
}

/*!
 * Starts/restarts the timer.
 */
suraj.Timer.prototype.start = function()
{
	var now = new Date().getTime();

	this.time.start = now;
	this.time.current = now;
	this.time.previous = now;
	this.time.elapsed = 0;
	this.time.delta = 0;

	this.active = true;
}

/*!
 * Restarts timer, returning last ms tick
 */
suraj.Timer.prototype.restart = function()
{
	var now = new Date().getTime();
	var e = now - this.time.start;

	this.time.start = now;
	this.time.current = now;
	this.time.previous = now;
	this.time.elapsed = 0;
	this.time.delta = 0;

	this.active = true;

	return e;
}

/*!
 * Pauses(true)/Unpauses(false) the timer.
 *
 * @param bool Do pause
 */
suraj.Timer.prototype.pause = function(bool)
{
	this.active = !bool;
}

/*!
 * Update method to be called inside a RAF loop
 */
suraj.Timer.prototype.update = function()
{
	if(!this.active) return;

	var now = new Date().getTime();

	this.time.current = now;
	this.time.elapsed = this.time.current - this.time.start;
	this.time.delta = now - this.time.previous;
	this.time.previous = now;

	return this.time.elapsed;
}

/*!
 * Returns elapsed milliseconds
 */
suraj.Timer.prototype.getElapsed = function()
{
	return this.time.elapsed;
}

/*!
 * Returns a formatted version of the current elapsed time using msToTime().
 *
 * 
 */
suraj.Timer.prototype.getElapsedTime = function()
{
	return suraj.Timer.msToTime(this.time.elapsed);
}

/*!
 * Formats a millisecond integer into a h/m/s/ms object
 * 
 * @param x int In milliseconds
 * @return Object{h,m,s,ms}
 */
suraj.Timer.msToTime = function(t)
{
	var ms, s, m, h;
	
	ms = t%1000;

	s = Math.floor((t/1000)%60);

	m = Math.floor((t/60000)%60);
	h = Math.floor((t/3600000));

	return {h:h, m:m, s:s, ms:ms};
}

/*!
 * Formats a millisecond integer into a h/m/s/ms object with prefix zeros
 * 
 * @param x int In milliseconds
 * @return Object<string>{h,m,s,ms}
 */
suraj.Timer.msToTimeString = function(t)
{
	var ms, s, m, h;
	
	ms = t%1000;
	if(ms < 10) ms = "00"+ms;
	else if(ms < 100) ms = "0"+ms;

	s = Math.floor((t/1000)%60);
	if(s < 10) s = "0"+s;

	m = Math.floor((t/60000)%60);
	h = Math.floor((t/3600000));

	return {h:h, m:m, s:s, ms:ms};
}