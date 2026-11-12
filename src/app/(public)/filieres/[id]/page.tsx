"use client";

import React from "react";
import { useParams } from "next/navigation";

const FilierePage = () => {
  const { id } = useParams<{ id: string }>();

  return <div>{id}</div>;
};

export default FilierePage;
