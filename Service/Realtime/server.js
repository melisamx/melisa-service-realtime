var database = require('./Database'),
    sockects = require('./Sockets'),
    login = require('./logics/Login'),
    disconnect = require('./logics/Disconnect'),
    initial = require('./logics/Initial');

database.setup();
initial.setup();
sockects.setup();
login.setup();
disconnect.setup();
