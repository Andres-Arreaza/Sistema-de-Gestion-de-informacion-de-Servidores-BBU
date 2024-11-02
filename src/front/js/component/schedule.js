import React, { useState, useEffect } from 'react';
import { BackendURL } from './backendURL';

export const Schedule = () => {
    const [appointments, setAppointments] = useState([]);
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        const response = await fetch(BackendURL+'/appointments');

        setAppointments(response.data);
    };

    const addAppointment = async (e) => {
        e.preventDefault();
        const newAppointment = { name, date };

        try {
            await fetch(BackendURL+'/appointments', newAppointment);
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
        <div className="container">
            <div className='row'>
                <div className='col-md-4'>
                    <h5>Appointment Scheduler</h5>
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
                    <h6>Appointments</h6>
                    <ul>
                        {appointments.map((appointment, index) => (
                            <li key={index}>
                                {appointment.name} - {new Date(appointment.date).toLocaleString()}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};
