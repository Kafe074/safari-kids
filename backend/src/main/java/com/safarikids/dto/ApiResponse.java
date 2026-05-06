package com.safarikids.dto;
import lombok.*;
@Data @AllArgsConstructor @NoArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    public static <T> ApiResponse<T> ok(T data) { return new ApiResponse<>(true, "OK", data); }
    public static <T> ApiResponse<T> ok(String msg, T data) { return new ApiResponse<>(true, msg, data); }
    public static <T> ApiResponse<T> error(String msg) { return new ApiResponse<>(false, msg, null); }
}
