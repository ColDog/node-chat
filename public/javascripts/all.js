socket.on('alert', function(msg){
    $('#alert').text(msg)
});

function param(parent) {
    var arr = window.location.pathname.split('/');
    return arr[ arr.indexOf(parent) + 1 ]
}