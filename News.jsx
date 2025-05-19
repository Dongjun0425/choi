import React from 'react';
import { useNavigate } from 'react-router-dom';

function News() {
    // 페이지 이동을 위한 navigate 함수 생성
    const navigate = useNavigate();

    // 공지 목록 데이터
    const announcements = [
        {
            id: 1,
            title: "신구",
            content: "Shingu",
            image: "https://i.namu.wiki/i/MvxviED-As23tzAx7u-5niU47UqzpdECHeahRWGJ1GdQCnbi77Jqn3Qxvtl6Wb-TTs73rXtcKQlRhfvWmCQ4NxffHLxCM2M4EcAC07vlkSG3e6a46z_rLeWbw2Q6ofGZF6_JwW-xB25dyke0ZTEpaA.svg"
        },
        {
            id: 2,
            title: "참치앤김치",
            content: "참치에는 와인!",
            image: "https://flexible.img.hani.co.kr/flexible/normal/900/675/imgdb/original/2021/0825/20210825503877.jpg"
        },
        {
            id: 3,
            title: "오늘의 교보문고",
            content: "BEST 추천 책",
            image: "https://contents.kyobobook.co.kr/sih/fit-in/458x0/pdt/9791191114768.jpg"
        },
    ];

    // 공지 클릭 시 해당 공지 상세 페이지로 이동
    const handleAnnouncementClick = (announcement) => {
        navigate(`/announcement/${announcement.id}`, { state: announcement });
    };

    // 스타일 정의
    const rootStyle = {
        width: "100%",
        maxWidth: "1900px",
        margin: "50px auto 0 auto",
        textAlign: "center",
        background: "#ffffff"
    };

    const containerStyle = {
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "20px",
        padding: "20px",
    };

    const cardStyle = {
        width: "300px",
        border: "1px solid #ddd",
        borderRadius: "10px",
        overflow: "hidden",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        cursor: "pointer",
        backgroundColor: "#fff",
        transition: "transform 0.3s, box-shadow 0.3s",
    };

    return (
        <div style={rootStyle}>
            {/* 제목 및 안내문구 */}
            <div style={{ marginTop: "60px" }}>
                <h1 style={{ fontSize: "40px", fontWeight: "bold", color: "#333" }}>뉴스</h1>
                <p style={{ fontSize: "18px", color: "#666" }}>아래 뉴스를 클릭하여 자세한 내용을 확인하세요.</p>
            </div>

            {/* 공지 카드 목록 */}
            <div style={containerStyle}>
                {announcements.map((announcement) => (
                    <div
                        key={announcement.id}
                        style={cardStyle}
                        onClick={() => handleAnnouncementClick(announcement)}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.05)";
                            e.currentTarget.style.boxShadow = "0 6px 10px rgba(0, 0, 0, 0.15)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
                        }}
                    >
                        {/* 이미지 표시 */}
                        <img
                            src={announcement.image}
                            alt={announcement.title}
                            style={{
                                width: "100%",
                                height: "200px",
                                objectFit: "cover",
                                borderBottom: "1px solid #ddd",
                            }}
                        />
                        {/* 제목 및 내용 표시 */}
                        <div style={{ padding: "15px" }}>
                            <h3 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "10px" }}>
                                {announcement.title}
                            </h3>
                            <p style={{ fontSize: "14px", color: "#777" }}>
                                {announcement.content.length > 30
                                    ? announcement.content.substring(0, 30) + "..."
                                    : announcement.content}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default News;