import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
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
import './SchoolDetail.css';

import eastSeoul from './img/eastSeoul.jpg';
import eulji from './img/eulji.jpg';
import gachon from './img/gachon.jpg';
import ict from './img/ict.jpg';
import shingu from './img/shingu.jpg';
import yongin from './img/yongin.jpg';
import dongch from './img/gachon.jpg'; // 실제 동국대 이미지로 바꾸세요

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const schoolData = {
  shingu: { name: "신구대학교", location: "성남시", rating: 3.1, img: shingu },
  yongin: { name: "용인대학교", location: "용인시", rating: 3.7, img: yongin },
  eastSeoul: { name: "동서울대학교", location: "성남시", rating: 3.5, img: eastSeoul },
  eulji: { name: "을지대학교", location: "성남시", rating: 3.1, img: eulji },
  ict: { name: "ICT폴리텍대학", location: "광주시", rating: 3.8, img: ict },
  gachon: { name: "가천대학교", location: "성남시", rating: 3.4, img: gachon },
  dongch: { name: "동국대학교", location: "성남시", rating: 4.2, img: gachon}, // 실제 이미지는 dongch로 바꿔주세요
};

const schoolIdMap = {
  shingu: '0000501',
  yongin: '0000156',
  eastSeoul: '0000450',
  eulji: '0000161',
  gachon: '0000063',
  ict: '0000579',
  dongch:'0000100',
};

const tabNames = {
  news: '학교정보',
  review: '졸업생 리뷰',
  tuition: '등록금',
  scholarship: '장학금'
};

