package com.fitlog.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
public class OAuth2AuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {

  private static final Logger log = LoggerFactory.getLogger(OAuth2AuthenticationFailureHandler.class);

  private final HttpCookieOAuth2AuthorizationRequestRepository authorizationRequestRepository;
  private final String authorizedRedirectUri;

  public OAuth2AuthenticationFailureHandler(
      HttpCookieOAuth2AuthorizationRequestRepository authorizationRequestRepository,
      @Value("${app.oauth2.authorized-redirect-uri:http://localhost:5173/login}") String authorizedRedirectUri) {
    this.authorizationRequestRepository = authorizationRequestRepository;
    this.authorizedRedirectUri = authorizedRedirectUri;
  }

  @Override
  public void onAuthenticationFailure(
      HttpServletRequest request,
      HttpServletResponse response,
      AuthenticationException exception) throws IOException {

    log.warn("OAuth2 authentication failure: {}", exception.getMessage());
    authorizationRequestRepository.removeAuthorizationRequestCookies(request, response);

    String targetUrl = UriComponentsBuilder.fromUriString(authorizedRedirectUri)
        .queryParam("error", "Google authentication failed: " + exception.getMessage())
        .build().toUriString();

    getRedirectStrategy().sendRedirect(request, response, targetUrl);
  }
}
