//프론트엔드에서 오는 요청을 처리하는 진입점 (REST API 컨트롤러)
package com.shingu.qna.universityreviewsystem.controller;

import com.shingu.qna.universityreviewsystem.dto.LoginRequest;
import com.shingu.qna.universityreviewsystem.dto.RegisterRequest;
import com.shingu.qna.universityreviewsystem.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok("회원가입 성공");
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest request) {
        String token = authService.login(request);
        return ResponseEntity.ok(Map.of("token", token));
    }
}
