$('#name').keyup(function(){
    socket.emit( 'checkName', $('#name').val() );
});
socket.on('checkName', function(msg){
    if (msg) {
        $('#button').prop('disabled', false);
    } else {
        $('#button').prop('disabled', true);
    }
});