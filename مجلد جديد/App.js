import React, { useEffect, useState } from 'react';
import mqtt from 'mqtt';

const App = () => {
  const [message, setMessage] = useState('');
  const [doorbellEnabled, setDoorbellEnabled] = useState(true);

  useEffect(() => {
    const client = mqtt.connect('mqtt://broker.emqx.com');
    client.on('connect', () => {
      client.subscribe('home/doorbell');
      client.subscribe('home/motion');
      client.subscribe('home/notification');
    });
    client.on('message', (topic, payload) => {
      const msg = payload.toString();
      if (topic === 'home/doorbell') {
        setMessage(` Someone is at the door! - ${new Date().toLocaleString()}`);
      } else if (topic === 'home/motion') {
        setMessage(' Motion detected!');
      } else if (topic === 'home/notification') {
        setMessage(` Notification: ${msg} - ${new Date().toLocaleString()}`);
      }
    });
    return () => {
      client.end();
    };
  }, []);

  const toggleDoorbell = () => {
    const command = doorbellEnabled ? 'disable' : 'enable';
    const client = mqtt.connect('mqtt://broker.emqx.com');
    client.on('connect', () => {
      client.publish('home/control', command);
      setDoorbellEnabled(!doorbellEnabled);
      client.end();
    });
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Smart Doorbell</h1>
      <p style={{ fontSize: '20px' }}>{message}</p>
      <button onClick={toggleDoorbell}>
        {doorbellEnabled ? 'Disable Doorbell' : 'Enable Doorbell'}
      </button>
    </div>
  );
};

export default App;