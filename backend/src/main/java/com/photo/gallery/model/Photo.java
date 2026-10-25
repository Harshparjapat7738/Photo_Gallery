package com.photo.gallery.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "photos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Photo {

    @Id
    private String imageId;

    private String albumId;

    private String imageTitle;

    private String imageDescription;

    @NotBlank(message = "Image URl is required")
    private String imageUrl;

    private Integer sortOrder;

    private Instant createdAt;

    private Instant updatedAt;

}
