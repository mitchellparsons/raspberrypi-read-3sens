var gpio = require('rpi-gpio');

gpio.setup(22, gpio.DIR_OUT, write);

function write() {
    gpio.write(22, false, function(err) {
        if (err) throw err;
        console.log('Written to pin');
    });
}


function closePins() {
    gpio.destroy(function() {
        console.log('All pins unexported');
    });
}

// SIGTERM AND SIGINT will trigger the exit event.
process.once("SIGTERM", function () {
console.log('sigterm');
	process.exit(0);
});
process.once("SIGINT", function () {
console.log('sigint');
	process.exit(0);
});

process.once('exit', function(code){

    closePins();
    console.log('About to exit with code:', code);
});
closePins();
