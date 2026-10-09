import { useScrollReveal } from '../hooks/useScrollReveal';

export function NotFoundPage() {
  useScrollReveal();

  return (
    <div className="container not-found-page animate fadeInUp">
      <h1>404</h1>
      <p>The page you were looking for does not exist.</p>
      <a href="/" className="btn btn-theme btn-md">Go home</a>
    </div>
  );
}
