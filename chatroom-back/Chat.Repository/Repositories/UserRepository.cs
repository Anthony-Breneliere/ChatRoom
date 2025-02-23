using System.Security.Authentication;
using JetBrains.Annotations;
using Chat.Business.Persistance;
using Chat.Model;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Chat.Repository.Repositories;

/// <summary>
/// Represents a service for creating and managing platform users, using ASP.NET Core Identity as backing.
/// </summary>
public class UserRepository : IUserPersistance
{
    private readonly UserManager<User> _userManager;

    /// <summary>
    /// Initializes a new instance of the <see cref="UserRepository"/> class.
    /// </summary>
    /// <param name="userManager">The user manager.</param>
    public UserRepository(UserManager<User> userManager)
    {
        _userManager = userManager;
    }

    /// <inheritdoc />
    [MustUseReturnValue]
    public async Task<IEnumerable<Guid>> GetUsersIdsAsync() => await _userManager.Users.Select(u => u.Id).ToArrayAsync();

    /// <inheritdoc />
    [MustUseReturnValue]
    public async Task<User?> GetUserByEmailAsync(string email) => await _userManager.FindByEmailAsync(email);

    /// <inheritdoc />
    [MustUseReturnValue]
    public async Task<User?> GetUserById(Guid id) => await _userManager.Users.FirstOrDefaultAsync(u => u.Id == id);

    /// <inheritdoc />
    [MustUseReturnValue]
    public async Task<User?> GetUserByUsernameAsync(string username) =>
        await _userManager.Users.FirstOrDefaultAsync(u => u.UserName == username);

    /// <inheritdoc />
    [MustUseReturnValue]
    public async Task<IList<string>> GetUserRolesAsync(string username)
        => await _userManager.GetRolesAsync((await GetUserByUsernameAsync(username))
                                            ?? throw new ApplicationException($"{nameof(GetUserByUsernameAsync)} No username ${username}"));

    /// <inheritdoc />
    public async Task<User> CreateUserAsync(string email, string password)
    {
        Guid uid = Guid.NewGuid();
        User user = new User
        {
            Id = uid,
            UserName = uid.ToString(),
            Email = email
        };

        IdentityResult result = await _userManager.CreateAsync(user, password);

        if (!result.Succeeded)
        {
            throw new InvalidOperationException("Could not create user : " + string.Join(", ", result.Errors));
        }

        return user;
    }

    /// <inheritdoc />
    public async Task<User> CreateUserAsync(User user, params UserLoginInfo[] connections)
    {
        IdentityResult result = await _userManager.CreateAsync(user);

        if (!result.Succeeded)
        {
            throw new InvalidOperationException("Could not create user : " + string.Join(", ", result.Errors.Select(e => e.Description)));
        }

        foreach (UserLoginInfo connection in connections)
        {
            await _userManager.AddLoginAsync(user, connection);
        }

        await _userManager.UpdateAsync(user);
        return user;
    }

    /// <inheritdoc />
    public async Task<User> LoginAsync(string email, string password)
    {
        if (await _userManager.FindByEmailAsync(email) is not { } user)
        {
            throw new AuthenticationException("User not found.");
        }

        if (!await _userManager.CheckPasswordAsync(user, password))
        {
            throw new AuthenticationException("Invalid password.");
        }

        return user;
    }

    /// <inheritdoc />
    public async Task UpdateUser(User existingUser)
    {
        await _userManager.UpdateAsync(existingUser);
    }
}

