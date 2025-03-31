//DB에 직접 접근해서 사용자 정보를 가져오거나 저장
package com.shingu.qna.universityreviewsystem.repository;

import com.shingu.qna.universityreviewsystem.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}

