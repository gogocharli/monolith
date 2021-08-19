import * as React from 'react';
import Matter from 'matter-js';
// styles
const pageStyles = {
  color: '#232129',
  padding: 96,
  fontFamily: '-apple-system, Roboto, sans-serif, serif',
};

console.log(Matter);

// markup
const IndexPage = () => {
  return (
    <main style={pageStyles}>
      <h1>Home Page</h1>
    </main>
  );
};

export default IndexPage;
