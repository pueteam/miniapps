import { Editor } from '../features/editor/Editor';
import { registerSW } from './registerSW';
registerSW();
export function App() { return <Editor />; }
