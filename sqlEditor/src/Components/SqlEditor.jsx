import React, { useState, useEffect } from "react";
import MonacoEditor from "react-monaco-editor";
import "monaco-editor/min/vs/editor/editor.main.css";
import axios from "axios";
import apiHost from "../utlis/api";

const SQLEditor = () => {
  const [rollnumber, setRollNumber] = useState("");
  const [buttonstate, setButtonState] = useState(false);
  const [questionQuery, setQuestionQuery] = useState(`
CREATE TABLE branches (
    branch_id INT PRIMARY KEY,
    branch_name VARCHAR(255)
);

CREATE TABLE students (
    student_id INT PRIMARY KEY,
    name VARCHAR(255),
    age INT,
    branch_id INT,
    FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
);

INSERT INTO branches (branch_id, branch_name) VALUES
(1, 'Computer Sci'),
(2, 'Electronics'),
(3, 'Mechanical');

INSERT INTO students (student_id, name, age, branch_id) VALUES
(1, 'John Doe', 20, 1),
(2, 'Jane Smith', 22, 2),
(3, 'Sam Brown', 21, 1),
(4, 'Lisa Ray', 23, 3);
  `);
  const [answerQuery, setAnswerQuery] = useState("");
  const [result, setResult] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [branchesData, setBranchesData] = useState([]);
  const [studentsData, setStudentsData] = useState([]);

  const expectedResults = [
    `student_id | name | age | branch_name
1 | John Doe | 20 | Computer Sci
2 | Jane Smith | 22 | Electronics
3 | Sam Brown | 21 | Computer Sci
4 | Lisa Ray | 23 | Mechanical`,
    `name | age
John Doe | 20`,
    `student_id | name | age | branch_name
3 | Sam Brown | 21 | Computer Sci`,
  ];

  useEffect(() => {
    const parseQuery = () => {
      const branches = [
        { branch_id: 1, branch_name: "Computer Sci" },
        { branch_id: 2, branch_name: "Electronics" },
        { branch_id: 3, branch_name: "Mechanical" },
      ];
      const students = [
        { student_id: 1, name: "John Doe", age: 20, branch_id: 1 },
        { student_id: 2, name: "Jane Smith", age: 22, branch_id: 2 },
        { student_id: 3, name: "Sam Brown", age: 21, branch_id: 1 },
        { student_id: 4, name: "Lisa Ray", age: 23, branch_id: 3 },
      ];
      setBranchesData(branches);
      setStudentsData(students);
    };
    parseQuery();
  }, []);

  const executeQuery = async () => {
    setButtonState(true);
    try {
      const queries = answerQuery
        .split(";")
        .map((q) => q.trim())
        .filter((q) => q);
      let results = [];
      for (const query of queries) {
        const response = await axios.post(
          `${apiHost}/execute-query`,
          {
            rollnumber: rollnumber,
            structureQuery: questionQuery,
            answerQuery: query,
          }
        );
        results.push(response.data.formattedResults);
      }
      setResult(results.join("\n"));

      const checkResults = (expectedResults, results) => {
        return expectedResults.map((expectedResult, index) => {
          const expectedLines = new Set(expectedResult.split("\n").map(line => line.trim()));
          const resultLines = new Set(results[index].split("\n").map(line => line.trim()));

          for (let line of expectedLines) {
            if (!resultLines.has(line)) {
              return `Test Case ${index + 1}: Failed`;
            }
          }
          return `Test Case ${index + 1}: Passed`;
        });
      };

      const testResults = checkResults(expectedResults, results);
      setTestResults(testResults.join("\n"));
    } catch (error) {
      setResult(error.response ? error.response.data : "Error executing query");
      alert("Error executing query.");
    }
    setButtonState(false);
  };

  const editorDidMount = (editor) => {};

  const onAnswerQueryChange = (newValue, e) => {
    setAnswerQuery(newValue);
  };

  return (
    <div className="sql-editor">
      <h2 style={{ color: "black", letterSpacing: "1.5px" }}>SQL Editor</h2>
      <br />
      <div>
        <div className="label-and-input">
          <label className="label-input">Register Number:</label>
          <input
            type="text"
            className="input-box"
            placeholder="Your Register Number"
            value={rollnumber}
            onChange={(e) => setRollNumber(e.target.value)}
            required
          />
        </div>
        <br />
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "50px",
        }}
      >
        <div
          style={{
            width: "40%",
          }}
        >
          <h3 style={{ color: "black", letterSpacing: "1.5px" }}>Question</h3>
          <textarea
            value={questionQuery}
            placeholder="Enter structure query here..."
            rows="20"
            style={{ width: "100%", padding: "10px", fontSize: "16px", resize: "none" }}
            readOnly
          />
        </div>
        <div
          style={{
            width: "50%",
          }}
        >
          <h3 style={{ color: "black", letterSpacing: "1.5px" }}>
            Expected Output
          </h3>
          <div className="expected-output">
            {expectedResults.map((expected, index) => (
              <div key={index} style={{ marginBottom: "20px" }}>
                <h4>Test Case {index + 1}</h4>
                <pre
                  style={{
                    backgroundColor: "#f4f4f4",
                    padding: "10px",
                    borderRadius: "4px",
                    overflowX: "auto",
                  }}
                >
                  {expected}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div>
        <h3 style={{ color: "black", letterSpacing: "1.5px" }}>Branches Table</h3>
        <table>
          <thead>
            <tr>
              <th>branch_id</th>
              <th>branch_name</th>
            </tr>
          </thead>
          <tbody>
            {branchesData.map((branch, index) => (
              <tr key={index}>
                <td>{branch.branch_id}</td>
                <td>{branch.branch_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3 style={{ color: "black", letterSpacing: "1.5px" }}>Students Table</h3>
        <table>
          <thead>
            <tr>
              <th>student_id</th>
              <th>name</th>
              <th>age</th>
              <th>branch_id</th>
            </tr>
          </thead>
          <tbody>
            {studentsData.map((student, index) => (
              <tr key={index}>
                <td>{student.student_id}</td>
                <td>{student.name}</td>
                <td>{student.age}</td>
                <td>{student.branch_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <br />
      <div>
        <h3 style={{ color: "black", letterSpacing: "1.5px" }}>Answer Query</h3>
        <MonacoEditor
          width="100%"
          height="400"
          language="sql"
          theme="vs-dark"
          value={answerQuery}
          options={{
            selectOnLineNumbers: true,
            automaticLayout: true,
            minimap: {
              enabled: true,
            },
          }}
          onChange={onAnswerQueryChange}
          editorDidMount={editorDidMount}
        />
      </div>
      <button
        onClick={buttonstate ? null : executeQuery}
        disabled={buttonstate}
        style={{
          backgroundColor: buttonstate ? "grey" : "blue",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "4px",
          cursor: buttonstate ? "not-allowed" : "pointer",
        }}
      >
        {buttonstate ? "Please Wait..." : "Execute Query"}
      </button>
      {result.length > 0 && (
        <div className="result">
          <h3>Result</h3>
          <pre>{result}</pre>
        </div>
      )}
      {testResults.length > 0 && (
        <div className="test-results">
          <h3>Test Results</h3>
          <pre>{testResults}</pre>
        </div>
      )}
    </div>
  );
};

export default SQLEditor;