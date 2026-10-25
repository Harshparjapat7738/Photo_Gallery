package com.photo.gallery.security;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public final class SessionAuth {

    public static final String USER_ID_ATTRIBUTE = SessionAuth.class.getName() + ".userId";

    private SessionAuth() {
    }

    public static String requireUserId(HttpSession session) {
        Object userId = session == null ? null : session.getAttribute(USER_ID_ATTRIBUTE);
        if (userId instanceof String id && !id.isBlank()) {
            return id;
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sign in to continue");
    }
}
