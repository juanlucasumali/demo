import React from 'react';

const NavigationPane: React.FC = () => {
  return (
    <div className="w-64 border-r overflow-y-auto">
      <div className="p-4">
        <p className="font-semibold">Folders</p>
        {/* List folders and files here */}
      </div>
    </div>
  );
};

export default NavigationPane;
