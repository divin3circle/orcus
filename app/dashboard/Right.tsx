import React from "react";
import Campaigns from "./Campaigns";
import Withdraw from "./Withdraw";

function Right() {
  return (
    <div className="flex flex-col-reverse gap-2 w-full xl:w-1/4">
      <Campaigns />
      <Withdraw />
    </div>
  );
}

export default Right;
