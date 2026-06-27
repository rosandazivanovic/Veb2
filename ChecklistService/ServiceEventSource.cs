using System.Diagnostics.Tracing;

namespace ChecklistService
{
    [EventSource(Name = "MyCompany-TravelPlannerApp-ChecklistService")]
    internal sealed class ServiceEventSource : EventSource
    {
        public static readonly ServiceEventSource Current = new ServiceEventSource();

        private ServiceEventSource() : base() { }

        public static class Keywords
        {
            public const EventKeywords Requests = (EventKeywords)0x1L;
            public const EventKeywords ServiceInitialization = (EventKeywords)0x2L;
        }

        private const int ServiceTypeRegisteredEventId = 3;
        [Event(ServiceTypeRegisteredEventId, Level = EventLevel.Informational,
            Message = "Service host process {0} registered service type {1}",
            Keywords = Keywords.ServiceInitialization)]
        public void ServiceTypeRegistered(int hostProcessId, string serviceType)
            => WriteEvent(ServiceTypeRegisteredEventId, hostProcessId, serviceType);

        private const int ServiceHostInitializationFailedEventId = 4;
        [Event(ServiceHostInitializationFailedEventId, Level = EventLevel.Error,
            Message = "Service host initialization failed",
            Keywords = Keywords.ServiceInitialization)]
        public void ServiceHostInitializationFailed(string exception)
            => WriteEvent(ServiceHostInitializationFailedEventId, exception);
    }
}