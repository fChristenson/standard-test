import React from "react";

export const MyComponent: React.FC = () => {
  React.useEffect(() => {
    const logFoobar = () => console.log("foobar");
    window.addEventListener("scroll", logFoobar);

    return () => {
      window.removeEventListener("scroll", logFoobar);
    };
  }, []);

  return <h1>Hello world!</h1>;
};
