using System;
using System.IO;
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

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.Configure<CookiePolicyOptions>(options =>
            {
                options.CheckConsentNeeded = context => true;
                options.MinimumSameSitePolicy = SameSiteMode.None;
            });
            services.AddCors(options => options.AddPolicy(CorsPolicy, builder =>
            {
                builder.AllowAnyMethod().AllowAnyHeader().AllowCredentials().WithOrigins("http://localhost:4200");
            }));
            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_2);
            services.AddSignalR();
            services.AddTransient<IHasher, MD5Hasher>();
            services.AddSingleton<ISamplesService, SamplesService>();
            services.AddSingleton<IRegistrationService, RegistrationService>();
            services.AddSingleton<ISamplesConfiguration>(new SamplesConfiguration(Configuration));
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            var soundBoardDirectory = Path.Combine(Directory.GetCurrentDirectory(), "Website/dist/soundboard");
            Directory.CreateDirectory(soundBoardDirectory);

            //app.UseHttpsRedirection();
            app.UseCookiePolicy();
            app.UseCors(CorsPolicy);
            app.UseDefaultFiles();
            app.UseStaticFiles(new StaticFileOptions { FileProvider = new PhysicalFileProvider(soundBoardDirectory) });
            app.UseSignalR(routes => routes.MapHub<SoundboardHub>("/api/hub"));
            app.UseMvc();

        }
    }

    public class SamplesConfiguration : ISamplesConfiguration
    {
        public SamplesConfiguration(IConfiguration configuration)
        {
            SamplesRoot = configuration["Soundboard:SamplesRoot"] ?? Environment.CurrentDirectory;
            Database = configuration["database"] ?? "Soundboard.db";
        }

        public string SamplesRoot { get; }

        public string Database { get; }
    }
}
