using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;
using FluentAssertions;

namespace Fundo.Services.Tests.Integration.Fundo.Applications.WebApi.Controllers;

public class LoanManagementControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions = new() { PropertyNameCaseInsensitive = true };

    public LoanManagementControllerTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });
    }

    private async Task<string> GetAccessTokenAsync()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login", new { Email = "admin@fundo.com", Password = "P@ssw0rd!" });
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(content);
        return doc.RootElement.GetProperty("token").GetString()!;
    }

    private async Task AuthenticateClientAsync()
    {
        var token = await GetAccessTokenAsync();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
    }

    [Fact]
    public async Task GetLoans_WithoutToken_ReturnsUnauthorized()
    {
        var response = await _client.GetAsync("/api/loans");
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetLoans_WithToken_ReturnsPaginatedSeededLoans()
    {
        await AuthenticateClientAsync();

        var response = await _client.GetAsync("/api/loans?pageNumber=1&pageSize=10");
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var content = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(content);
        var items = doc.RootElement.GetProperty("items");
        items.GetArrayLength().Should().BeGreaterThanOrEqualTo(3);
        doc.RootElement.GetProperty("totalCount").GetInt32().Should().BeGreaterThanOrEqualTo(3);
    }

    [Fact]
    public async Task CreateLoan_WithValidData_ReturnsCreated()
    {
        await AuthenticateClientAsync();

        var payload = new { Amount = 10000m, ApplicantName = "Test Applicant" };
        var response = await _client.PostAsJsonAsync("/api/loans", payload);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var content = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(content);
        doc.RootElement.GetProperty("applicantName").GetString().Should().Be("Test Applicant");
        doc.RootElement.GetProperty("amount").GetDecimal().Should().Be(10000m);
        doc.RootElement.GetProperty("currentBalance").GetDecimal().Should().Be(10000m);
    }

    [Fact]
    public async Task GetLoanById_WithValidId_ReturnsLoan()
    {
        await AuthenticateClientAsync();

        // Get first loan from list
        var listResponse = await _client.GetAsync("/api/loans?pageNumber=1&pageSize=1");
        var listContent = await listResponse.Content.ReadAsStringAsync();
        using var listDoc = JsonDocument.Parse(listContent);
        var loanId = listDoc.RootElement.GetProperty("items")[0].GetProperty("id").GetGuid();

        var response = await _client.GetAsync($"/api/loans/{loanId}");
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var content = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(content);
        doc.RootElement.GetProperty("id").GetGuid().Should().Be(loanId);
    }

    [Fact]
    public async Task GetLoanById_WithInvalidId_ReturnsNotFound()
    {
        await AuthenticateClientAsync();

        var response = await _client.GetAsync($"/api/loans/{Guid.NewGuid()}");
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task MakePayment_WithValidAmount_UpdatesBalance()
    {
        await AuthenticateClientAsync();

        // Create a new loan for payment testing
        var createResponse = await _client.PostAsJsonAsync("/api/loans", new { Amount = 5000m, ApplicantName = "Payment Test" });
        var createContent = await createResponse.Content.ReadAsStringAsync();
        using var createDoc = JsonDocument.Parse(createContent);
        var loanId = createDoc.RootElement.GetProperty("id").GetGuid();

        var paymentPayload = new { Amount = 2000m, IdempotencyKey = Guid.NewGuid().ToString() };
        var response = await _client.PostAsJsonAsync($"/api/loans/{loanId}/payment", paymentPayload);
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var content = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(content);
        doc.RootElement.GetProperty("currentBalance").GetDecimal().Should().Be(3000m);
    }

    [Fact]
    public async Task MakePayment_WithDuplicateIdempotencyKey_ReturnsBadRequest()
    {
        await AuthenticateClientAsync();

        // Create a new loan
        var createResponse = await _client.PostAsJsonAsync("/api/loans", new { Amount = 5000m, ApplicantName = "Idempotency Test" });
        var createContent = await createResponse.Content.ReadAsStringAsync();
        using var createDoc = JsonDocument.Parse(createContent);
        var loanId = createDoc.RootElement.GetProperty("id").GetGuid();

        var idempotencyKey = Guid.NewGuid().ToString();
        var paymentPayload = new { Amount = 1000m, IdempotencyKey = idempotencyKey };

        var firstResponse = await _client.PostAsJsonAsync($"/api/loans/{loanId}/payment", paymentPayload);
        firstResponse.StatusCode.Should().Be(HttpStatusCode.OK);

        var secondResponse = await _client.PostAsJsonAsync($"/api/loans/{loanId}/payment", paymentPayload);
        secondResponse.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task MakePayment_Overpayment_ReturnsBadRequest()
    {
        await AuthenticateClientAsync();

        var createResponse = await _client.PostAsJsonAsync("/api/loans", new { Amount = 1000m, ApplicantName = "Overpayment Test" });
        var createContent = await createResponse.Content.ReadAsStringAsync();
        using var createDoc = JsonDocument.Parse(createContent);
        var loanId = createDoc.RootElement.GetProperty("id").GetGuid();

        var paymentPayload = new { Amount = 2000m, IdempotencyKey = Guid.NewGuid().ToString() };
        var response = await _client.PostAsJsonAsync($"/api/loans/{loanId}/payment", paymentPayload);
        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
