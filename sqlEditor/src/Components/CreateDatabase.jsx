// import React, { useState } from 'react';
// import axios from 'axios';
// import SQLEditor from './SqlEditor';

// const CreateDatabase = () => {
//     const [name, setName] = useState('');
//     const [message, setMessage] = useState('');
//     const [dbCreated, setDbCreated] = useState(false);

//     const handleSubmit = async (event) => {
//         event.preventDefault();
//         try {
//             const response = await axios.post('http://localhost:5000/create-database', {
//                 studentId: name,
//                 name: name,
//             });
//             setMessage(response.data);
//             setDbCreated(true);
//         } catch (error) {
//             setMessage(error.response ? error.response.data : 'Error creating database');
//         }
//     };

//     return (
//         <div className="create-database">
//             <h2>Create Database</h2>
//             <form onSubmit={handleSubmit}>
//                 <div>
//                     <label htmlFor="name">Name:</label>
//                     <input
//                         type="text"
//                         id="name"
//                         value={name}
//                         onChange={(e) => setName(e.target.value)}
//                         required
//                     />
//                 </div>
//                 <button type="submit">Create Database</button>
//             </form>
//             {message && <p>{message}</p>}
//             {dbCreated && <SQLEditor studentId={name} />}
//         </div>
//     );
// };

// export default CreateDatabase;
