import React from 'react';
import CreateDatabase from './Components/CreateDatabase';
import SQLEditor from './Components/SqlEditor';
import './App.css';

const App = () => {
    return (
        <div className="App">
            
            <main>
                <SQLEditor />
            </main>
        </div>
    );
};

export default App;
