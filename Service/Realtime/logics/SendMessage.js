var emmiter = require(__dirname + '/../Emitter'),
    Identity = require(__dirname + '/../models/identities'),
    Message = require(__dirname + '/../models/messages'),
    logger = require(__dirname + '/../Logger'),
    thinky = require(__dirname + '/../util/thinky.js'),
    Errors = thinky.Errors,
    r = thinky.r,
    api = {
        
        setup: function() {
            
            emmiter.on('socketio send message', api.onSendMessage);
            
        },
        
        onSendMessage: function(idSocket, idIdentityReceiver, message, idMessageLocal) {
            
            var message = {
                message: message,
                idIdentityReceiver: idIdentityReceiver,
                idMessageLocal: idMessageLocal,
                idSocket: idSocket
            };
            
            Identity.filter(function(record) {
                
                return record('idSocket').match(idSocket);
                
            }).run().then(api.saveMessage.bind(message)).
            error(function(error) {
                
                emmiter.emit('identity error receive message', error.message);
                
            });
            
        },
        
        saveMessage: function(identity) {
            
            if( typeof identity[0] === 'undefined') {
                
                console.log('error no exist identity');
                return;
                
            }
            
            var message = new Message({
                idIdentityTransmitter: identity[0].id,
                idIdentityReceiver: this.idIdentityReceiver,
                idMessageLocal: this.idMessageLocal,
                status: 'server-received',
                dateReceived: r.now(),
                message: this.message
            });
            
            message.save().then(api.sendMessage.bind(message, this.idSocket)).
            error(function(error) {
                
                logger.error('send message failure, imposible save', error.message);
                emmiter.emit('send message failure', error.message);
                
            });;
            
        },
        
        sendMessage: function(idSocket) {
            
            var message = this;
            
            logger.info('send message saved success', message.id);
            emmiter.emit('message received', idSocket, message.idMessageLocal, message.idIdentityReceiver);
            
            Identity.filter(function(record) {
                
                return record('id').match(message.idIdentityReceiver);
                
            }).then(function(identity) {
                
                if( typeof identity[0] === 'undefined') {
                    
                    logger.error('send message failure, no exist identity send');
                    return;
                    
                }
                
                emmiter.emit('send message', identity[0].idSocket, message);
                
            }).error(function(error) {
                
                logger.error('send message failure, %s', error.message);
                emmiter.emit('send message failure', error.message);
                
            });
            
        }
        
    };
    
module.exports = {
    setup: api.setup
};
