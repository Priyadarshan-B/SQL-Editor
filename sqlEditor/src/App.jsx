import React from 'react';
import CreateDatabase from './Components/CreateDatabase';
import SQLEditor from './Components/SqlEditor';
import './App.css';

const App = () => {
    return (
        <div className="App">
            <header className="App-header">
                <h1>DBMS Test</h1>
            </header>
            <main>
                <SQLEditor />
            </main>
        </div>
    );
};

export default App;
