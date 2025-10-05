exports = {
  onTicketCreateHandler: function (args) {
    console.log('Hello ' + args['data']['requester']['name']);
  },
  
  onAppInstallHandler: function (args) {
    console.info('onAppInstallHandler invoked with following data: \n', args);
  },
  
  onAppUninstallHandler: function (args) {
    console.log('onAppUninstalHandler invoked with following data: \n', args);
  }
};
