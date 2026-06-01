import './presentation/styles/index.css';
import ReactDom from 'react-dom/client';
import { App } from './presentation/App';

ReactDom.createRoot(document.getElementById('root') as HTMLElement).render(
  <App />,
);
