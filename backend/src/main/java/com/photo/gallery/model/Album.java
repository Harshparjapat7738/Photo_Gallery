package com.photo.gallery.model;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "albums")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Album {

    @Id
    private String albumId;

    @NotNull(message = "Album name is required")
    private String albumName;

    private String description;

    private String userId;

    private Instant createdAt;

    private Integer photoCount;

    private String coverImage;

}
