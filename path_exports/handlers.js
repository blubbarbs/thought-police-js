module.exports = {
    CommandHandler: require('@root/handlers/command/command_handler').CommandHandler,
    DataHandler: require('@root/handlers/data/data_handler').DataHandler,
    JingleHandler: require('@root/handlers/jingle/jingle_handler').JingleHandler,
    MudaeHandler: require('@root/handlers/mudae/mudae_handler').MudaeHandler,
    PointsHandler: require('@root/handlers/points/points_handler').PointsHandler,
    RoleHandler: require('@root/handlers/role/role_handler').RoleHandler,
    ScheduleHandler: require('@root/handlers/schedule/schedule_handler').ScheduleHandler
}
