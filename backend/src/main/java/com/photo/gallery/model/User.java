package com.photo.gallery.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Generated;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
@AllArgsConstructor
@Data
@NoArgsConstructor
public class User {

    @Id
    private String userId;

    @NotNull(message = "Name is required")
    private String name;

    @NotNull(message = "User Name is required")
    private String userName;

    @NotNull(message = "Email is required")
    @Email(message = "Enter a valid email address")
    private String email;

    @NotBlank(message = "Password is required")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    private String profilePicture;


}
