using Microsoft.ServiceFabric.Services.Communication.AspNetCore;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using System.Fabric;

namespace ExpenseService
{
    internal sealed class ExpenseService : StatelessService
    {
        public ExpenseService(StatelessServiceContext context)
            : base(context) { }

        protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners()
        {
            return new[]
            {
                new ServiceInstanceListener(serviceContext =>
                    new KestrelCommunicationListener(serviceContext, "ServiceEndpoint", (url, listener) =>
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
                                services.AddSingleton<StatelessServiceContext>(serviceContext);
                            })
                            .UseContentRoot(Directory.GetCurrentDirectory())
                            .UseStartup<ExpenseStartup>()
                            .UseServiceFabricIntegration(listener, ServiceFabricIntegrationOptions.None)
                            .UseUrls(url)
                            .Build();
                    }))
            };
        }
    }
}