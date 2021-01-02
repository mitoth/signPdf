using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;

namespace RedactMyPdf.Viewer.SignalR
{
    // ReSharper disable once ClassNeverInstantiated.Global
    public class FileProcessedHub : Hub
    {
        private readonly ILogger<FileProcessedHub> logger;

        public FileProcessedHub(ILogger<FileProcessedHub> logger)
        {
            this.logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            logger.LogInformation($"Connected client with id {Context.ConnectionId}");
            await base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception? exception)
        {
            logger.LogInformation($"Disconnected client with {Context.ConnectionId}");
            return base.OnDisconnectedAsync(exception);
        }
        
        // ReSharper disable once UnusedMember.Global
        // method called from the UI to get the connectionId
        public string GetConnectionId()
        {
            return Context.ConnectionId;
        }
    }
}