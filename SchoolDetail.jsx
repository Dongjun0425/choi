// src/components/SchoolDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import Header from './Header';
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import './App.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const schoolData = {
  shingu: { name: "신구대학교", location: "성남시", rating: 3.1 },
  yongin: { name: "용인대학교", location: "용인시", rating: 3.7 },
  eastSeoul: { name: "동서울대학교", location: "성남시", rating: 3.5 },
  eulji: { name: "을지대학교", location: "성남시", rating: 3.1 },
  ict: { name: "ICT폴리텍대학", location: "광주시", rating: 3.8 },
  gachon: { name: "가천대학교", location: "성남시", rating: 3.4 },
};

const schoolIdMap = {
  shingu: '0000501',
  yongin: '0000156',
  eastSeoul: '0000450',
  eulji: '0000161',
  gachon: '0000063',
  ict: '000063',
};

const tabNames = {
  news: '학교정보',
  review: '졸업생 리뷰',
  tuition: '등록금',
  scholarship: '장학금'
};

const SchoolDetail = () => {
  const { schoolId } = useParams();
  const school = schoolData[schoolId];
  const schlCode = schoolIdMap[schoolId];

  const [tab, setTab] = useState("news");
  const [tuitionByYear, setTuitionByYear] = useState({});
  const [scholarshipByYear, setScholarshipByYear] = useState({});
  const [admissionRate, setAdmissionRate] = useState("데이터 없음");
  const [enrolledRate, setEnrolledRate] = useState("데이터 없음");
  const [leaveRate, setLeaveRate] = useState("데이터 없음");
  const [freshmanChartData, setFreshmanChartData] = useState(null);
  const [graduateChartData, setGraduateChartData] = useState(null);

  const serviceKey = 'vdCZUaw0OvQ9OVGqD6P9+15oBKd6n/rVlXWRTS2Sj6uoLcYjEUsNBBZ5o7RJiCjWrTKezCptYyNzCOGJlUZSHg==';
  const parser = new XMLParser({ ignoreAttributes: false });

  useEffect(() => {
    if (!schlCode) return;

    const fetchYearlyData = async () => {
      const years = [2022, 2023, 2024];
      const tuition = {};
      const scholarship = {};

      for (const year of years) {
        try {
          const [tRes, sRes] = await Promise.all([
            axios.get('/api/finances/getComparisonTuitionCrntSt', {
              params: { serviceKey, svyYr: year, schlId: schlCode, pageNo: 1 },
              responseType: 'text', headers: { Accept: 'application/xml' }
            }),
            axios.get('/api/finances/getComparisonScholarshipBenefitCrntSt', {
              params: { serviceKey, svyYr: year, schlId: schlCode, pageNo: 1 },
              responseType: 'text', headers: { Accept: 'application/xml' }
            })
          ]);
          tuition[year] = parseInt(parser.parse(tRes.data)?.response?.body?.items?.item?.indctVal1) || null;
          scholarship[year] = parseInt(parser.parse(sRes.data)?.response?.body?.items?.item?.indctVal1) || null;
        } catch (err) {
          console.error(`${year}년 등록금/장학금 API 오류`, err);
        }
      }

      setTuitionByYear(tuition);
      setScholarshipByYear(scholarship);
    };

    const fetchPieData = async () => {
      const fetchSingle = async (endpoint, setter) => {
        try {
          const res = await axios.get(endpoint, {
            params: { serviceKey, svyYr: 2023, schlId: schlCode, pageNo: 1 },
            responseType: 'text',
            headers: { Accept: 'application/xml' }
          });
          const val = parser.parse(res.data)?.response?.body?.items?.item?.indctVal1;
          setter(val || "데이터 없음");
        } catch {
          setter("데이터 없음");
        }
      };

      await fetchSingle('/api/student/getComparisonEntranceModelLastRegistrationRatio', setAdmissionRate);
      await fetchSingle('/api/student/getComparisonEnrolledStudentEnsureRate', setEnrolledRate);
      await fetchSingle('/api/student/getComparisonStudentOnALeaveOfAbsence', setLeaveRate);
    };

    const fetchBottomCharts = async () => {
  try {
    const [freshmanRes, graduateRes] = await Promise.all([
      axios.get('/api/student/getRegionalInsideFixedNumberFreshmanCompetitionRate', {
        params: { serviceKey, svyYr: 2023, schlId: schlCode, pageNo: 1 },
        responseType: 'text', headers: { Accept: 'application/xml' }
      }),
      axios.get('/api/student/getRegionalGraduateEnterFindJobCrntSt', {
        params: { serviceKey, svyYr: 2023, schlId: schlCode, pageNo: 1 },
        responseType: 'text', headers: { Accept: 'application/xml' }
      })
    ]);

    const freshmanData = parser.parse(freshmanRes.data)?.response?.body?.items?.item;
    const graduateData = parser.parse(graduateRes.data)?.response?.body?.items?.item;

    // ✅ 신입생 경쟁률: 지역별 그대로
   if (Array.isArray(freshmanData)) {
      const 수도권 = freshmanData.find(i => i.znNm === "수도권");
      if (수도권) {
        const labels = ['2022', '2023', '2024'];
        const values = [
          parseFloat(수도권.indctFirstVal),
          parseFloat(수도권.indctSecondVal),
          parseFloat(수도권.indctThirdVal)
        ];
        setFreshmanChartData({ labels, values });
      }
    }

    // ✅ 졸업생 진학/취업: 경기만 필터링
    if (Array.isArray(graduateData)) {
      const gyeonggiItem = graduateData.find(i => i.ctpvNm === "경기" || i.fieldVal7 === "경기");
      if (gyeonggiItem) {
        const labels = ["2022", "2023", "2024"];
        const values = [
          parseFloat(gyeonggiItem.indctFirstVal || gyeonggiItem.fieldVal4),
          parseFloat(gyeonggiItem.indctSecondVal || gyeonggiItem.fieldVal5),
          parseFloat(gyeonggiItem.indctThirdVal || gyeonggiItem.fieldVal6),
        ];
        setGraduateChartData({ labels, values });
      } else {
        setGraduateChartData(null);
      }
    }
  } catch (err) {
    console.error("하단 차트 API 오류", err);
  }
};



    fetchYearlyData();
    fetchPieData();
    fetchBottomCharts();
  }, [schoolId]);

  const renderBarChart = (title, dataMap) => {
    const labels = Object.keys(dataMap);
    const values = Object.values(dataMap);

    return (
      <div style={{ backgroundColor: "#f8f8f8", borderRadius: "20px", padding: "20px" }}>
        <h3>{title}</h3>
        <Bar data={{
          labels,
          datasets: [{ label: title, data: values, backgroundColor: '#4CAF50' }]
        }} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
      </div>
    );
  };

  const renderPieChart = (label, valueStr) => {
  const value = parseFloat(valueStr);
  if (isNaN(value)) return <p>{valueStr}</p>;

  const data = {
    labels: [label, '기타'],
    datasets: [{
      data: [value, 100 - value],
      backgroundColor: ['#4CAF50', '#eee'],
      borderWidth: 1,
    }]
  };

  return (
    <div style={{ width: '100%', height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', height: '150px' }}>
        <Pie
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } }
          }}
        />
      </div>
      <p style={{ fontWeight: 'bold', marginTop: '8px', fontSize: '15px', textAlign: 'center' }}>{label}</p>
    </div>
  );
};


  const renderStatBox = (title, chartData) => (
    <div style={{
      width: "30%", minWidth: "250px", border: "1px solid #ccc",
      borderRadius: "10px", padding: "15px", backgroundColor: "#fff"
    }}>
      <strong>{title}</strong>
      {chartData ? (
        <Bar data={{
          labels: chartData.labels,
          datasets: [{ label: title, data: chartData.values, backgroundColor: '#4CAF50' }]
        }} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
      ) : <p>데이터 없음</p>}
    </div>
  );

  if (!school) return <div>학교 정보를 찾을 수 없습니다.</div>;

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <Header school={school} />

      {/* 탭 메뉴 */}
      <div style={{
        display: "flex", gap: "40px", fontWeight: "bold",
        marginBottom: "20px", cursor: "pointer"
      }}>
        {Object.entries(tabNames).map(([key, label]) => (
          <span key={key}
            style={tab === key ? { color: "green", borderBottom: "2px solid green" } : {}}
            onClick={() => setTab(key)}
          >
            {label}
          </span>
        ))}
      </div>

      {/* 본문 영역 */}
      {tab === "news" && (
        <div style={{
          backgroundColor: "#f8f8f8", padding: "20px", borderRadius: "20px", display: "flex"
        }}>
          <div style={{ flex: 2 }}>
            <h3>학교 기본 정보입니다.</h3>
          </div>
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            gap: "20px", alignItems: "center", justifyContent: "center"
          }}>
            {renderPieChart("입학전형 등록률", admissionRate)}
            {renderPieChart("재학생 충원율", enrolledRate)}
            {renderPieChart("휴학생 비율", leaveRate)}
          </div>
        </div>
      )}
      {tab === "review" && <div>졸업생 리뷰 내용입니다.</div>}
      {tab === "tuition" && renderBarChart("연도별 등록금", tuitionByYear)}
      {tab === "scholarship" && renderBarChart("연도별 장학금 수혜", scholarshipByYear)}

      {/* 하단 통계 */}
      <div style={{
        display: "flex", flexWrap: "wrap", marginTop: "30px",
        gap: "10px", padding: "20px", backgroundColor: "#f8f8f8", borderRadius: "20px"
      }}>
        {renderStatBox("통계 항목 1: 신입생 경쟁률", freshmanChartData)}
        {renderStatBox("통계 항목 2: 졸업생 진학/취업", graduateChartData)}
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{
            width: "30%", minWidth: "250px", border: "1px solid #ccc",
            borderRadius: "10px", padding: "15px", backgroundColor: "#fff"
          }}>
            <strong>통계 항목 {i + 3}</strong>
            <p style={{ fontSize: "13px", color: "#777" }}>데이터는 추후 삽입 예정</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchoolDetail;
