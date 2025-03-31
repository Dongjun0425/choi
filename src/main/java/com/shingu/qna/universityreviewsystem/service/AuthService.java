//회원가입/로그인에 대한 비즈니스 로직 처리
package com.shingu.qna.universityreviewsystem.service;

import com.shingu.qna.universityreviewsystem.dto.LoginRequest;
import com.shingu.qna.universityreviewsystem.dto.RegisterRequest;
import com.shingu.qna.universityreviewsystem.entity.User;
import com.shingu.qna.universityreviewsystem.repository.UserRepository;
import com.shingu.qna.universityreviewsystem.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public void register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("이미 등록된 이메일입니다.");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setNickname(request.getNickname());
        userRepository.save(user);
    }

    public String login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("가입되지 않은 이메일입니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("비밀번호가 일치하지 않습니다.");
        }

        return JwtUtil.createToken(user.getEmail(), user.getRole());
    }
}
