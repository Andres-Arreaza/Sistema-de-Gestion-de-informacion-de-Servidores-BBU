import React, { useState, useEffect } from 'react';

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
            const response = await fetch(`https://hallowed-corpse-r4rvjwwg65wr2wqr9-3001.app.github.dev/api/appointments`, { method: 'GET', });
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
            const response = await fetch(`https://hallowed-corpse-r4rvjwwg65wr2wqr9-3001.app.github.dev/api/appointments`, {
                method: 'POST',
                body: JSON.stringify(newAppointment),
                headers: {
                    "Content-Type": "application/json"
                },
            });

            const contentType = response.headers.get("content-type");
            if (!response.ok) {
                if (contentType && contentType.includes("application/json")) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Error adding appointment');
                } else {
                    throw new Error('Unexpected error occurred.');
                }
            }

            if (contentType && contentType.includes("application/json")) {
                const addedAppointment = await response.json();
                setAppointments([...appointments, addedAppointment]);
            } else {
                throw new Error('Unexpected content type.');
            }

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