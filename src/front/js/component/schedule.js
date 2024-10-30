import React, { useState, useEffect } from 'react';
import axios from 'axios';

 export const Schedule = () => {
    const [appointments, setAppointments] = useState([]);
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        const response = await axios.get('http://localhost:5000/api/appointments');
        setAppointments(response.data);
    };

    const addAppointment = async (e) => {
        e.preventDefault();
        const newAppointment = { name, date };

        try {
            await axios.post('http://localhost:5000/api/appointments', newAppointment);
            setAppointments([...appointments, newAppointment]);
            setName('');
            setDate('');
            setErrorMessage(''); // Clear any previous error message
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setErrorMessage(error.response.data.message);
            } else {
                setErrorMessage('Error adding appointment. Please try again.');
            }
        }
    };

    return (
        <div>
            <h1>Appointment Scheduler</h1>
            <form onSubmit={addAppointment}>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                />
                <button type="submit">Add Appointment</button>
            </form>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            <h2>Appointments</h2>
            <ul>
                {appointments.map((appointment, index) => (
                    <li key={index}>
                        {appointment.name} - {new Date(appointment.date).toLocaleString()}
                    </li>
                ))}
            </ul>
        </div>
    );
};
