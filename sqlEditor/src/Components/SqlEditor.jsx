import React, { useState, useEffect } from "react";
import MonacoEditor from "react-monaco-editor";
import "monaco-editor/min/vs/editor/editor.main.css";
import axios from "axios";
import apiHost from "../utlis/api";

const SQLEditor = () => {
  const [rollnumber, setRollNumber] = useState("");
  const [buttonstate, setButtonState] = useState(false);
  const [questionQuery, setQuestionQuery] = useState("");
  const [answerQuery, setAnswerQuery] = useState("");
  const [result, setResult] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [questionTitle, setQuestionTitle] = useState("");
  const [sampleOutputs, setSampleOutputs] = useState([]);
  const [expectedOutputs, setExpectedOutputs] = useState([]);
  const [questionName, setQuestionName] = useState([])

  useEffect(() => {
    const fetchAllQuestion = async () => {
      try {
        const response = await axios.get(`${apiHost}/api/allquestion`);
        // const { title, question, sample_output, output } = response.data[0];
        // setQuestionTitle(title);
        setQuestionName(response.data.map(item=>item.question_name));
        setSampleOutputs(response.data.map(item => item.sample_output.replace(/\\r|\\n/g, '\n')));
        setExpectedOutputs(response.data.map(item => item.output.replace(/\\r|\\n/g, '\n')));
      } catch (error) {
        console.error("Error fetching All question", error);
      }
    };

    fetchAllQuestion();
  },
  []);
  useEffect(()=>{
    const fetchQuestion = async()=>{
      try{
        const response = await axios.get(`${apiHost}/api/questions`)
        const {title, question} = response.data[0]
        setQuestionTitle(title)
        setQuestionQuery(question.replace(/\\r|\\n/g, ''));

      }
      catch (error){
        console.error("Error fetching question", error);

      }
    }
    fetchQuestion()
  },[])

  const executeQuery = async (e) => {
    e.preventDefault();
    setButtonState(true);
    try {
      const response = await axios.post(`${apiHost}/execute-query`, {
        rollnumber: rollnumber,
        structureQuery: questionQuery,
        answerQuery: answerQuery,
      });
      setResult(response.data.formattedResults);
      const checkResults = (expectedOutputs, results) => {
        return expectedOutputs.map((expectedOutput, index) => {
          const expectedLines = new Set(expectedOutput.split("\n").map(line => line.trim()));
          const resultLines = new Set(results.split("\n").map(line => line.trim()));
          for (let line of expectedLines) {
            if (!resultLines.has(line)) {
              return `Test Case ${index + 1}: Failed`;
            }
          }
          return `Test Case ${index + 1}: Passed`;
        });
      };
      const testResults = checkResults(expectedOutputs, response.data.formattedResults);
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
    <form onSubmit={executeQuery}>
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
            <h4>{questionTitle}</h4>
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
            <div>
              {questionName.map((questionName, index)=>(
                <div key={index} style={{ marginBottom: "20px" }} >
                  <h4>Question {index+1}</h4>
                  <pre
                  style={{
                    backgroundColor: "#f4f4f4",
                    padding: "10px",
                    borderRadius: "4px",
                    overflowX: "auto",
                  }}
                  >
                    {questionName}
                  </pre>
                </div>
              ))}
            </div>
            <h3 style={{ color: "black", letterSpacing: "1.5px" }}>Sample Output</h3>
            <div className="sample-output">
              {sampleOutputs.map((sample, index) => (
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
                    {sample}
                  </pre>
                </div>
              ))}
            </div>
            <h3 style={{ color: "black", letterSpacing: "1.5px" }}>Expected Output</h3>
            <div className="expected-output">
              {expectedOutputs.map((expected, index) => (
                <div key={index} style={{ marginBottom: "20px" }}>
                  <h4>Expected Output {index + 1}</h4>
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
