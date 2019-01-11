using System;
using System.IO;
using System.Linq;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Soundboard.Server.Services;
using Soundboard.Server.Hubs;

namespace Soundboard.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var configurationBuilder = new ConfigurationBuilder()
                .AddJsonFile("appsettings.json");
#if DEBUG
            configurationBuilder.AddJsonFile("appsettings.debug.json", optional: true);
#endif

            var configuration = configurationBuilder.Build();
            var soundBoardDirectory = Path.Combine(Directory.GetCurrentDirectory(), configuration["Soundboard:WebsiteRoot"]);
            var soundBoardUrls = configuration["Soundboard:Urls"] ?? "http://0.0.0.0:5000";

            var webHostBuilder = new WebHostBuilder()
                .UseKestrel()
                .UseConfiguration(configuration)
                .ConfigureLogging((hostingContext, logging) =>
                {
                    logging.AddConfiguration(configuration.GetSection("Logging"));
                    logging.AddConsole();
#if DEBUG
                    logging.AddDebug();
#endif
                })
                .UseUrls(soundBoardUrls)
                .UseWebRoot(soundBoardDirectory)
                .UseStartup<Startup>();

            using (var webHost = webHostBuilder.Build())
            {
                webHost.Run();
            }
        }
    }
}
