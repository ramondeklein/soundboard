using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Threading;
using System.Threading.Tasks;

using LiteDB;

using Soundboard.Server.Model;

namespace Soundboard.Server.Services
{
    public class SamplesService : ISamplesService
    {
        const string SamplesTable = "samples";

        private readonly string _samplesRoot;
        private readonly string _databaseFile;
        private readonly IHasher _hasher;
        private readonly object _scanLock = new object();
        private readonly IList<QueuedSample> _playList = new List<QueuedSample>();

        public SamplesService(ISamplesConfiguration samplesConfiguration, IHasher hasher)
        {
            if (samplesConfiguration == null)
                throw new ArgumentNullException(nameof(samplesConfiguration));
            _samplesRoot = samplesConfiguration.SamplesRoot.Replace('\\', '/');
            if (!_samplesRoot.EndsWith('/'))
                _samplesRoot = _samplesRoot + '/';
            _databaseFile = samplesConfiguration.Database;
            _hasher = hasher;
        }

        public void Scan()
        {
            lock (_scanLock)
            {
                var diskSamples = GetSamplesFromDisk();
                using (var db = GetDatabase())
                {
                    var sampleCollection = db.GetCollection<DbSample>(SamplesTable);
                    sampleCollection.EnsureIndex(x => x.Id);

                    foreach (var diskSample in diskSamples.Values)
                    {
                        var matchedSample = sampleCollection.FindOne(s => s.Id == diskSample.Id);
                        if (matchedSample == null)
                        {
                            // New item, so insert the sample
                            diskSample.AddedUtc = DateTime.UtcNow;
                            sampleCollection.Insert(diskSample);
                        }
                        else
                        {
                            var isUpdated = false;

                            // Remove all locations that don't match anymore
                            foreach (var location in matchedSample.Locations.ToList())
                            {
                                if (!diskSample.Locations.Any(l => l.Filename.Equals(location.Filename, StringComparison.InvariantCultureIgnoreCase)))
                                {
                                    matchedSample.Locations.Remove(location);
                                    isUpdated = true;
                                }
                            }

                            // Add all new locations
                            foreach (var location in diskSample.Locations)
                            {
                                if (!matchedSample.Locations.Any(l => l.Filename.Equals(location.Filename, StringComparison.InvariantCultureIgnoreCase)))
                                {
                                    matchedSample.Locations.Add(location);
                                    isUpdated = true;
                                }
                            }

                            if (isUpdated)
                                sampleCollection.Update(matchedSample);
                        }
                    }
                }
            }
        }

        public IEnumerable<Sample> GetSamples()
        {
            using (var db = GetDatabase())
            {
                var sampleCollection = db.GetCollection<DbSample>(SamplesTable);
                var samples = sampleCollection.FindAll();

                return samples.Select(Convert);
            }
        }

        private static Sample Convert(DbSample s) 
        {
            return new Sample
                {
                    Id = s.Id,
                    AddedUtc = s.AddedUtc,
                    LastPlayedUtc = s.LastPlayedUtc,
                    PlayCount = s.PlayCount,
                    Locations = new List<Location>(s.Locations.Select(l => new Location
                    {
                        Category = l.Category,
                        Title = l.Title ?? Path.GetFileNameWithoutExtension(l.Filename)
                    }))
                };
        }

        public void EnqueueSample(QueuedSample sample)
        {
            using (var db = GetDatabase())
            {
                var sampleCollection = db.GetCollection<DbSample>(SamplesTable);
                var sampleData = sampleCollection.FindOne(s => s.Id == sample.SampleId);
                if (sampleData == null)
                    throw new SampleNotFoundException(sample.SampleId);

                if (!sampleData.Locations.Any(l =>
                    l.Category.Equals(sample.Category, StringComparison.InvariantCultureIgnoreCase) &&
                    (l.Title ?? Path.GetFileNameWithoutExtension(l.Filename)).Equals(sample.Title, StringComparison.InvariantCultureIgnoreCase)))
                {
                    throw new SampleNotFoundException(sample.SampleId);
                }
            }

            lock (_playList)
            {
                _playList.Add(sample);
            }
        }

        public QueuedSample PopSample()
        {
            lock (_playList)
            {
                var firstSample = _playList.FirstOrDefault();
                if (firstSample != null)
                    _playList.RemoveAt(0);
                return firstSample;
            }
        }

        public void ClearPlayList()
        {

            lock (_playList)
            {
                _playList.Clear();
            }
        }
        
        public string GetSampleFile(string id)
        {
            using (var db = GetDatabase())
            {
                var sampleCollection = db.GetCollection<DbSample>(SamplesTable);

                var sampleData = sampleCollection.FindOne(s => s.Id == id);
                if (sampleData == null)
                    throw new SampleNotFoundException(id);

                var location = sampleData.Locations.Select(l => Path.Combine(_samplesRoot, l.Filename)).FirstOrDefault(File.Exists);
                return location ?? throw new SampleNotFoundException(id);
            }
        }

        public Sample MarkSampleAsPlayed(string id)
        {
            using (var db = GetDatabase())
            {
                var sampleCollection = db.GetCollection<DbSample>(SamplesTable);

                var sampleData = sampleCollection.FindOne(s => s.Id == id);
                if (sampleData == null)
                    throw new SampleNotFoundException(id);

                sampleData.LastPlayedUtc = DateTime.UtcNow;
                ++sampleData.PlayCount;
                sampleCollection.Update(sampleData);

                return Convert(sampleData);
            }
        }

        private LiteDatabase GetDatabase() => new LiteDatabase(Path.Combine(_samplesRoot, _databaseFile));

        private IReadOnlyDictionary<string, DbSample> GetSamplesFromDisk()
        {
            var sampleMap = new Dictionary<string, DbSample>();

            var directoryInfo = new DirectoryInfo(_samplesRoot);
            if (directoryInfo.Exists)
                ScanSamplesInFolder(sampleMap, directoryInfo, "/");
            return sampleMap;
        }

        private void ScanSamplesInFolder(IDictionary<string, DbSample> sampleMap, DirectoryInfo folder, string category)
        {
            foreach (var subfolder in folder.GetDirectories())
                ScanSamplesInFolder(sampleMap, subfolder, $"{category}{subfolder.Name}/");

            foreach (var sampleFile in folder.GetFiles("*.mp3"))
            {
                var hash = _hasher.GetHashFromFile(sampleFile.FullName);
                if (!sampleMap.TryGetValue(hash, out var sample))
                {
                    sample = new DbSample { Id = hash, Locations = new List<DbLocation>(1) };
                    sampleMap.Add(hash, sample);
                }
                var fileName = sampleFile.FullName.Substring(_samplesRoot.Length);
                sample.Locations.Add(new DbLocation { Category = category, Filename = fileName });
            }
        }
    }
}
