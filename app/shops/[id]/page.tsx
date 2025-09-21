"use client";
import { useParams } from "next/navigation";
import React from "react";

function page() {
  const { id } = useParams();
  return (
    <div>
      <h1 className="">Shop Details: {id}</h1>
    </div>
  );
}

export default page;
