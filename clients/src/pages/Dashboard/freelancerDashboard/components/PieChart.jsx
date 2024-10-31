import React from 'react';
import { Nested } from '@alptugidin/react-circular-progress-bar';

// Function to get a specific color for each badge type
const getBadgeColor = (badgeName) => {
  switch (badgeName.toLowerCase()) {
    case 'bronze':
      return '#CD7F32';
    case 'silver':
      return '#C0C0C0';
    case 'gold':
      return '#FFD700';
    default:
      return getRandomColor();
  }
};

// Function to generate a random hex color for non-badge data
const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const PieChartComponent = ({ data }) => {
  // Transform the data into the format required by Nested
  const circles = data.map(item => ({
    text: item.name,
    value: item.value,
    color: ['Bronze', 'Silver', 'Gold'].includes(item.name) ? getBadgeColor(item.name) : getRandomColor(),
  }));

  console.log(circles)
  return (
    <div className="h-64 md:h-52 w-full max-w-sm mx-auto rounded-lg p-8 border-gray-300/55">
      <Nested
        circles={circles}
        sx={{
          // width: '200px',
          // height: '200px',
          bgColor: '#cbd5e1',
          fontWeight: 'bold',
          fontFamily: 'Trebuchet MS',
          strokeLinecap: 'round',
          loadingTime: 1000,
          valueAnimation: true,
          intersectionEnabled: true
        }}
      />
    </div>
  );
};

export default PieChartComponent;