import React from "react";
import { getRecentResults } from "../../services/academicService";

const RecentResultsTable = () => {
  const results = getRecentResults();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        paddingTop: "50px",
        minHeight: "100vh",
        background: "#0b0c1a"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          padding: "20px",
          borderRadius: "16px",
          background:
            "linear-gradient(135deg, rgba(45,45,90,0.95), rgba(15,15,40,0.98))",
          boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
          color: "white",
          fontFamily: "Poppins, sans-serif"
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>📊 Recent Results</h2>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "center" 
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
              <th style={{ padding: "12px" }}>Course Code</th>
              <th style={{ padding: "12px" }}>Course Name</th>
              <th style={{ padding: "12px" }}>Grade</th>
              <th style={{ padding: "12px" }}>Credits</th>
            </tr>
          </thead>

          <tbody>
            {results.map((item) => (
              <tr
                key={item.id}
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.08)"
                }}
              >
                <td style={{ padding: "12px", fontWeight: "500" }}>
                  {item.courseCode}
                </td>

                <td
                  style={{
                    padding: "12px",
                    fontStyle: "italic",
                    color: "#ddd"
                  }}
                >
                  {item.courseName}
                </td>

                <td
                  style={{
                    padding: "12px",
                    fontWeight: "bold",
                    color: getGradeColor(item.grade)
                  }}
                >
                  {item.grade}
                </td>

                <td style={{ padding: "12px" }}>{item.credits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* 🎨 Grade color */
const getGradeColor = (grade) => {
  switch (grade) {
    case "A+":
      return "#00e676";
    case "A":
      return "#4caf50";
    case "B+":
      return "#8bc34a";
    case "B":
      return "#cddc39";
    case "C+":
      return "#ffc107";
    case "C":
      return "#ff9800";
    case "D+":
      return "#ff7043";
    case "D":
      return "#f44336";
    case "E":
      return "#d32f2f";
    case "F":
      return "#b71c1c";
    default:
      return "white";
  }
};

export default RecentResultsTable;