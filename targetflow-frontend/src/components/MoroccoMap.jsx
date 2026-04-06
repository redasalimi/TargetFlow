import React from 'react';

const MoroccoMap = ({ data }) => {
  // Simplified SVG paths for major Moroccan regions/areas for heat-mapping
  // This is a representative SVG for the "Carte Maroc Heatmap" mentioned in report
  
  const regions = [
    { id: 'north', name: 'Tanger-Tétouan-Al Hoceïma', path: 'M180,20 L210,20 L220,50 L190,60 Z', value: data?.regions?.north || 0 },
    { id: 'center', name: 'Casablanca-Settat / Rabat', path: 'M150,60 L190,60 L200,120 L140,130 Z', value: data?.regions?.center || 0 },
    { id: 'south', name: 'Marrakech-Safi / Agadir', path: 'M100,130 L160,130 L140,220 L80,210 Z', value: data?.regions?.south || 0 },
    { id: 'east', name: 'L\'Oriental', path: 'M210,20 L260,40 L250,110 L200,120 Z', value: data?.regions?.east || 0 },
    { id: 'sahara', name: 'Provinces du Sud', path: 'M20,210 L100,210 L60,350 L10,340 Z', value: data?.regions?.sahara || 0 },
  ];

  const getColor = (val) => {
    if (val > 60) return '#00E5C4'; // High concentration
    if (val > 30) return '#3B82F6'; // Medium
    if (val > 5)  return '#4B5563'; // Low
    if (val > 0)  return '#2D3748'; // Minimum
    return 'rgba(255,255,255,0.03)';
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '400px', display: 'flex', justifyContent: 'center', background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', padding: 20 }}>
      <div style={{ position: 'absolute', top: 20, left: 24, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>
        Distribution Géographique (Maroc)
      </div>
      
      <svg viewBox="0 0 300 400" style={{ height: '100%', filter: 'drop-shadow(0 0 20px rgba(0,229,196,0.1))' }}>
        {regions.map((reg) => (
          <path
            key={reg.id}
            d={reg.path}
            fill={getColor(reg.value)}
            stroke="var(--border)"
            strokeWidth="1"
            style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
            onMouseEnter={(e) => e.target.style.fill = 'var(--accent)'}
            onMouseLeave={(e) => e.target.style.fill = getColor(reg.value)}
          >
            <title>{reg.name}: {reg.value} clients</title>
          </path>
        ))}
      </svg>

      <div style={{ position: 'absolute', bottom: 20, right: 24, fontSize: 11, color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: '#00E5C4' }} /> High Value
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: '#3B82F6' }} /> Emerging
        </div>
      </div>
    </div>
  );
};

export default MoroccoMap;
