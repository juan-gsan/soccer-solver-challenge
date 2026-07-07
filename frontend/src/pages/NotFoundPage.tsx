import type { JSX } from "react";
import { Link } from "react-router-dom";

function NotFoundPage(): JSX.Element {
  return (
    <div className="not-found">
      <h1>Cannot reach the page</h1>
      <p>URL you are trying to access does not exists</p>
      <Link to="/" className="button">
        Go back to Homepage
      </Link>
    </div>
  );
}

export default NotFoundPage;
