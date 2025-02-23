using System.ComponentModel.DataAnnotations;
using MapsterMapper;
using Chat.Business.Persistance;
using Chat.Model;
using Chat.Model.Auth;
using ChatRoom.ApiModel;
using Mapster;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Throw;
using System.Threading.Tasks;

namespace Chat.Api.Controllers;

/// <summary>
/// Provides a controller for registering and managing users.
/// </summary>
[ApiController, Route("api/user"), Authorize]
public class UserController : UserControllerBase
{
    private readonly IUserPersistance _userPersistance;
    private readonly IMapper _mapper;

    /// <summary>
    /// Initializes a new instance of the <see cref="UserController"/> class.
    /// </summary>
    /// <param name="userPersistance">The user service.</param>
    /// <param name="mapper">Maspter mapper</param>
    public UserController(IUserPersistance userPersistance, IMapper mapper)
    {
        _userPersistance = userPersistance;
        _mapper = mapper;
    }
    
    
    /// <summary>
    /// Lists the IDs of all users in the platform.
    /// </summary>
    /// <returns>All users in the platform.</returns>
    /// <response code="200">The users were fetched successfully.</response>
    /// <response code="401">The user is not authenticated.</response>
    /// <response code="403">The user is not authorized to view users.</response>
    /// <response code="500">The users could not be fetched.</response>
    [HttpGet, Authorize(Roles = Roles.SuperAdmin)]
    [ProducesResponseType(200, Type = typeof(IAsyncEnumerable<Guid>))]
    public async Task<IEnumerable<Guid>> ListUsersIds()
    {
        IEnumerable<Guid> uids = await _userPersistance.GetUsersIdsAsync();
        return uids;
    }
    
    /// <summary>
    /// Fetches the user with the specified ID.
    /// </summary>
    /// <param name="id">The ID of the user.</param>
    /// <returns>The user with the specified ID.</returns>
    /// <response code="200">The user was fetched successfully.</response>
    /// <response code="401">The user is not authenticated.</response>
    /// <response code="403">The user is not authorized to view users.</response>
    /// <response code="404">The user with the specified ID was not found.</response>
    /// <response code="500">The user could not be fetched.</response>
    [HttpGet("{id:guid}"), Authorize(Roles = Roles.SuperAdmin)]
    [ProducesResponseType(200, Type = typeof(UserDto))]
    public async Task<UserDto> GetUser(Guid id)
    {
        User? user = (await _userPersistance.GetUserById(id)).ThrowIfNull();
        return user.Adapt<UserDto>();
    }
    
    /// <summary>
    /// Fetches the user with the specified email.
    /// </summary>
    /// <param name="email">The email of the user.</param>
    /// <returns>The user with the specified email.</returns>
    /// <response code="200">The user was fetched successfully.</response>
    /// <response code="401">The user is not authenticated.</response>
    /// <response code="403">The user is not authorized to view users.</response>
    /// <response code="404">The user with the specified email was not found.</response>
    /// <response code="500">The user could not be fetched.</response>
    [HttpGet("{email}"), Authorize(Roles = Roles.SuperAdmin)]
    [ProducesResponseType(200, Type = typeof(UserDto))]
    public async Task<UserDto> GetUserAsync([EmailAddress] string email)
    {
        User user = (await _userPersistance.GetUserByEmailAsync(email)).ThrowIfNull();
        return user.Adapt<UserDto>();
    }
    
    /// <summary>
    /// Registers a new user with the specified email and password.
    /// </summary>
    /// <param name="email">The email of the user.</param>
    /// <param name="password">The password of the user.</param>
    /// <returns>The created user.</returns>
    /// <response code="200">The user was created successfully.</response>
    /// <response code="400">The email is already in use or the password is invalid.</response>
    /// <response code="500">The user could not be created.</response>
    [HttpPost("register"), AllowAnonymous, Obsolete("Use the GET /api/auth/login/{provider} endpoint instead.")]
    [ProducesResponseType(200), ProducesResponseType(400), ProducesResponseType(500)]
    public async Task<IActionResult> RegisterAsync(string email, string password)
    {
        try
        {
            User user = await _userPersistance.CreateUserAsync(email, password);
            return Ok(user.Id);
        }
        catch (ArgumentException e)
        {
            return BadRequest(e.Message);
        }
    }
    
    /// <summary>
    /// Fetches the current user's information.
    /// </summary>
    /// <returns>The current user's information.</returns>
    /// <response code="200">The user was fetched successfully.</response>
    /// <response code="401">The user is not authenticated.</response>
    /// <response code="500">The user could not be fetched.</response>
    [HttpGet("self")]
    public UserDto GetSelf()
    {
        User user = PlatformUser.ThrowIfNull();
        return user.Adapt<UserDto>();
    }
    
    /// <summary>
    /// Updates the current user's information.
    /// </summary>
    /// <param name="userDto">The user's updated information.</param>
    /// <returns>The updated user's information.</returns>
    /// <response code="205">The user was updated successfully.</response>
    /// <response code="400">The user's information is invalid.</response>
    /// <response code="401">The user is not authenticated.</response>
    /// <response code="500">The user could not be updated.</response>
    [HttpPut("self")]
    public async Task<ActionResult> UpdateSelfAsync(UserDto userDto)
    {
        User current = PlatformUser.ThrowIfNull();
        userDto.Id = current.Id;
        
        User existing = (await _userPersistance.GetUserById(userDto.Id)).ThrowIfNull();
        
        // Mapping UserDto to User
        existing.Email = userDto.Email;
        existing.FirstName = userDto.FirstName;
        existing.LastName = userDto.LastName;
        existing.PhoneNumber = userDto.PhoneNumber;
        
        await _userPersistance.UpdateUser(existing);
        
        return AcceptedAtAction(nameof(GetSelf), _mapper.Map<UserDto>(existing));
    }
    
}