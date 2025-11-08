using Microsoft.AspNetCore.Mvc;

namespace SmartScheduler.Controllers;

[ApiController]
[Route("[controller]")]
public class HelloController : ControllerBase
{
    [HttpGet]
    public string Get()
    {
        return "Hello World from Smart Scheduler Backend!";
    }
}

