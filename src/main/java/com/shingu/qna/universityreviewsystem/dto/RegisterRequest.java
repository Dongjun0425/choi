//회원가입 시 클라이언트가 보내는 요청 데이터를 담는 객체
package com.shingu.qna.universityreviewsystem.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    private String email;
    private String password;
    private String nickname;
}
