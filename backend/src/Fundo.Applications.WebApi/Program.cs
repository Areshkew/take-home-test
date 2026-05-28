using Fundo.Applications.WebApi.Data;

var builder = WebApplication.CreateBuilder(args);

// Use Startup class for configuration
var startup = new Fundo.Applications.WebApi.Startup(builder.Configuration);
startup.ConfigureServices(builder.Services);

var app = builder.Build();

startup.Configure(app, app.Environment);

if (!app.Environment.IsEnvironment("Testing"))
{
    await DbInitializer.SeedAsync(app.Services);
}

app.Run();
