import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

function AnnouncementDetail() {
    // 페이지 이동을 위한 navigate 함수 생성
    const navigate = useNavigate();
    
    // 현재 위치 정보를 가져오기 위한 location 객체
    const location = useLocation();
    
    // URL 파라미터에서 ID 값을 가져오기
    const { id } = useParams();

    // 현재 위치 정보에서 공지 데이터 가져오기, 없으면 리스트에서 ID로 검색
    const announcement = location.state || announcements.find(item => item.id === parseInt(id));

    // 공지사항을 찾지 못한 경우
    if (!announcement) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <h1>⚠️ 공지사항을 찾을 수 없습니다</h1>
                <p>잘못된 주소이거나 삭제된 공지입니다.</p>
                <button
                    onClick={() => navigate('/news')}
                    style={{
                        marginTop: '20px',
                        padding: '10px 20px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        borderRadius: '5px',
                        border: '1px solid #aaa',
                        backgroundColor: '#f4f4f4'
                    }}
                >
                    공지사항 목록으로 이동
                </button>
            </div>
        );
    }

    return (
        <div style={{
            maxWidth: '800px',
            margin: '50px auto',
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '10px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            backgroundColor: '#fff'
        }}>
            {/* 뒤로가기 버튼 */}
            <button
                onClick={() => navigate(-1)}
                style={{
                    marginBottom: '20px',
                    padding: '10px 20px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    borderRadius: '5px',
                    border: '1px solid #aaa',
                    backgroundColor: '#f4f4f4'
                }}
            >
                ← 돌아가기
            </button>

            {/* 공지 제목 */}
            <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>{announcement.title}</h1>

            {/* 공지 이미지 */}
            <img
                src={announcement.image}
                alt={announcement.title}
                style={{
                    width: '100%',
                    maxHeight: '400px',
                    objectFit: 'cover',
                    borderRadius: '10px',
                    marginBottom: '20px'
                }}
            />

            {/* 공지 내용 */}
            <p style={{ fontSize: '18px', lineHeight: '1.6', color: '#333' }}>{announcement.content}</p>
        </div>
    );
}

export default AnnouncementDetail;
