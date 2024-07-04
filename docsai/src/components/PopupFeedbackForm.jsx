import React, { useState } from 'react';

const SimplifiedFeedbackModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/send-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          feedback,
          recipientEmail: 'audionotedev@gmail.com'
        }),
      });
      // console.log('Feedback response:', response);
      if (response.ok) {
        setSubmitMessage('Feedback submitted successfully!');
        setFeedback('');
        setName('');
        setTimeout(() => setIsOpen(false), 2000);
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitMessage('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '80px',
          backgroundColor: '#f0f0f0',
          color: '#333',
          padding: '10px 15px',
          border: '1px solid #ccc',
          borderRadius: '5px',
          cursor: 'pointer',
          fontFamily: 'sans-serif',
        }}
      >
        Feedback
      </button>
      
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: '#f5f5f5',
            padding: '30px',
            borderRadius: '8px',
            width: '500px',
            maxWidth: '90%',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          }}>
            <h2 style={{ marginBottom: '20px', color: '#333', fontFamily: 'sans-serif' }}>What can we do better?</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  marginBottom: '15px',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '16px',
                }}
              />
              <textarea
                placeholder="Your feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                style={{
                  width: '100%',
                  marginBottom: '20px',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  height: '150px',
                  fontSize: '16px',
                  resize: 'vertical',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsOpen(false)} style={{
                  backgroundColor: '#e0e0e0',
                  color: '#333',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginRight: '10px',
                  fontSize: '16px',
                }}>
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} style={{
                  backgroundColor: isSubmitting ? '#cccccc' : '#a0a0a0',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: isSubmitting ? 'default' : 'pointer',
                  fontSize: '16px',
                }}>
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
              {submitMessage && <p style={{ marginTop: '10px', color: submitMessage.includes('success') ? 'green' : 'red' }}>{submitMessage}</p>}
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default SimplifiedFeedbackModal;