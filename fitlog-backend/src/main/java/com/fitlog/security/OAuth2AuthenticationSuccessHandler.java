package com.fitlog.security;

import com.fitlog.service.OAuth2AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

  private static final Logger log = LoggerFactory.getLogger(OAuth2AuthenticationSuccessHandler.class);

  private final OAuth2AuthService oAuth2AuthService;
  private final HttpCookieOAuth2AuthorizationRequestRepository authorizationRequestRepository;
  private final String authorizedRedirectUri;

  public OAuth2AuthenticationSuccessHandler(
      OAuth2AuthService oAuth2AuthService,
      HttpCookieOAuth2AuthorizationRequestRepository authorizationRequestRepository,
      @Value("${app.oauth2.authorized-redirect-uri:http://localhost:5173/login}") String authorizedRedirectUri) {
    this.oAuth2AuthService = oAuth2AuthService;
    this.authorizationRequestRepository = authorizationRequestRepository;
    this.authorizedRedirectUri = authorizedRedirectUri;
  }

  @Override
  public void onAuthenticationSuccess(
      HttpServletRequest request,
      HttpServletResponse response,
      Authentication authentication) throws IOException {

    OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

    String sub = oAuth2User.getAttribute("sub");
    if (sub == null) {
      sub = oAuth2User.getName();
    }
    String email = oAuth2User.getAttribute("email");
    String name = oAuth2User.getAttribute("name");

    try {
      String token = oAuth2AuthService.processGoogleUser(sub, email, name);

      authorizationRequestRepository.removeAuthorizationRequestCookies(request, response);

      String targetUrl = UriComponentsBuilder.fromUriString(authorizedRedirectUri)
          .queryParam("token", token)
          .build().toUriString();

      getRedirectStrategy().sendRedirect(request, response, targetUrl);
    } catch (Exception ex) {
      log.error("Google OAuth2 processing failed: {}", ex.getMessage());
      authorizationRequestRepository.removeAuthorizationRequestCookies(request, response);

      String errorUrl = UriComponentsBuilder.fromUriString(authorizedRedirectUri)
          .queryParam("error", "OAuth2 authentication failed: " + ex.getMessage())
          .build().toUriString();

      getRedirectStrategy().sendRedirect(request, response, errorUrl);
    }
  }
}
