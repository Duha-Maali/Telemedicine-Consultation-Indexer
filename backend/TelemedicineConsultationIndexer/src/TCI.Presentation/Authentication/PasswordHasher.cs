using Konscious.Security.Cryptography;
using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using TCI.Business.Abstractions.Authentication;

namespace TCI.Presentation.Authentication;

public sealed class PasswordHasher : IPasswordHasher
{
    private const int SaltSize = 16;

    private const int HashSize = 32;

    // OWASP minimum recommended Argon2id configuration:
    // 19 MiB memory, 2 iterations, 1 degree of parallelism.

    private const int MemorySize = 10 * 1024;

    private const int Iterations = 2;

    private const int DegreeOfParallelism = 1;

    private const string AlgorithmName = "argon2id";

    private const int Argon2Version = 19;

    public string Hash(string password)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(password);

        var salt = RandomNumberGenerator.GetBytes(SaltSize);

        var hash = DeriveHash(
            password,
            salt,
            MemorySize,
            Iterations,
            DegreeOfParallelism,
            HashSize);

        return string.Create(
            CultureInfo.InvariantCulture,
            $"${AlgorithmName}$v={Argon2Version}$m={MemorySize}" +
            $",t={Iterations}," +
            $"p={DegreeOfParallelism}${Convert.ToBase64String(salt)}${Convert.ToBase64String(hash)}");
    }

    public bool Verify(
        string password, 
        string passwordHash)
    {
        if (string.IsNullOrWhiteSpace(password) ||
            string.IsNullOrWhiteSpace(passwordHash))
        {
            return false;
        }

        try
        {
            var parts = passwordHash.Split(
                '$',
                StringSplitOptions.RemoveEmptyEntries);

            if (parts.Length != 5)
            {
                return false;
            }

            if (!string.Equals(
                    parts[0],
                    AlgorithmName,
                    StringComparison.Ordinal))
            {
                return false;
            }

            if (!parts[1].StartsWith(
                    "v=",
                    StringComparison.Ordinal))
            {
                return false;
            }

            if (!int.TryParse(
                    parts[1][2..],
                    NumberStyles.None,
                    CultureInfo.InvariantCulture,
                    out var version) ||
                version != Argon2Version)
            {
                return false;
            }

            var parameters = ParseParameters(parts[2]);

            var salt = Convert.FromBase64String(parts[3]);
            var expectedHash = Convert.FromBase64String(parts[4]);

            var actualHash = DeriveHash(
                password,
                salt,
                parameters.MemorySize,
                parameters.Iterations,
                parameters.DegreeOfParallelism,
                expectedHash.Length);

            return CryptographicOperations.FixedTimeEquals(
                actualHash,
                expectedHash);
        }

        catch (FormatException)
        {
            return false;
        }

        catch (ArgumentException)
        {
            return false;
        }

        catch (OverflowException)
        {
            return false;
        }
    }

    private static byte[] DeriveHash(
        string password,
        byte[] salt,
        int memorySize,
        int iterations,
        int degreeOfParallelism,
        int hashSize)
    {
        var passwordBytes = Encoding.UTF8.GetBytes(password);

        using var argon2 = new Argon2id(passwordBytes)
        {
            Salt = salt,
            MemorySize = memorySize,
            Iterations = iterations,
            DegreeOfParallelism = degreeOfParallelism
        };

        return argon2.GetBytes(hashSize);
    }

    private static Argon2Parameters ParseParameters(string parameterSection)
    {
        var values = parameterSection.Split(
            ',',
            StringSplitOptions.RemoveEmptyEntries)
            .Select(part => part.Split('=', 2))
            .ToDictionary(
                part => part[0],
                part => part[1],
                StringComparer.Ordinal);

        if (!values.TryGetValue("m", out var memoryValue) ||
            !values.TryGetValue("t", out var iterationsValue) ||
            !values.TryGetValue("p", out var parallelismValue))
        {
            throw new FormatException("The stored Argon2 parameters are invalid.");
        }

        if (!int.TryParse(
                memoryValue,
                NumberStyles.None,
                CultureInfo.InvariantCulture,
                out var memorySize) ||
            !int.TryParse(
                iterationsValue,
                NumberStyles.None,
                CultureInfo.InvariantCulture,
                out var iterations) ||
            !int.TryParse(
                parallelismValue,
                NumberStyles.None,
                CultureInfo.InvariantCulture,
                out var degreeOfParallelism))
        {
            throw new FormatException("The stored Argon2 parameters are invalid.");
        }

        if (memorySize <= 0 ||
            iterations <= 0 ||
            degreeOfParallelism <= 0)
        {
            throw new FormatException("The stored Argon2 parameters are invalid.");
        }

        return new Argon2Parameters(
            memorySize,
            iterations,
            degreeOfParallelism);
    }

    private sealed record Argon2Parameters(
        int MemorySize,
        int Iterations,
        int DegreeOfParallelism);
}

