import React from "react";

type HelloProps = {
  name: string;
  age?: number;
};

export const Hello = ({ name, age }: HelloProps) => {
  return (
    <div>
      Hello, {name}! {age && `You are ${age} years old.`}
    </div>
  );
};
