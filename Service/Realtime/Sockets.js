var server = require('./Https'),
    io = require('socket.io')(server),
    logger = require('./Logger'),
    emmiter = require('./Emitter'),
    api = {
        
        setup: function() {
            
            server.listen(8044, function() {
                
                io.on('connection', api.onConnection);
                emmiter.on('login failure', api.onLoginFailure);
                emmiter.on('login success', api.onLoginSuccess);
                emmiter.on('send message', api.onSendMessage);
                emmiter.on('message received', api.onMessageReceived);
                emmiter.emit('socketio listen', io);
                
            });
            
        },
        
        onConnection: function(socket) {
            
            logger.info('sokect connection %s', socket.id);
            
            socket.on('login', api.onLogin.bind(socket));
            socket.on('disconnect', api.onDisconnect.bind(socket));
            socket.on('identity writing', api.onIdentityWriting.bind(socket));
            socket.on('identity send message', api.onIdentitySendMessage.bind(socket));
            socket.emit('login', socket.id);
            
        },
        
        onMessageReceived: function(idSocket, idMessageLocal, idIdentityReceiver) {
            
            logger.info('send message received to %s', idSocket);
            io.to(idSocket).emit('message received', idMessageLocal, idIdentityReceiver);
            
        },
        
        onSendMessage: function(idSocket, message) {
            
            io.to(idSocket).emit('identity send message', JSON.stringify(message));
            
            logger.info('send message success to', idSocket);
            
        },
        
        onIdentitySendMessage: function(idIdentity, message, idMessageLocal) {
            
            logger.info('sokect send message %s', message);
            emmiter.emit('socketio send message', this.id, idIdentity, message, idMessageLocal);
            
        },
        
        onIdentityWriting: function(idSocket, idSocketEmisor) {
            
            console.log(arguments);
            io.to(idSocket).emit('identity writing', idSocketEmisor);
            
        },
        
        onDisconnect: function() {
            
            logger.info('sokect disconnect %s', this.id);
            emmiter.emit('socketio disconnect', this.id);
            io.emit('identity disconnected', this.id);
            
        },
        
        onLogin: function(data) {
            
            emmiter.emit('socketio login', this, data);
            
        },
        
        onLoginFailure: function(message) {
            
            logger.info('sokectio login failure %s', message);
            
        },
        
        onLoginSuccess: function(socket, identities, identity) {
            
            logger.info('list identities %s', identities.length);
            socket.emit('list identities', JSON.stringify(identities));
            socket.broadcast.emit('identity connected', JSON.stringify(identity));
            
        }
        
    };

module.exports = {
    setup: api.setup
};
