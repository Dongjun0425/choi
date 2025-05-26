// PieChartComponent.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { parseStringPromise } from "xml2js";

ChartJS.register(ArcElement, Tooltip, Legend);

const PieChartComponent = () => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchXML = async () => {
      try {
        const response = await axios.get(
          `http://openapi.academyinfo.go.kr/openapi/service/rest/StudentService?serviceKey=vdCZUaw0OvQ9OVGqD6P9%2B15oBKd6n%2FrVlXWRTS2Sj6uoLcYjEUsNBBZ5o7RJiCjWrTKezCptYyNzCOGJlUZSHg%3D%3D`
        );

        // XML → JSON 변환
        const jsonResult = await parseStringPromise(response.data);

        // 예시 데이터 위치에 맞게 접근
        const regRate = parseFloat(
          jsonResult.response.body[0].items[0].item[0].regRate[0]
        );

        const data = {
          labels: ["등록", "미등록"],
          datasets: [
            {
              data: [regRate, 100 - regRate],
              backgroundColor: ["#36A2EB", "#FF6384"],
              borderWidth: 1,
            },
          ],
        };

        setChartData(data);
      } catch (error) {
        console.error("XML fetch 또는 파싱 실패", error);
      }
    };

    fetchXML();
  }, []);

  if (!chartData) return <div>그래프 로딩 중...</div>;

  return (
    <div style={{ width: "400px", margin: "0 auto" }}>
      <h3 style={{ textAlign: "center" }}>입학전형 최종등록률</h3>
      <Pie data={chartData} />
    </div>
  );
};

export default PieChartComponent;
