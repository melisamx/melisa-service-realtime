var emmiter = require(__dirname + '/../Emitter'),
    logger = require(__dirname + '/../Logger'),
    nsp,
    api = {
        
        setup: function() {
            
            emmiter.on('socketio listen', api.onSocketListen);
            emmiter.on('login success', api.onLoginSuccess);
            emmiter.on('send message', api.onSendMessage);
            emmiter.on('message received', api.onMessageReceived);
            
        },
        
        onSocketListen: function(io) {
            
            nsp = io.of('/chat');
            nsp.on('connection', api.onConnection);
            
        },
        
        onConnection: function(socket) {
            
            logger.info('socket connection in room chat %s', socket.id);
            
            socket.on('login', api.onLogin.bind(socket));
            socket.on('disconnect', api.onDisconnect.bind(socket));
            socket.on('identity writing', api.onIdentityWriting.bind(socket));
            socket.on('identity send message', api.onIdentitySendMessage.bind(socket));
            socket.emit('login', socket.id);
            
        },
        
        onDisconnect: function() {
            
            nsp.emit('socket disconnected', this.id);
            
        },
        
        onLogin: function(data) {
            
            logger.info('socket on login in room chat');
            emmiter.emit('socketio login', this, data);
            
        },
        
        onLoginSuccess: function(socket, identities, identity) {
            
            logger.info('list identities on chat room %s', identities.length);
            socket.emit('list identities', JSON.stringify(identities));
            socket.broadcast.emit('identity connected', JSON.stringify(identity));
            
        },
        
        onIdentityWriting: function(idSocket, idSocketEmisor) {
            
            console.log(arguments);
            nsp.to(idSocket).emit('identity writing', idSocketEmisor);
            
        },        
        
        onIdentitySendMessage: function(idIdentity, message, idMessageLocal) {
            
            logger.info('socket send message %s', message);
            emmiter.emit('socketio send message', this.id, idIdentity, message, idMessageLocal);
            
        },
        
        onSendMessage: function(idSocket, message) {
            
            nsp.to(idSocket).emit('identity send message', JSON.stringify(message));
            
            logger.info('send message success to', idSocket);
            
        },
        
        onMessageReceived: function(idSocket, idMessageLocal, idIdentityReceiver) {
            
            logger.info('send message received to %s', idSocket);
            nsp.to(idSocket).emit('message received', idMessageLocal, idIdentityReceiver);
            
        }
        
    };
    
module.exports = api;
