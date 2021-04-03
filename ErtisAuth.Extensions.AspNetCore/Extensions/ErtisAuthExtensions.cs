using System;
using System.Linq;
using Ertis.Net.Rest;
using ErtisAuth.Extensions.AspNetCore.Configuration;
using ErtisAuth.Sdk.Configuration;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace ErtisAuth.Extensions.AspNetCore.Extensions
{
	public static class ErtisAuthExtensions
	{
		#region Methods

		public static void AddErtisAuth(this IServiceCollection services, Action<ErtisAuthBootloaderOptions> ertisAuthBootloaderOptions = null)
		{
			var options = new ErtisAuthBootloaderOptions();
			ertisAuthBootloaderOptions?.Invoke(options);

			// Configuration - ErtisAuthOptions
			if (options.SetConfiguration)
			{
				var configuration = BuildConfiguration(options.Environment);
				services.Configure<ErtisAuthOptions>(configuration.GetSection(options.ConfigurationSectionName));
				services.AddSingleton<IErtisAuthOptions>(sp => sp.GetRequiredService<IOptions<ErtisAuthOptions>>().Value);	
			}

			// RestHandler registration
			if (options.RegisterRestHandler)
			{
				services.AddSingleton(typeof(IRestHandler), options.RestHandlerType);	
			}

			// Service registrations
			if (options.InitializeServices)
			{
				InitializeServices(services);	
			}

			string schemeName = options.AuthorizationSchemeName;
			string policyName = options.AuthorizationPolicyName;
			
			// Authentication
			if (options.SetDefaultAuthenticationHandler)
			{
				services.AddAuthentication().AddScheme<AuthenticationSchemeOptions, ErtisAuthAuthenticationHandler>(schemeName, configureOptions =>
				{
					
				});	
			}

			// Authorization
			if (options.SetDefaultAuthorizationHandler)
			{
				services.AddAuthorization(authorizationOptions =>
					authorizationOptions.AddPolicy(policyName, policy =>
					{
						policy.AddAuthenticationSchemes(policyName);
						policy.AddRequirements(new ErtisAuthAuthorizationRequirement());
					}));
			
				services.AddSingleton<IAuthorizationHandler, ErtisAuthAuthorizationHandler>();	
			}
		}
		
		private static IConfigurationRoot BuildConfiguration(string environment = null)
		{
			var environmentName = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
			if (!string.IsNullOrEmpty(environment))
			{
				environmentName = environment;
			}
			
			if (string.IsNullOrEmpty(environmentName))
			{
				var builder = new ConfigurationBuilder()
					.AddJsonFile("appsettings.json")
					.AddEnvironmentVariables();
				return builder.Build();
			}
			else
			{
				var builder = new ConfigurationBuilder()
					.AddJsonFile("appsettings.json")
					.AddJsonFile($"appsettings.{environmentName}.json", true)
					.AddEnvironmentVariables();
				return builder.Build();
			}
		}

		private static void InitializeServices(IServiceCollection services)
		{
			var assemblies = AppDomain.CurrentDomain.GetAssemblies();
			var assembly = assemblies.FirstOrDefault(x => x.GetName().Name == "ErtisAuth.Sdk");
			if (assembly == null)
			{
				throw new TypeUnloadedException("ErtisAuth.Sdk assembly was not loaded!");
			}
			
			var types = assembly.GetTypes();
			var interfaces = types.Where(x => !string.IsNullOrEmpty(x.FullName) && x.IsInterface && x.FullName.StartsWith("ErtisAuth.Sdk.Services.Interfaces")).ToList();
			var implementations = types.Where(x => !string.IsNullOrEmpty(x.FullName) && x.IsClass && x.FullName.StartsWith("ErtisAuth.Sdk.Services"));
			foreach (var implementation in implementations)
			{
				var baseInterface = interfaces.FirstOrDefault(x => x.IsAssignableFrom(implementation));
				if (baseInterface != null)
				{
					services.AddSingleton(baseInterface, implementation);
					
					var interfaceName = baseInterface.Name;
					var serviceName = implementation.Name;
					Console.WriteLine($"{interfaceName} resolved as {serviceName}.");
				}
			}
		}

		#endregion
	}
}