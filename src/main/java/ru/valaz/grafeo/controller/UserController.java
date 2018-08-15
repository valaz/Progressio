package ru.valaz.grafeo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import ru.valaz.grafeo.exeption.ResourceNotFoundException;
import ru.valaz.grafeo.model.User;
import ru.valaz.grafeo.payload.*;
import ru.valaz.grafeo.repository.IndicatorRepository;
import ru.valaz.grafeo.repository.RecordRepository;
import ru.valaz.grafeo.repository.UserRepository;
import ru.valaz.grafeo.security.CurrentUser;
import ru.valaz.grafeo.security.UserPrincipal;
import ru.valaz.grafeo.service.IndicatorService;
import ru.valaz.grafeo.service.UserService;
import ru.valaz.grafeo.util.AppConstants;

import javax.validation.Valid;
import java.net.URI;

@RestController
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

    @GetMapping("/user/me")
    @PreAuthorize("hasRole('USER')")
    public UserSummary getCurrentUser(@CurrentUser UserPrincipal currentUser) {
        return new UserSummary(currentUser.getId(), currentUser.getUsername(), currentUser.getEmail(), currentUser.getName(), currentUser.getIsDemo());
    }

    @GetMapping("/users/profile")
    @PreAuthorize("hasRole('USER')")
    public UserProfile getUserProfile(@CurrentUser UserPrincipal currentUser) {

        User user = userRepository.findByUsername(currentUser.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", currentUser.getUsername()));

        long indicatorCount = indicatorRepository.countByCreatedBy(user.getId());
        long recordCount = recordRepository.countByCreatedBy(user.getId());

        return new UserProfile(user.getId(), user.getUsername(), user.getEmail(), user.getName(), user.getCreatedAt(), indicatorCount, recordCount);
    }

    @PostMapping("/user/me")
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

    @GetMapping("/user/checkUsernameAvailability")
    public UserIdentityAvailability checkUsernameAvailability(@RequestParam(value = "username") String username) {
        Boolean isAvailable = !userRepository.existsByUsernameIgnoreCase(username.trim());
        return new UserIdentityAvailability(isAvailable);
    }

    @GetMapping("/user/checkEmailAvailability")
    public UserIdentityAvailability checkEmailAvailability(@RequestParam(value = "email") String email) {
        Boolean isAvailable = !userRepository.existsByEmailIgnoreCase(email.trim());
        return new UserIdentityAvailability(isAvailable);
    }

    @GetMapping("/users/{username}/indicators")
    @PreAuthorize("hasRole('USER')")
    public PagedResponse<IndicatorResponse> getIndicatorsCreatedBy(@PathVariable(value = "username") String username,
                                                                   @CurrentUser UserPrincipal currentUser,
                                                                   @RequestParam(value = "page", defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
                                                                   @RequestParam(value = "size", defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size) {
        return indicatorService.getIndicatorsCreatedBy(username, page, size);
    }
}
