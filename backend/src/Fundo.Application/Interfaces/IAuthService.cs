namespace Fundo.Application.Interfaces;

public interface IAuthService
{
    string GenerateToken(Guid userId, string email, string role);
    bool VerifyPassword(string password, string passwordHash);
    string HashPassword(string password);
}
