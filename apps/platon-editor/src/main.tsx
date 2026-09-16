import { render } from 'preact';
import { App } from './app/App';
import { getAppElement } from './app/getAppElement';
import './styles/index.css';

render(<App />, getAppElement(document));
