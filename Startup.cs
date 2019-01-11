#if DEBUG
#define USE_CORS
#endif

using System;
using System.IO;
using System.Linq;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Soundboard.Server.Hubs;
using Soundboard.Server.Services;

namespace Soundboard.Server
{
    public class Startup
    {
        private const string CorsPolicy = "CorsPolicy";
        private readonly string[] _corsOrigins;

        public Startup(IConfiguration configuration)
        {
            _corsOrigins = (configuration["Soundboard:CorsOrigins"] ?? string.Empty).Split(new[] { ';', ',' }, StringSplitOptions.RemoveEmptyEntries);
        }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            if (_corsOrigins.Any())
            {
                services.Configure<CookiePolicyOptions>(options =>
                {
                    options.CheckConsentNeeded = context => true;
                    options.MinimumSameSitePolicy = SameSiteMode.None;
                });
                services.AddCors(options => options.AddPolicy(CorsPolicy, builder =>
                {
                    builder.AllowAnyMethod().AllowAnyHeader().AllowCredentials().WithOrigins(_corsOrigins);
                }));
            }
            services.AddMvc();
            services.AddSignalR();
            services.AddTransient<IHasher, MD5Hasher>();
            services.AddSingleton<ISamplesService, SamplesService>();
            services.AddSingleton<IRegistrationService, RegistrationService>();
            services.AddSingleton<ISamplesConfiguration, SamplesConfiguration>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
#if DEBUG
            app.UseDeveloperExceptionPage();
#endif
            if (_corsOrigins.Any())
            {
                app.UseCookiePolicy();
                app.UseCors(CorsPolicy);
            }
            app.UseDefaultFiles();
            app.UseStaticFiles();
            app.UseSignalR(routes => routes.MapHub<SoundboardHub>("/api/hub"));
            app.UseMvc();
        }
    }
}
