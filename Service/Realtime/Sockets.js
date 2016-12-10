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
                emmiter.emit('socketio listen', io);
                
            });
            
        },
        
        onConnection: function(socket) {
            
            logger.info('sokect connection %s', socket.id);
            
            socket.on('login', api.onLogin.bind(socket));
            socket.on('disconnect', api.onDisconnect.bind(socket));
            socket.emit('login', socket.id);
            
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
