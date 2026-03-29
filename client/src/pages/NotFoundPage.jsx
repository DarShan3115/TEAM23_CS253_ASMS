import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
<<<<<<< HEAD
    <div className="min-h-screen flex flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold text-brand-primary">404</h1>
      <p className="text-xl text-zinc-400 mt-4">Page not found</p>
      <Link to="/" className="mt-6 px-6 py-2 rounded-lg bg-brand-primary text-white hover:bg-brand-accent transition">
=======
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-brand-primary">404</h1>
      <p className="text-xl text-zinc-400 mt-4">Page not found</p>
      <Link
        to="/"
        className="mt-6 px-6 py-2 rounded-lg bg-brand-primary text-white hover:bg-brand-accent transition"
      >
>>>>>>> 8cd2c7e252835807470fb00249b02a3b8b8c44da
        Go Home
      </Link>
    </div>
  );
}
