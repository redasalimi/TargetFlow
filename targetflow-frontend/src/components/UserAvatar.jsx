import React from 'react';

const UserAvatar = ({ name, size = 32 }) => {
  const initials = (name || 'U').charAt(0).toUpperCase();
  
  // Deterministic color based on name
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#EC4899', '#00E5C4'
  ];
  const charCode = (name || 'U').charCodeAt(0);
  const color = colors[charCode % colors.length];

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: `linear-gradient(135deg, ${color}, ${color}CC)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: size * 0.45,
      fontFamily: 'var(--font-display)',
      boxShadow: `0 4px 12px ${color}40`,
      flexShrink: 0
    }}>
      {initials}
    </div>
  );
};

export default UserAvatar;
