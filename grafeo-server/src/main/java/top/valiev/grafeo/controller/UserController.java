package top.valiev.grafeo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import top.valiev.grafeo.exeption.ResourceNotFoundException;
import top.valiev.grafeo.model.User;
import top.valiev.grafeo.payload.*;
import top.valiev.grafeo.repository.IndicatorRepository;
import top.valiev.grafeo.repository.RecordRepository;
import top.valiev.grafeo.repository.UserRepository;
import top.valiev.grafeo.security.CurrentUser;
import top.valiev.grafeo.security.JwtTokenProvider;
import top.valiev.grafeo.security.UserPrincipal;
import top.valiev.grafeo.service.IndicatorService;
import top.valiev.grafeo.service.UserService;
import top.valiev.grafeo.util.AppConstants;

import javax.validation.Valid;
import java.net.URI;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private IndicatorRepository indicatorRepository;

    @Autowired
    private RecordRepository recordRepository;

    @Autowired
    private IndicatorService indicatorService;

    @Autowired
    private UserService userService;

    @Autowired
    JwtTokenProvider tokenProvider;

    @GetMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public UserSummary getCurrentUser(@CurrentUser UserPrincipal currentUser) {
        String newAccessToken = tokenProvider.generateToken(currentUser.getId());
        return new UserSummary(currentUser.getId(), currentUser.getUsername(), currentUser.getEmail(), currentUser.getName(), currentUser.getIsDemo(), currentUser.getIsSocialLogin(), newAccessToken);
    }

    @GetMapping("/profile")
    @PreAuthorize("hasRole('USER')")
    public UserProfile getUserProfile(@CurrentUser UserPrincipal currentUser) {

        User user = userRepository.findByUsername(currentUser.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", currentUser.getUsername()));

        long indicatorCount = indicatorRepository.countByCreatedBy(user.getId());
        long recordCount = recordRepository.countByCreatedBy(user.getId());

        return new UserProfile(user.getId(), user.getUsername(), user.getEmail(), user.getName(), user.getCreatedAt(), indicatorCount, recordCount);
    }

    @PostMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity updateCurrentUser(@CurrentUser UserPrincipal currentUser, @Valid @RequestBody ProfileRequest profileRequest) {
        User user = userRepository.findByUsername(currentUser.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", currentUser.getUsername()));

        User result = userService.updateUser(user, profileRequest);

        URI location = ServletUriComponentsBuilder
                .fromCurrentContextPath().path("/users/{username}")
                .buildAndExpand(result.getUsername()).toUri();

        return ResponseEntity.created(location).body(new ApiResponse(true, "Profile updated successfully"));
    }

    @GetMapping("/checkUsernameAvailability")
    public UserIdentityAvailability checkUsernameAvailability(@RequestParam(value = "username") String username) {
        Boolean isAvailable = !userRepository.existsByUsernameIgnoreCase(username.trim());
        return new UserIdentityAvailability(isAvailable);
    }

    @GetMapping("/checkEmailAvailability")
    public UserIdentityAvailability checkEmailAvailability(@RequestParam(value = "email") String email) {
        Boolean isAvailable = !userRepository.existsByEmailIgnoreCase(email.trim());
        return new UserIdentityAvailability(isAvailable);
    }

    @GetMapping("/{id}/indicators")
    @PreAuthorize("hasRole('USER')")
    public PagedResponse<IndicatorResponse> getIndicatorsCreatedBy(@PathVariable(value = "id") Long id,
                                                                   @CurrentUser UserPrincipal currentUser,
                                                                   @RequestParam(value = "page", defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
                                                                   @RequestParam(value = "size", defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size) {
        return indicatorService.getIndicatorsCreatedBy(id, page, size);
    }
}
