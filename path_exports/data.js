const { DataHandler } = require('@root/handlers/data/data_handler');

module.exports = {
    ServerSettings: DataHandler.cache('server_settings'),
    UserData: DataHandler.cache('user_data'),
    RoleData: DataHandler.cache('role_data')
}