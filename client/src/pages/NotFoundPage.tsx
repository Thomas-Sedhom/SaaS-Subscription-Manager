import { Link } from 'react-router-dom';

import Button from '../components/Button';
import CardPanel from '../components/CardPanel';

export default function NotFoundPage() {
  return (
    <div className="page-shell">
      <CardPanel title="Page not found" subtitle="The page you requested does not exist in the current client router.">
        <div className="stack">
          <p className="helper-text">Use the main navigation to move back into the subscription manager workflow.</p>
          <Link to="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </CardPanel>
    </div>
  );
}
