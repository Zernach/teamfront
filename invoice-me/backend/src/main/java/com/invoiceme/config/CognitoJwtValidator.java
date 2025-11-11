package com.invoiceme.config;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.RSASSAVerifier;
import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.nimbusds.jwt.proc.BadJWTException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.net.URL;
import java.text.ParseException;

/**
 * Validates Cognito JWT tokens by fetching public keys from Cognito's JWKS endpoint.
 */
@Component
public class CognitoJwtValidator {
    private final String userPoolId;
    private final String region;
    private final String jwksUrl;
    private JWKSet jwkSet;
    private long jwkSetExpiry = 0;
    private static final long JWK_SET_CACHE_DURATION = 3600000; // 1 hour

    public CognitoJwtValidator(
            @Value("${aws.cognito.user-pool-id}") String userPoolId,
            @Value("${aws.cognito.region:us-west-1}") String region) {
        this.userPoolId = userPoolId;
        this.region = region;
        this.jwksUrl = String.format("https://cognito-idp.%s.amazonaws.com/%s/.well-known/jwks.json", region, userPoolId);
    }

    public JWTClaimsSet validateToken(String token) throws ParseException, JOSEException, BadJWTException {
        // Refresh JWK set if expired
        if (jwkSet == null || System.currentTimeMillis() > jwkSetExpiry) {
            refreshJwkSet();
        }

        // Parse signed JWT
        SignedJWT signedJWT = SignedJWT.parse(token);
        
        // Get key ID from token header
        String kid = signedJWT.getHeader().getKeyID();
        if (kid == null) {
            throw new BadJWTException("Token missing key ID");
        }

        // Find the key in JWK set
        JWK jwk = jwkSet.getKeyByKeyId(kid);
        if (jwk == null) {
            throw new BadJWTException("Key not found in JWK set");
        }

        // Ensure it's an RSA key
        if (!(jwk instanceof RSAKey)) {
            throw new BadJWTException("Key is not an RSA key");
        }
        RSAKey rsaKey = (RSAKey) jwk;

        // Verify the signature
        JWSVerifier verifier = new RSASSAVerifier(rsaKey.toRSAPublicKey());
        if (!signedJWT.verify(verifier)) {
            throw new BadJWTException("Invalid token signature");
        }

        // Get claims
        JWTClaimsSet claimsSet = signedJWT.getJWTClaimsSet();

        // Validate token claims
        validateClaims(claimsSet);

        return claimsSet;
    }

    private void refreshJwkSet() {
        try {
            URL url = new URL(jwksUrl);
            try (InputStream inputStream = url.openStream()) {
                jwkSet = JWKSet.load(inputStream);
                jwkSetExpiry = System.currentTimeMillis() + JWK_SET_CACHE_DURATION;
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to fetch JWK set from Cognito", e);
        }
    }

    private void validateClaims(JWTClaimsSet claimsSet) throws BadJWTException, ParseException {
        // Validate issuer
        String issuer = claimsSet.getIssuer();
        String expectedIssuer = String.format("https://cognito-idp.%s.amazonaws.com/%s", region, userPoolId);
        if (!expectedIssuer.equals(issuer)) {
            throw new BadJWTException("Invalid issuer: " + issuer);
        }

        // Validate token use (should be "access" for access tokens)
        String tokenUse = claimsSet.getStringClaim("token_use");
        if (!"access".equals(tokenUse)) {
            throw new BadJWTException("Invalid token use: " + tokenUse);
        }

        // Validate expiration
        if (claimsSet.getExpirationTime() == null || claimsSet.getExpirationTime().before(new java.util.Date())) {
            throw new BadJWTException("Token has expired");
        }
    }
}

