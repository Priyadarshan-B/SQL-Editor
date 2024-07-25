import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import './question.css';
import apiHost from "../utlis/api";

function Question() {
  const [questionDropdown, setQuestionDropdown] = useState(null);
  const [question, setQuestion] = useState({ title: "", question: "" });
  const [questionOptions, setQuestionOptions] = useState([]);
  const [isAddingNewQuestion, setIsAddingNewQuestion] = useState(false);
  const [outputs, setOutputs] = useState([{ questionName:"",sampleoutput: "", output: "" }]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`${apiHost}/api/questions`);
        const options = response.data.map(q => ({ value: q.id, label: q.title }));
        setQuestionOptions(options);
      } catch (error) {
        console.error("Error fetching question options:", error);
      }
    };

    fetchQuestions();
  }, []);

  const handleQuestionDropdownChange = (selectedOption) => {
    setQuestionDropdown(selectedOption);
  };

  const handleQuestionChange = (field, value) => {
    setQuestion(prevQuestion => ({ ...prevQuestion, [field]: value }));
  };

  const handleAddQuestion = () => {
    setIsAddingNewQuestion(true);
  };

  const handleOutputChange = (index, field, value) => {
    const newOutputs = outputs.map((output, i) => {
      if (i === index) {
        return { ...output, [field]: value };
      }
      return output;
    });
    setOutputs(newOutputs);
  };

  const handleAddOutput = () => {
    setOutputs([...outputs, {questionName: "", sampleoutput: "", output: "" }]);
  };

  const handleDeleteOutput = (index) => {
    setOutputs(outputs.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Determine the question ID based on whether a new question is being added or selected from the dropdown
    const selectedQuestionId = isAddingNewQuestion
      ? question.id
      : questionDropdown?.value;

    if (!selectedQuestionId) {
      console.error("No question ID found.");
      return;
    }

    // Transform data into the required format
    const formattedOutputs = outputs.map(output => ({
      question: selectedQuestionId,
      question_name : output.questionName,
      sample_output: output.sampleoutput.replace(/\r?\n/g, '\\n'), 
      output: output.output.replace(/\r?\n/g, '\\n') 
    }));

    console.log("Data to be sent:", formattedOutputs);
    try {
      const response = await axios.post(`${apiHost}/api/allquestion`, formattedOutputs);
      console.log("Response from server:", response.data);
    } catch (error) {
      console.error("Error sending data:", error);
    }
  };

  return (
    <div className="question-container">
      <h3>Add Question (SQL)</h3>
      <form onSubmit={handleSubmit}>
        {!isAddingNewQuestion && (
          <>
            <div className="question-block">
              <label htmlFor="question-dropdown">Select Initial Question</label>
              <Select
                id="question-dropdown"
                options={questionOptions}
                value={questionDropdown}
                onChange={handleQuestionDropdownChange}
              />
            </div>
            {outputs.map((output, index) => (
              <div className="output-block" key={index}>
                <label htmlFor={`question-${index}`}>Question {index+1}</label>
                <input 
                type="text"
                id={`question-${index}`}
                value={output.questionName}
                onChange={(e) => handleOutputChange(index, 'questionName', e.target.value)}

                />
                <label htmlFor={`sampleoutput-${index}`}>Sample Output {index + 1}</label>
                <textarea
                  type="text"
                  id={`sampleoutput-${index}`}
                  value={output.sampleoutput}
                  onChange={(e) => handleOutputChange(index, 'sampleoutput', e.target.value)}
                />
                <label htmlFor={`output-${index}`}>Output {index + 1}</label>
                <textarea
                  type="text"
                  id={`output-${index}`}
                  value={output.output}
                  onChange={(e) => handleOutputChange(index, 'output', e.target.value)}
                />
                <button type="button" onClick={() => handleDeleteOutput(index)}>
                  Delete Output
                </button>
              </div>
            ))}
            <button type="button" onClick={handleAddOutput}>
              Add Output
            </button>
          </>
        )}
        {isAddingNewQuestion && (
          <div className="question-block">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={question.title}
              onChange={(e) => handleQuestionChange('title', e.target.value)}
            />
            <label htmlFor="question">Question</label>
            <textarea
              id="question"
              value={question.question}
              onChange={(e) => handleQuestionChange('question', e.target.value)}
            />
          </div>
        )}
        {!isAddingNewQuestion && (
          <button type="button" onClick={handleAddQuestion}>
            Add New Question
          </button>
        )}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default Question;
