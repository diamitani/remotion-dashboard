import { Link } from 'lucide-react';
import { RemotionPreview } from '../remotion/RemotionPreview';

type Props = {
  previewUrl: string;
  promptText: string;
};

export const PreviewPanel: React.FC<Props> = ({ previewUrl, promptText }) => {
  return (
    <section className="panel preview-panel">
      <div className="panel-head">
        <h2>Live Preview</h2>
        <a href={previewUrl} target="_blank" rel="noreferrer" className="preview-link">
          <Link size={14} />
          Open Remotion Studio URL
        </a>
      </div>
      <RemotionPreview promptText={promptText} />
      <p className="hint">
        In production, the right panel should point to a secure render session URL generated after auth and workspace provisioning.
      </p>
    </section>
  );
};
