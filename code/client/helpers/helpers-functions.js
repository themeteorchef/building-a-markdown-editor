delay = ( function() {
  var timer = 0;
  var executeDelay = function( callback, ms ) {
    clearTimeout( timer );
    timer = setTimeout( callback, ms );
  };
  return executeDelay;
})();