function getBigCategory(str) {
  if (!str) return "기타";
  const match = str.match(/^[^\-\/(]+/);
  return match ? match[0].trim() : str.trim();
}

const STAT_LABELS = {
  leave: "휴학생비율",
  admission: "입학전형 등록률",
  enrolled: "재학생 충원율",
};

// 각 통계 항목별 API 경로 매핑
const STAT_APIS = {
  leave: '/api/student/getComparisonStudentOnALeaveOfAbsence',
  admission: '/api/student/getComparisonEntranceModelLastRegistrationRatio',
  enrolled: '/api/student/getComparisonEnrolledStudentEnsureRate',
};

const SchoolDetail = () => {
  const { schoolId } = useParams();
  const school = schoolData[schoolId];
  const schlCode = schoolIdMap[schoolId];

  const [tab, setTab] = useState("news");
  const [tuitionByYear, setTuitionByYear] = useState({});
  const [scholarshipByYear, setScholarshipByYear] = useState({});
  const [freshmanChartData, setFreshmanChartData] = useState(null);
  const [graduateChartData, setGraduateChartData] = useState(null);
  const [schoolDetail, setSchoolDetail] = useState(null);
  const [admissionTypes, setAdmissionTypes] = useState([]);
  // 3,4,5번 통계 항목 연도별
  const [statMulti, setStatMulti] = useState({
    leave: { labels: [], values: [] },
    admission: { labels: [], values: [] },
    enrolled: { labels: [], values: [] },
  });

  // 졸업생 리뷰 관련 state
  const [reviews, setReviews] = useState([]);
  const [reviewInput, setReviewInput] = useState('');

  const dreamKey = '2ec92153acf7480bb7e45e8f2ed4381d';
  const parser = new XMLParser({ ignoreAttributes: false });

  useEffect(() => {
    if (!schlCode || !school) return;
    const serviceKey = 'vdCZUaw0OvQ9OVGqD6P9+15oBKd6n/rVlXWRTS2Sj6uoLcYjEUsNBBZ5o7RJiCjWrTKezCptYyNzCOGJlUZSHg==';

    // 학교ID로 학교정보 조회
    const fetchSchoolInfo = async () => {
      try {
        const res = await axios.get(`/api/school/getSchoolInfo`, {
          params: {
            serviceKey,
            svyYr: 2024,
            schlId: schlCode,
            pageNo: 1,
            numOfRows: 1
          },
          responseType: 'text',
          headers: { Accept: 'application/xml' }
        });
        const parsed = parser.parse(res.data);
        setSchoolDetail(parsed?.response?.body?.items?.item || null);
      } catch (err) {
        setSchoolDetail(null);
        console.error("학교 기본 정보 API 오류", err);
      }
    };

    // 연도별 등록금/장학금
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

    // 3,4,5번 통계 연도별 데이터 한번에
    const fetchMultiYearStats = async () => {
      const years = [2022, 2023, 2024];
      const nextStat = {
        leave: { labels: [], values: [] },
        admission: { labels: [], values: [] },
        enrolled: { labels: [], values: [] },
      };

      for (const key of Object.keys(STAT_APIS)) {
        for (const year of years) {
          try {
            const res = await axios.get(STAT_APIS[key], {
              params: { serviceKey, svyYr: year, schlId: schlCode, pageNo: 1 },
              responseType: 'text',
              headers: { Accept: 'application/xml' }
            });
            let val = parser.parse(res.data)?.response?.body?.items?.item?.indctVal1;
            val = val !== undefined && val !== null ? parseFloat(val) : null;
            nextStat[key].labels.push(String(year));
            nextStat[key].values.push(val);
          } catch (err) {
            nextStat[key].labels.push(String(year));
            nextStat[key].values.push(null);
          }
        }
      }
      setStatMulti(nextStat);
    };

    // 하단 신입생 경쟁률/졸업생 진학취업
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

        const freshman = parser.parse(freshmanRes.data)?.response?.body?.items?.item;
        const graduate = parser.parse(graduateRes.data)?.response?.body?.items?.item;

        const 수도권 = freshman?.find(i => i.znNm === "수도권");
        const 경기 = graduate?.find(i => i.ctpvNm === "경기" || i.fieldVal7 === "경기");

        if (수도권) {
          setFreshmanChartData({
            labels: ['2022', '2023', '2024'],
            values: [수도권.indctFirstVal, 수도권.indctSecondVal, 수도권.indctThirdVal].map(Number)
          });
        }
        if (경기) {
          setGraduateChartData({
            labels: ['2022', '2023', '2024'],
            values: [
              경기.indctFirstVal || 경기.fieldVal4,
              경기.indctSecondVal || 경기.fieldVal5,
              경기.indctThirdVal || 경기.fieldVal6
            ].map(Number)
          });
        }
      } catch (err) {
        console.error("통계 차트 오류", err);
      }
    };

    // 입학전형 Pie
    const fetchAdmissionTypeRatios = async () => {
      let results = [];
      const maxPage = 10;
      for (let page = 1; page <= maxPage; page++) {
        try {
          const res = await axios.get(
            `https://openapi.gg.go.kr/Enschscritypeselectn`,
            {
              params: {
                KEY: dreamKey,
                Type: "xml",
                pIndex: page,
                pSize: 1000
              },
              responseType: 'text'
            }
          );
          const parsed = parser.parse(res.data);
          let rows = parsed.Enschscritypeselectn?.row || [];
          if (!Array.isArray(rows) && rows) rows = [rows];
          const filtered = rows.filter(item =>
            item.SCHOOL_NM && item.SCHOOL_NM.replace(/\s/g, '').includes(school.name.replace(/\s/g, ''))
          );
          results = results.concat(filtered);
          if (rows.length < 1000) break;
        } catch (e) {
          break;
        }
      }
      setAdmissionTypes(results);
    };

    fetchSchoolInfo();
    fetchYearlyData();
    fetchMultiYearStats();
    fetchBottomCharts();
    fetchAdmissionTypeRatios();

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

  // 큰범주 Pie
  const renderAdmissionTypePie = () => {
    if (!admissionTypes.length) return <p>입학전형별 데이터 없음</p>;
    const years = admissionTypes.map(a => Number(a.STD_YY)).filter(Boolean);
    const latestYear = Math.max(...years);
    const latestRows = admissionTypes.filter(a => Number(a.STD_YY) === latestYear);
    const filtered = latestRows.filter(type => Number(type.LAST_REGIST_PSN_CNT) > 0);

    const categoryMap = {};
    filtered.forEach(type => {
      const big = getBigCategory(type.SCRI_SM_CLASS_NM || type.SCRI_TYPE_NM || "기타");
      const cnt = Number(type.LAST_REGIST_PSN_CNT) || 0;
      categoryMap[big] = (categoryMap[big] || 0) + cnt;
    });

    const labelsRaw = Object.keys(categoryMap);
    const valuesRaw = Object.values(categoryMap);
    const total = valuesRaw.reduce((acc, v) => acc + v, 0);

    if (total === 0) return <p>등록인원 데이터가 없습니다.</p>;

    const minPercent = 1;
    let otherCount = 0;
    const labels = [];
    const data = [];
    const colors = [
      "#4caf50", "#2196f3", "#f44336", "#ff9800", "#9c27b0", "#00bcd4",
      "#ffeb3b", "#795548", "#607d8b", "#e91e63", "#8bc34a"
    ];

    labelsRaw.forEach((label, idx) => {
      const percent = (categoryMap[label] / total) * 100;
      if (percent < minPercent) {
        otherCount += categoryMap[label];
      } else {
        labels.push(label);
        data.push(Math.round(percent * 10) / 10);
      }
    });
    if (otherCount > 0) {
      labels.push("기타");
      data.push(Math.round((otherCount / total) * 1000) / 10);
    }

    return (
      <div style={{ width: '360px', margin: "0 auto 28px auto" }}>
        <div style={{ fontWeight: "bold", fontSize: "16px", margin: "10px 0", color: "#333" }}>
          {latestYear}년 입학전형별 등록인원 비율
        </div>
        <Pie data={{
          labels,
          datasets: [{
            data,
            backgroundColor: labels.map((_, idx) =>
              idx === labels.length - 1 && otherCount > 0 ? "#cccccc" : colors[idx % colors.length]
            ),
            borderWidth: 1
          }]
        }} options={{
          responsive: true,
          plugins: { legend: { position: 'bottom' } }
        }} />
      </div>
    );
  };

  // 통계 항목(1~5): 연도별
  const renderStatBox = (title, chartData) => (
    <div className="stat-box">
      <strong>{title}</strong>
      {chartData && chartData.labels && chartData.values ? (
        <Bar data={{
          labels: chartData.labels,
          datasets: [{ label: title, data: chartData.values, backgroundColor: '#4CAF50' }]
        }} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
      ) : <p>데이터 없음</p>}
    </div>
  );

  const renderReviewTab = () => (
  <div className="school-info-container review-box">
    <h3>졸업생 리뷰 작성</h3>
    <form
      onSubmit={e => {
        e.preventDefault();
        if (!reviewInput.trim()) return;
        setReviews([{ text: reviewInput, date: new Date() }, ...reviews]);
        setReviewInput('');
      }}
    >
      <input
        value={reviewInput}
        onChange={e => setReviewInput(e.target.value)}
        placeholder="리뷰를 입력하세요"
        maxLength={300}
      />
      <button type="submit">등록</button>
    </form>
    <h4>리뷰 목록</h4>
    <ul>
      {reviews.length === 0 && <li style={{ color: "#777" }}>아직 등록된 리뷰가 없습니다.</li>}
      {reviews.map((r, idx) => (
        <li key={idx}>
          <div>{r.text}</div>
          <div style={{ color: "#aaa", fontSize: 12 }}>{r.date.toLocaleString()}</div>
        </li>
      ))}
    </ul>
  </div>
);

  if (!school) return <div>학교 정보를 찾을 수 없습니다.</div>;

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", gap: "40px", fontWeight: "bold", marginBottom: "20px", cursor: "pointer" }}>
        {Object.entries(tabNames).map(([key, label]) => (
          <span key={key} style={tab === key ? { color: "green", borderBottom: "2px solid green" } : {}}
            onClick={() => setTab(key)}>{label}</span>
        ))}
      </div>

      {tab === "news" && (
        <div className="school-info-container">
          <div>
            <img src={school.img} alt={school.name} className="school-img" />
          </div>
          <div className="school-text">
            {schoolDetail ? (
              <ul>
                <li><strong>설립유형:</strong> {schoolDetail.schlEstbDivNm}</li>
                <li><strong>학교명:</strong> {schoolDetail.schlNm}</li>
                <li><strong>학교유형:</strong> {schoolDetail.schlDivNm}</li>
                <li><strong>설립연도:</strong> {schoolDetail.schlEstbDt}년</li>
                <li><strong>주소:</strong> {schoolDetail.postNoAdrs}</li>
                <li><strong>우편번호:</strong> {schoolDetail.postNo}</li>
                <li><strong>전화번호:</strong> {schoolDetail.schlRepTpNoCtnt}</li>
                <li><strong>팩스번호:</strong> {schoolDetail.schlRepFxNoCtnt}</li>
                <li><strong>홈페이지:</strong> <a href={schoolDetail.schlUrlAdrs} target="_blank" rel="noreferrer">{schoolDetail.schlUrlAdrs}</a></li>
              </ul>
            ) : <p>학교 정보를 불러오는 중입니다...</p>}
          </div>
          <div className="chart-column">
            {renderAdmissionTypePie()}
          </div>
        </div>
      )}

      {tab === "review" && renderReviewTab()}
      {tab === "tuition" && renderBarChart("연도별 등록금", tuitionByYear)}
      {tab === "scholarship" && renderBarChart("연도별 장학금 수혜", scholarshipByYear)}

      <div className="stat-grid">
        {renderStatBox("통계 항목 1: 신입생 경쟁률", freshmanChartData)}
        {renderStatBox("통계 항목 2: 졸업생 진학/취업", graduateChartData)}
        {renderStatBox("통계 항목 3: 휴학생비율", statMulti.leave)}
        {renderStatBox("통계 항목 4: 입학전형 등록률", statMulti.admission)}
        {renderStatBox("통계 항목 5: 재학생 충원율", statMulti.enrolled)}
        <div className="stat-box">
          <strong>통계 항목 6</strong>
          <p style={{ fontSize: "13px", color: "#777" }}>데이터는 추후 삽입 예정</p>
        </div>
      </div>
    </div>
  );
};

export default SchoolDetail;
