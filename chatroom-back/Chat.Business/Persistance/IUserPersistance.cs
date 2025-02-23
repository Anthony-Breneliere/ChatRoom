using JetBrains.Annotations;
using Chat.Model;
using Microsoft.AspNetCore.Identity;

namespace Chat.Business.Persistance;


/// <summary>
/// Represents a repository for persisting and managing platform users
/// </summary>
public interface IUserPersistance
{
    /// <summary>
    /// Gets all users ids.
    /// </summary>
    /// <returns>All users.</returns>
    [MustUseReturnValue]
    public Task<IEnumerable<Guid>> GetUsersIdsAsync();

    /// <summary>
    /// Gets the user with the specified email.
    /// </summary>
    /// <param name="email">The email of the user.</param>
    /// <returns>The user with the specified email, or <see langword="null"/> if no user was found.</returns>
    [MustUseReturnValue]
    Task<User?> GetUserByEmailAsync(string email);

    /// <summary>
    /// Gets the user with the specified ID.
    /// </summary>
    /// <param name="id">The ID of the user.</param>
    /// <returns>The user with the specified ID, or <see langword="null"/> if no user was found.</returns>
    [MustUseReturnValue]
    Task<User?> GetUserById(Guid id);

    /// <summary>
    /// Gets the user with the specified username.
    /// </summary>
    /// <param name="username">The username of the user.</param>
    /// <returns>The user with the specified username, or <see langword="null"/> if no user was found.</returns>
    [MustUseReturnValue]
    Task<User?> GetUserByUsernameAsync(string username);

    /// <summary>
    /// Gets a user's roles with a specified username.
    /// </summary>
    /// <param name="username">The username of the user.</param>
    /// <returns>The roles of the user with the specified username.</returns>
    [MustUseReturnValue]
    Task<IList<string>> GetUserRolesAsync(string username);

    /// <summary>
    /// Creates a new user with the specified email and password.
    /// </summary>
    /// <param name="email">The email of the user.</param>
    /// <param name="password">The password of the user.</param>
    /// <returns>The created user.</returns>
    /// <exception cref="ArgumentException">Thrown if the email is already in use.</exception>
    /// <exception cref="ArgumentException">Thrown if the password is invalid.</exception>
    /// <exception cref="InvalidOperationException">Thrown if the user could not be created.</exception>
    Task<User> CreateUserAsync(string email, string password);

    /// <summary>
    /// Creates a new user using the specified user object, and connection info.
    /// </summary>
    /// <param name="user">The user to create.</param>
    /// <param name="connections">The connections to associate with the user.</param>
    /// <returns>The created user.</returns>
    Task<User> CreateUserAsync(User user, params UserLoginInfo[] connections);

    /// <summary>
    /// Logs in a user with the specified email and password.
    /// </summary>
    /// <param name="email">The email of the user.</param>
    /// <param name="password">The password provided by the user.</param>
    /// <returns>The logged in user.</returns>
    /// <exception cref="Exception">Thrown if the user is not found.</exception>
    /// <exception cref="Exception">Thrown if the password is invalid.</exception>
    Task<User> LoginAsync(string email, string password);

    /// <summary>
    /// Update a user
    /// </summary>
    /// <param name="existingUser"></param>
    Task UpdateUser(User existingUser);
}