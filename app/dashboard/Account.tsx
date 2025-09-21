import React from "react";
import Balance from "./Balance";
import Stats from "./Stats";

function Account() {
  return (
    <div className="flex flex-col gap-2 w-full border h-full">
      <Balance />
      <Stats />
    </div>
  );
}

export default Account;
