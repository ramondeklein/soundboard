using System;

namespace Soundboard.Server.Services
{
    public class SampleNotFoundOnDiskException : Exception
    {
        public string Id { get; }
        public SampleNotFoundOnDiskException(string id) : base("The specified sample cannot be found on disk.")
        {
            Id = id;
        }

    }

}
