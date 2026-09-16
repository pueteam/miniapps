import { useEffect } from 'preact/hooks';
import { Editor } from '../features/editor/Editor';
import { registerSW } from './registerSW';
export function App() {
  useEffect(() => { registerSW(); }, []);
  return <Editor />;
}
