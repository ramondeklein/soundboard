#if DEBUG
#define USE_CORS
#endif

using System;
using Microsoft.Extensions.Configuration;
using Soundboard.Server.Services;

namespace Soundboard.Server
{
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
