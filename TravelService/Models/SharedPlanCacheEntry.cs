using System;
using System.Runtime.Serialization;

namespace TravelService.Models
{
    [DataContract]
    public class SharedPlanCacheEntry
    {
        [DataMember]
        public int TravelPlanId { get; set; }

        [DataMember]
        public string AccessType { get; set; } = string.Empty;

        [DataMember]
        public DateTime ExpiresAt { get; set; }
    }
}