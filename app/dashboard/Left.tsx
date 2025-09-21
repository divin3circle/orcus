import React from "react";
import RecentTransactions from "./RecentTransactions";
import Shops from "./Shops";
import Account from "./Account";

function Left() {
  return (
    <div className="flex flex-col-reverse md:flex-row gap-2 border w-full xl:w-3/4 h-full">
      <div className="flex flex-col gap-2 w-full md:w-[40%] border h-full">
        <RecentTransactions />
        <Shops />
      </div>
      <Account />
    </div>
  );
}

export default Left;
