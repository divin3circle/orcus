import React from "react";
import DashboardHeader from "./DashboardHeader";
import Left from "./Left";
import Right from "./Right";

function Dashboard() {
  return (
    <div className="max-w-[1480px] mx-auto my-0 px-1 md:h-[calc(100vh-100px)]">
      <DashboardHeader />
      <div className="flex flex-col xl:flex-row gap-2 mt-4 justify-between h-full">
        <Left />
        <Right />
      </div>
    </div>
  );
}

export default Dashboard;
