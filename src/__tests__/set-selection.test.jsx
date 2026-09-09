import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import App from '../App';

describe('set selection', () => {
  test('offers a clear chamber-entry cue on every selection card', () => {
    const markup = renderToStaticMarkup(<App />);

    expect(markup.match(/Enter chamber/g)).toHaveLength(3);
  });
});
