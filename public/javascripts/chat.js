var socket = io();

socket.on('connect', function(){
    console.log('Connected to server');

    socket.emit('join', function(err){
        if(err){
            alert(err);
        } else {
            console.log("No error");
        }
    })
});