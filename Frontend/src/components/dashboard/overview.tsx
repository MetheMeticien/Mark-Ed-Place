'use client';

import { useEffect, useState } from 'react';

export function Overview() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Mock data for visualization
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const data2023 = [65, 59, 80, 81, 56, 55, 40, 30, 45, 60, 70, 75];
  const data2024 = [28, 48, 40, 19, 86, 27, 90, 60, 75, 80, 85, 95];
  
  // Return a placeholder while loading or on server
  if (!isClient) {
    return <div className="h-80 w-full animate-pulse rounded-md bg-muted"></div>;
  }
  
  // Simple chart renderer using div elements instead of Chart.js
  // We'll create a custom chart visualization using pure CSS/HTML
  return (
    <div className="h-80 rounded-md border p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium">Annual Performance</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="mr-2 h-3 w-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-muted-foreground">2023</span>
          </div>
          <div className="flex items-center">
            <div className="mr-2 h-3 w-3 rounded-full bg-rose-500"></div>
            <span className="text-sm text-muted-foreground">2024</span>
          </div>
        </div>
      </div>
      
      <div className="flex h-52 items-end space-x-2">
        {months.map((month, index) => (
          <div key={month} className="flex flex-1 flex-col items-center">
            <div className="relative w-full flex-1">
              <div 
                className="absolute bottom-0 left-0 right-0 bg-blue-500/20 transition-all duration-500"
                style={{ 
                  height: `${(data2023[index] / 100) * 100}%`,
                  borderTopWidth: 2,
                  borderColor: 'hsl(221.2 83.2% 53.3%)'
                }}
              ></div>
              <div 
                className="absolute bottom-0 left-0 right-0 bg-rose-500/20 transition-all duration-500 delay-100"
                style={{ 
                  height: `${(data2024[index] / 100) * 100}%`,
                  borderTopWidth: 2,
                  borderColor: 'hsl(346.8 77.2% 49.8%)'
                }}
              ></div>
            </div>
            <span className="mt-2 text-xs text-muted-foreground">{month}</span>
          </div>
        ))}
      </div>
    </div>
  );

}
