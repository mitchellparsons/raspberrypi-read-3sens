var rc522 = require("rc522-rfid2");

var Q = require("q");

var gpio = require('rpi-gpio');

var resetA = 16;
var resetB = 18;

//gpio.setup(resetA, gpio.DIR_OUT, write);
//gpio.setup(reset, gpio.DIR_OUT, write);


//gpio.setup(resetA, gpio.DIT_OUT, function(){
//    spiRead(resetA);
//});

function write() {
    gpio.write(18, true, function(err) {
        if (err) throw err;
        console.log('starting read');
        rc522(function(rfidSerialNumber){
            console.log(rfidSerialNumber);
        });
    });
}



function spiRead(sensor){
    gpioWrite(resetA,true)
      .then(function(){
          gpioWrite(resetB,true)
      })
      .then(function(){
        rc522(function(rfidSerialNumber){
          console.log(rfidSerialNumber);
        });
      });

}
 
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
    return Q.all(promises);
}

function setState(state){
    return Q.all([
        gpioWrite(resetA,state),
        gpioWrite(resetB,!state)]);
}

function swapState(val){
    setState(val)
    .then(function(){
        rc522(function(rfidSerialNumber){
            console.log(rfidSerialNumber);
        });
    });
    setTimeout(function(){
        console.log('swapping state: ' + val);
        swapState(!val);
    },2000);
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
  //  console.log('read: ' + val); 
//    console.log('all done!');
    if(val != 'noneff') console.log(val);
    loop(!cur);
});

}

loop(true);
