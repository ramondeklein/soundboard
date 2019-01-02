using System;
using System.Collections.Generic;

namespace Soundboard.Server.Services
{
    public class DbSample
    {
        public string Id { get; set; }
        public int PlayCount { get; set; }
        public DateTime AddedUtc { get; set; }
        public DateTime? LastPlayedUtc { get; set; }
        public List<DbLocation> Locations { get; set; }
    }
}
