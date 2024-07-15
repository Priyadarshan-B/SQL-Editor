import React, { useState } from 'react';
import MonacoEditor from 'react-monaco-editor';
import 'monaco-editor/min/vs/editor/editor.main.css';
import axios from 'axios';

const SQLEditor = ({ studentId }) => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState('');

    const executeQuery = async () => {
        try {
            const response = await axios.post('http://localhost:5000/execute-query', {
                rollnumber: '7376221CS269', // Use rollnumber instead of studentId
                query: query
            });
            setResult(response.data.formattedResults);
            alert('Query executed successfully!');
        } catch (error) {
            setResult(error.response ? error.response.data : 'Error executing query');
            alert('Error executing query.');
        }
    };

    const editorDidMount = (editor) => {
        // You can customize editor settings here if needed
    };

    const onChange = (newValue, e) => {
        setQuery(newValue);
    };

    return (
        <div className="sql-editor">
            <h2>SQL Editor</h2>
            <MonacoEditor
                width="100%"
                height="400"
                language="sql"
                theme="vs-dark"
                value={query}
                options={{
                    selectOnLineNumbers: true,
                    automaticLayout: true,
                    minimap: {
                        enabled: true
                    }}
                }
                onChange={onChange}
                editorDidMount={editorDidMount}
            />
            <button onClick={executeQuery}>Execute Query</button>
            {result && (
                <div className="result">
                    <h3>Result</h3>
                    <pre>{result}</pre>
                </div>
            )}
        </div>
    );
};

export default SQLEditor;
