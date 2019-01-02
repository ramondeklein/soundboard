using System;
using System.Collections.Generic;

namespace Soundboard.Server.Model
{
    public class Sample
    {
        public string Id { get; set; }
        public int PlayCount { get; set; }
        public DateTime AddedUtc { get; set; }
        public DateTime? LastPlayedUtc { get; set; }
        public IList<Location> Locations { get; set; }
    }
}
