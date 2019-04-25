package ru.valaz.grafeo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import ru.valaz.grafeo.exeption.AppException;
import ru.valaz.grafeo.model.Role;
import ru.valaz.grafeo.model.RoleName;
import ru.valaz.grafeo.model.User;
import ru.valaz.grafeo.payload.*;
import ru.valaz.grafeo.repository.RoleRepository;
import ru.valaz.grafeo.repository.UserRepository;
import ru.valaz.grafeo.security.JwtTokenProvider;
import ru.valaz.grafeo.service.DemoService;
import ru.valaz.grafeo.service.FacebookService;

import javax.validation.Valid;
import javax.validation.constraints.NotBlank;
import java.net.URI;
import java.util.Collections;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    JwtTokenProvider tokenProvider;

    @Autowired
    private DemoService demoService;

    @Autowired
    private FacebookService facebookService;

    @PostMapping("/signin")
    public ResponseEntity authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsernameOrEmail(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateToken(authentication);
        return ResponseEntity.ok(new JwtAuthenticationResponse(jwt));
    }

    @PostMapping("/fb/login")
    public ResponseEntity authenticateFacebookUser(@Valid @RequestBody FBLoginRequest fbLoginRequest) {

        if (!facebookService.isValidUserToken(fbLoginRequest.getToken(), fbLoginRequest.getUserId())) {
            return ResponseEntity.badRequest().build();
        }
        @NotBlank String fbUserId = fbLoginRequest.getUserId();
        @NotBlank String fbEmail = fbLoginRequest.getEmail();
        @NotBlank String fbName = fbLoginRequest.getName();
        if (!userRepository.existsByFacebookUserId(fbUserId)) {
            if (userRepository.existsByUsernameIgnoreCase(fbEmail) || userRepository.existsByEmailIgnoreCase(fbEmail)) {
                return ResponseEntity.badRequest().body("Email already used");
            }
            // Creating user's account
            User user = new User(fbName.trim(), fbEmail.trim(), fbEmail.trim(), fbUserId);
            user.setFacebookUserId(fbUserId);

            user.setPassword(passwordEncoder.encode(user.getPassword()));

            Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                    .orElseThrow(() -> new AppException("User Role not set."));

            user.setRoles(Collections.singleton(userRole));

            userRepository.save(user);
        } else {
            Optional<User> fbUser = userRepository.findByFacebookUserId(fbUserId);
            if (!fbUser.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            User user = fbUser.get();
            if (!fbEmail.equals(user.getEmail())) {
                user.setEmail(fbEmail);
            }
            if (!fbEmail.equals(user.getUsername())) {
                user.setUsername(fbEmail);
            }
            userRepository.save(user);
        }

        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(fbEmail, fbUserId));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateToken(authentication);
        return ResponseEntity.ok(new JwtAuthenticationResponse(jwt));

    }

    @PostMapping("demo/signin")
    public ResponseEntity demoAuthenticateUser() {

        User demoUser = demoService.generateDemoUser();
        String jwt = tokenProvider.generateToken(demoUser);
        return ResponseEntity.ok(new JwtAuthenticationResponse(jwt));
    }

    @PostMapping("/signup")
    public ResponseEntity registerUser(@Valid @RequestBody SignUpRequest signUpRequest) {
        if (userRepository.existsByUsernameIgnoreCase(signUpRequest.getUsername())) {
            return new ResponseEntity(new ApiResponse(false, "Username is already taken!"),
                    HttpStatus.BAD_REQUEST);
        }

        if (userRepository.existsByEmailIgnoreCase(signUpRequest.getEmail())) {
            return new ResponseEntity(new ApiResponse(false, "Email Address already in use!"),
                    HttpStatus.BAD_REQUEST);
        }

        // Creating user's account
        User user = new User(signUpRequest.getName().trim(), signUpRequest.getUsername().trim(),
                signUpRequest.getEmail().trim(), signUpRequest.getPassword().trim());

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                .orElseThrow(() -> new AppException("User Role not set."));

        user.setRoles(Collections.singleton(userRole));

        User result = userRepository.save(user);

        URI location = ServletUriComponentsBuilder
                .fromCurrentContextPath().path("/users/{username}")
                .buildAndExpand(result.getUsername()).toUri();

        return ResponseEntity.created(location).body(new ApiResponse(true, "User registered successfully"));
    }
}
