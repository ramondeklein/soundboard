namespace Soundboard.Server.Services
{
    public class DbLocation
    {
        public string Title { get; set; }
        public string Category { get; set; }
        public string Filename { get; set; }
        public int? Volume { get; set; }
        public int? StartOffsetMs {get;set;}
        public int? EndOffsetMs {get;set;}
    }
}
