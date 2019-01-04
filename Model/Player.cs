using System;

namespace Soundboard.Server.Model
{
    public class Registration
    {
        public string Id { get; set; }
        public string Description { get; set; }
        public DateTime FirstRegistrationUtc { get; set; }
        public DateTime LastRegistrationUtc { get; set; }
}
}
