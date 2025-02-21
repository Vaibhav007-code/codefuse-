import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { setContestReminder } from '../utils/api';

const ReminderModal = ({ show, handleClose, contest }) => {
  const [reminderTime, setReminderTime] = useState('');
  const [isSet, setIsSet] = useState(false);

  const handleSubmit = () => {
    if (!reminderTime || !contest) return;
    
    const reminderDate = new Date(reminderTime);
    setContestReminder(contest.id, reminderDate);
    scheduleNotification(contest.name, reminderDate);
    setIsSet(true);
    setTimeout(handleClose, 1500);
  };

  const scheduleNotification = (contestName, date) => {
    const timeout = date.getTime() - Date.now();
    if (timeout > 0 && Notification.permission === 'granted') {
      setTimeout(() => {
        new Notification('CodeFuse Reminder', {
          body: `${contestName} is starting soon!`,
          icon: 'https://i.ibb.co/HT9f09zr/codefuse-logo.png'
        });
      }, timeout);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Set Reminder for {contest?.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isSet ? (
          <div className="text-center text-success">
            <h5>✓ Reminder Set Successfully!</h5>
          </div>
        ) : (
          <>
            <Form.Label>Select Reminder Time</Form.Label>
            <Form.Control
              type="datetime-local"
              min={new Date().toISOString().slice(0, 16)}
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
            />
            <div className="mt-2 text-muted small">
              You'll receive a browser notification at this time
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        {!isSet && (
          <Button variant="primary" onClick={handleSubmit}>
            Set Reminder
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ReminderModal;