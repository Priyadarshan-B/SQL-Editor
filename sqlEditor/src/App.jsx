import React from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Question from './Components/QuestionCreation';
import SQLEditor from './Components/SqlEditor';
import './App.css';

const App = () => {
    return (
        <Router>
                        <Routes>
                            <Route path="/sql" element={<SQLEditor/>} />
                            <Route path="/question" element={<Question/>} />
                        </Routes>
                   
        </Router>
    );
};

export default App;
