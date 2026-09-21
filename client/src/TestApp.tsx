const TestApp = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>EduTrack Admin Dashboard</h1>
      <p>JSX is working correctly!</p>
      <div style={{ marginTop: '20px' }}>
        <button onClick={() => alert('Login bypassed - Admin access granted!')}>
          Access Admin Dashboard
        </button>
      </div>
    </div>
  );
};

export default TestApp;