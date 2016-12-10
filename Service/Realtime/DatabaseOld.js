var r = require('rethinkdb'),
    logger = require('./Logger'),
    dbConfig = {
        host: 'localhost',
        port: 28015,
        database: 'melisa',
        tables: [
            ''
        ]
    },
    api = {
        
        setup: function(host, port) {

            r.connect({
                host: host || dbConfig.host,
                port: port || dbConfig.port
            }, function(err, connection) {

                if( err) {

                    logger.error('Imposible connect RethinkDB database %s in port %s', dbConfig.host, dbConfig.port);
                    return;

                }
                
                logger.info('Success connect RethinkDB database %s in port %s', dbConfig.host, dbConfig.port);
                api.onSuccessConnect(connection);

            });

        },
        
        onSuccessConnect: function(connection) {
            
            r.dbCreate(dbConfig.database).run(connection, function(err, result) {
                
                if( err) {
                    
                    logger.error('RethinkDB database %s already exists (%s:%s)\n%s', dbConfig.database, err.name, err.msg, err.message);
                    return;
                    
                }
                
                logger.info('RethinkDB database %s created', dbConfig.database);
                
            });
            
        }    
        
    };

module.exports = api;
