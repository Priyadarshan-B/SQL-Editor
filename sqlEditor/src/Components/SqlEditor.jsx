import React, { useState, useEffect } from "react";
import MonacoEditor from "react-monaco-editor";
import "monaco-editor/min/vs/editor/editor.main.css";
import axios from "axios";
import apiHost from "../utlis/api";

const SQLEditor = () => {
  const [rollnumber, setRollNumber] = useState("");
  const [buttonstate, setButtonState] = useState(false);
  const [questionQuery, setQuestionQuery] = useState(`
CREATE TABLE books ( book_id INT PRIMARY KEY,  title VARCHAR(100),    author VARCHAR(100), genre VARCHAR(50), price INT, publication_year INT);
INSERT INTO books (book_id, title, author, genre, price, publication_year)VALUES
    (1, 'To Kill a Mockingbird', 'Harper Lee', 'fiction', 12, 1960),
    (2, 'Pride and Prejudice', 'Jane Austen', 'romance', 9, 1949),
    (3, 'The Hobbit', 'J.R.R. Tolkien', 'fantasy', 10, 1925),
    (4, 'Brave New World', 'Aldous Huxley', 'Science fiction', 8, 1927),
    (5, 'Jane Eyre', 'Charlotte Brontë', 'fiction', 14, 1997);

  `);
  const [answerQuery, setAnswerQuery] = useState("");
  const [result, setResult] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [branchesData, setBranchesData] = useState([]);
  const [studentsData, setStudentsData] = useState([]);

  const expectedResults = [
    ` book_id | title | author | genre | price | publication_year
1 | To Kill a Mockingbird | Harper Lee | fiction | 12 | 1960
2 | Pride and Prejudice | Jane Austen | romance | 9 | 1949
3 | The Hobbit | J.R.R. Tolkien | fantasy | 10 | 1925
4 | Brave New World | Aldous Huxley | Science fiction | 8 | 1927
5 | Jane Eyre | Charlotte Brontë | fiction | 14 | 1997
6 | The Catcher in the Rye | J.D. Salinger | fiction | 9 | 1951
 `,
    `book_id | title | author | genre | price | publication_year
1 | To Kill a Mockingbird | Harper Lee | fiction | 11 | 1960
2 | Pride and Prejudice | Jane Austen | romance | 9 | 1949
3 | The Hobbit | J.R.R. Tolkien | fantasy | 10 | 1925
4 | Brave New World | Aldous Huxley | Science fiction | 8 | 1927
5 | Jane Eyre | Charlotte Brontë | fiction | 14 | 1997
6 | The Catcher in the Rye | J.D. Salinger | fiction | 9 | 1951
`,

    `book_id | title | author | genre | price | publication_year
3 | The Hobbit | J.R.R. Tolkien | fantasy | 10 | 1925
`,

`book_id | title | author | genre | price | publication_year | language
1 | To Kill a Mockingbird | Harper Lee | fiction | 11 | 1960 | NULL
2 | Pride and Prejudice | Jane Austen | romance | 9 | 1949 | NULL
3 | The Hobbit | J.R.R. Tolkien | fantasy | 10 | 1925 | NULL
4 | Brave New World | Aldous Huxley | Science fiction | 8 | 1927 | NULL
5 | Jane Eyre | Charlotte Brontë | fiction | 14 | 1997 | NULL
6 | The Catcher in the Rye | J.D. Salinger | fiction | 9 | 1951 | NULL
`,

`book_id | title | author | genre | price | publication_year | language
1 | To Kill a Mockingbird | Harper Lee | fiction | 11 | 1960 | NULL
2 | Pride and Prejudice | Jane Austen | romance | 9 | 1949 | NULL
3 | The Hobbit | J.R.R. Tolkien | fantasy | 10 | 1925 | NULL
4 | Brave New World | Aldous Huxley | Science fiction | 8 | 1927 | NULL
5 | Jane Eyre | Charlotte Brontë | fiction | 14 | 1997 | NULL
6 | The Catcher in the Rye | J.D. Salinger | fiction | 9 | 1951 | English
`
  ];

  const sampleResults = [
    `book_id | title | author |genre |price |publication_year
     01 | To Kill a Mockingbird | Harper Lee | fiction |12 |1960
     02 |Pride and Prejudice | Jane Austen | romance | 9 | 1949`,

    `book_id | title | author |genre |price |publication_year
     01 | To Kill a Mockingbird | Harper Lee | fiction |11|1960
     02 |Pride and Prejudice | Jane Austen | romance | 9 | 1949`,

    `book_id | title | author |genre |price |publication_year
     03 |The Hobbit|J.R.R.Tolkien| fantasy|10|1925`,

     `book_id | title | author |genre |price |publication_year|language
     01 | To Kill a Mockingbird | Harper Lee | fiction |11|1960|NULL
     02 |Pride and Prejudice | Jane Austen | romance | 9 | 1949|NULL`,

     `book_id | title | author |genre |price |publication_year|language
     01 | To Kill a Mockingbird | Harper Lee | fiction |11|1960|NULL
     02 |Pride and Prejudice | Jane Austen | romance | 9 | 1949|NULL`
  ];



  const executeQuery = async () => {
    setButtonState(true);
    try {
      const response = await axios.post(`${apiHost}/execute-query`, {
        rollnumber: rollnumber,
        structureQuery: questionQuery,
        answerQuery: answerQuery,
      });
      setResult(response.data.formattedResults);
      const checkResults = (expectedResults, results) => {
        return expectedResults.map((expectedResult, index) => {
          const expectedLines = new Set(expectedResult.split("\n").map(line => line.trim()));
          const resultLines = new Set(results.split("\n").map(line => line.trim()));
          for (let line of expectedLines) {
            if (!resultLines.has(line)) {
              return `Test Case ${index + 1}: Failed`;
            }
          }
          return `Test Case ${index + 1}: Passed`;
        });
      };
      const testResults = checkResults(expectedResults, response.data.formattedResults);
      setTestResults(testResults.join("\n"));
    } catch (error) {
      setResult(error.response ? error.response.data : "Error executing query");
      alert("Error executing query.");
    }
    setButtonState(false);
  };

  const editorDidMount = (editor) => {};

  const onAnswerQueryChange = (newValue) => {
    setAnswerQuery(newValue);
  };

  return (
    <form >
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
            <h3>Questions:</h3>
            <p>1) Display the studentid,  name, age and their branch.</p>
            <p>2) Display name and age whose age is less or equal to 20.</p>
            <p>3) Display the studentid,  name, age and their branch whose name is "Sam Brown".</p>
            <h3 style={{ color: "black", letterSpacing: "1.5px" }}>
              Expected Output
            </h3>
            <div className="expected-output">
              {sampleResults.map((expected, index) => (
                <div key={index} style={{ marginBottom: "20px" }}>
                  <h4>Sample Output {index + 1}</h4>
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
          {/* <h3 style={{ color: "black", letterSpacing: "1.5px" }}>Branches Table</h3> */}
          {/* <table>
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
          </table> */}
          {/* <h3 style={{ color: "black", letterSpacing: "1.5px" }}>Students Table</h3>
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
          </table> */}
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
          type="submit"
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
    </form>
  );
};

export default SQLEditor;