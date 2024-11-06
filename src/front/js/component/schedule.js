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
        try {
            const response = await fetch(`https://hallowed-corpse-r4rvjwwg65wr2wqr9-3000.app.github.dev/appointments`);
            if (!response.ok) {
                throw new Error('Error fetching appointments');
            }
            const data = await response.json();
            setAppointments(data);
        } catch (error) {
            setErrorMessage('Error fetching appointments. Please try again.');
        }
    };

    const addAppointment = async (e) => {
        e.preventDefault();
        const newAppointment = { name, date };

        try {
            const response = await fetch(`https://hallowed-corpse-r4rvjwwg65wr2wqr9-3000.app.github.dev/appointments`, {
                method: 'POST',
                body: JSON.stringify(newAppointment),
                headers: {
                    "Content-Type": "application/json"
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error adding appointment');
            }
            const appointment = await newAppointment.json();

            // Assuming the response contains the added appointment
            const addedAppointment = await response.json();
            setAppointments([...appointments, addedAppointment]);
            setName('');
            setDate('');
            setErrorMessage(''); // Clear any previous error message
        } catch (error) {
            setErrorMessage(error.message || 'Error adding appointment. Please try again.');
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