using System;
using System.Collections.Generic;
using System.Fabric;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.ServiceFabric.Data;
using Microsoft.ServiceFabric.Services.Communication.AspNetCore;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;

namespace TravelService
{
    internal sealed class TravelService : StatefulService
    {
        public TravelService(StatefulServiceContext context)
            : base(context) { }

        protected override IEnumerable<ServiceReplicaListener> CreateServiceReplicaListeners()
        {
            return new[]
            {
                new ServiceReplicaListener(serviceContext =>
                    new KestrelCommunicationListener(serviceContext, (url, listener) =>
                    {
                        return new WebHostBuilder()
                            .UseKestrel()
                            .ConfigureAppConfiguration((ctx, config) =>
                            {
                                config.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                                      .AddEnvironmentVariables();
                            })
                            .ConfigureServices(services =>
                            {
                                services.AddSingleton<StatefulServiceContext>(serviceContext);

                                services.AddSingleton<IReliableStateManager>(this.StateManager);
                            })
                            .UseContentRoot(Directory.GetCurrentDirectory())
                            .UseStartup<TravelStartup>()
                            .UseServiceFabricIntegration(listener, ServiceFabricIntegrationOptions.UseUniqueServiceUrl)
                            .UseUrls(url)
                            .Build();
                    }))
            };
        }
    }
}