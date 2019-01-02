using System;

namespace Soundboard.Server.Services
{
    public class SampleNotFoundException : Exception
    {
        public string Id { get; }
        public SampleNotFoundException(string id) : base("The specified sample cannot be found.")
        {
            Id = id;
        }
    }

}
