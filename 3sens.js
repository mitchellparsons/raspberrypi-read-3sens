var rc522 = require("rc522-rfid2");

var Q = require("q");

var gpio = require('rpi-gpio');

var resetA = 16;
var resetB = 18;
var resetC = 15;

var pinCursor = 1;
 
function gpioWrite(pin,val){
    var deferred = Q.defer();
    gpio.write(pin, val,deferred.resolve);
    return deferred.promise;
}

function setupPin(pin){
    var deferred = Q.defer();
    gpio.setup(pin,gpio.DIR_OUT,deferred.resolve);
    return deferred.promise;
}

function setupGpio(){
    var deferred = Q.defer();
    var promises = [];
    promises.push(setupPin(resetA));
    promises.push(setupPin(resetB));
    promises.push(setupPin(resetC));
    return Q.all(promises);
}

function blankAll(){
var t = false;
  var promises = [
    gpioWrite(resetA, t),
    gpioWrite(resetB, t),
    gpioWrite(resetC, t)
  ];
  return Q.all(promises);
}

function setPin(pin){
  return gpioWrite(pin, true);
}

function setStater(state){
  if(state === 1)
    return setPin(resetA);
  else if(state === 2)
    return setPin(resetB);
  else if(state === 3)
    return setPin(resetC);
  console.log('state not properly set');
}

function setState(state){
    var promises = [];
    if(state === 1){
      promises.push(gpioWrite(resetA,true));
      promises.push(gpioWrite(resetB,false));
      promises.push(gpioWrite(resetC,false));
    }else if(state === 2){
      promises.push(gpioWrite(resetA,false));
      promises.push(gpioWrite(resetB,true));
      promises.push(gpioWrite(resetC,false));
    } else  if(state === 3){
      promises.push(gpioWrite(resetA,false));
      promises.push(gpioWrite(resetB,false));
      promises.push(gpioWrite(resetC,true));
    }
    return Q.all(promises);
}


function loop(cur){
  
  console.log('starting loop: ' + cur);
//  setupGpio()
  blankAll()
  .then(delay)
  .then(function(){
      return setStater(cur);
  })
  .then(delay)
  .then(function(){
      return rc522.takeReading(10000);
  })
  .then(function(val){
      console.log(val);
      cur = cur + 1;
      if(cur > 3) cur = 1;
      longDelay()
      .then(setupGpio)
      .then(function(){	
        loop(cur);
      });
  })
  .catch(function(val){
    console.log('failed to read for state ' + cur);
    loop(cur);
  });

}

setupGpio()
.then(function(){
  loop(1);
});

function delay(){
    var deferred = Q.defer();
    setTimeout(function(){deferred.resolve();},50);
    return deferred.promise;
}

function longDelay(){
    var deferred = Q.defer();
    setTimeout(function(){deferred.resolve();},5000);
    return deferred.promise;
}
