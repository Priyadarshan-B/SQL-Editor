import React, { useState } from "react";
import axios from "axios";
import './question.css'

function Question() {
  const [question, setQuestion] = useState("");
  const [sampleOutputs, setSampleOutputs] = useState([""]);
  const [outputs, setOutputs] = useState([""]);

  const handleAddIteration = () => {
    setSampleOutputs([...sampleOutputs, ""]);
    setOutputs([...outputs, ""]);
  };

  const handleRemoveIteration = (index) => {
    const newSampleOutputs = sampleOutputs.filter((_, i) => i !== index);
    const newOutputs = outputs.filter((_, i) => i !== index);
    setSampleOutputs(newSampleOutputs);
    setOutputs(newOutputs);
  };

  const handleSampleOutputChange = (index, value) => {
    const newSampleOutputs = [...sampleOutputs];
    newSampleOutputs[index] = value;
    setSampleOutputs(newSampleOutputs);
  };

  const handleOutputChange = (index, value) => {
    const newOutputs = [...outputs];
    newOutputs[index] = value;
    setOutputs(newOutputs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/question', {
        question,
        sampleOutputs,
        outputs
      });
      console.log(response.data);
      // Handle success response
    } catch (error) {
      console.error(error);
      // Handle error response
    }
  };

  return (
    <div className="question-container">
      <h3>Add Question (SQL)</h3>
      <form onSubmit={handleSubmit}>
        <label htmlFor="question">Question - query</label>
        <textarea
          type="text"
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        {sampleOutputs.map((sampleOutput, index) => (
          <div key={index} className="iteration">
            <label htmlFor={`soutput-${index}`}>Sample Output</label>
            <input
              type="text"
              id={`soutput-${index}`}
              value={sampleOutput}
              onChange={(e) => handleSampleOutputChange(index, e.target.value)}
            />
            <label htmlFor={`output-${index}`}>Output</label>
            <input
              type="text"
              id={`output-${index}`}
              value={outputs[index]}
              onChange={(e) => handleOutputChange(index, e.target.value)}
            />
            <button type="button" onClick={() => handleRemoveIteration(index)}>
              Delete
            </button>
          </div>
        ))}
        <button type="button" onClick={handleAddIteration}>
          Add
        </button>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default Question;
