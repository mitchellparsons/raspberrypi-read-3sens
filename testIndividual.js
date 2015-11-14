var rc522 = require("rc522-rfid2");

var Q = require("q");

var gpio = require('rpi-gpio');

var state = process.argv[2];
console.log('starting state: ' + state);


var resetA = 16;
var resetB = 18;
var resetC = 15;

console.log('starting!')

setupGpio()
.then(blankPins)
.then(function(){
  console.log('waiting 500');
  var deferred = Q.defer();
  setTimeout(function(){
    deferred.resolve();
  },500);
  return deferred.promise;
})
.then(function(){
  return setState(state);
})
.then(function(){ 
  return rc522.takeReading(40000);
})
.then(function(val){
  console.log(val);
  console.log('ending!');
});


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

function blankPins(){
    console.log('blanking pins');
    var promises = [];
    promises.push(gpioWrite(resetA,false));
    promises.push(gpioWrite(resetB,false));
    promises.push(gpioWrite(resetC,false));
    return Q.all(promises);  
}

function setState(state){
    var promises = [];
    if(state == 1){
      console.log('state is 1');
      promises.push(gpioWrite(resetA,false));
      promises.push(gpioWrite(resetB,true));
      promises.push(gpioWrite(resetC,false));
    }else if(state == 2){
      console.log('state is 2');
      promises.push(gpioWrite(resetA,true));
      promises.push(gpioWrite(resetB,false));
      promises.push(gpioWrite(resetC,false));
    } else  if(state == 3){
      console.log('state is 3');
      promises.push(gpioWrite(resetA,false));
      promises.push(gpioWrite(resetB,false));
      promises.push(gpioWrite(resetC,true));
    }
    return Q.all(promises);
}


function loop(cur){
  console.log('starting loop: ' + cur);
  setupGpio()
  .then(function(){
      return setState(cur);
  })
  .then(function(){
      return rc522.takeReading(4000);
  })
  .then(function(val){
      if(val !== 'none') 
        console.log(val);
      cur = cur + 1;
      if(cur > 3) cur = 1;
      loop(cur);
  });

}

//loop(1);
