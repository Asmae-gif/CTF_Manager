import { Link } from 'react-router-dom';

export default function Teams() {
  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl mb-4">Teams</h1>
      <div className="flex gap-4">
        <Link to="/teams/create" className="px-4 py-2 bg-pirate-cyan text-black rounded">
          Créer une équipe
        </Link>
        <Link to="/teams/join" className="px-4 py-2 bg-pirate-cyan text-black rounded">
          Rejoindre une équipe
        </Link>
      </div>
    </div>
  );
}