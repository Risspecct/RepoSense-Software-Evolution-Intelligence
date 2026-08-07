import { ShieldAlert, GitPullRequest, User, FileCode, Layers } from 'lucide-react';

interface GraphFiltersProps {
  filter: string;
  setFilter: (filter: string) => void;
}

export const GraphFilters = ({ filter, setFilter }: GraphFiltersProps) => {
  const categories = [
    { id: 'all', label: 'All Entities', icon: Layers },
    { id: 'risk', label: 'High Risk Only', icon: ShieldAlert },
    { id: 'commit', label: 'PRs & Commits', icon: GitPullRequest },
    { id: 'developer', label: 'Developers', icon: User },
    { id: 'file', label: 'Source Files', icon: FileCode },
  ];

  return (
    <div className="absolute top-4 left-4 z-40 flex items-center gap-2 bg-white/90 backdrop-blur-md p-1.5 rounded-xl border border-[#E4E1D8] shadow-md">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isActive = filter === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => setFilter(cat.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-code font-bold transition-all cursor-pointer ${
              isActive
                ? 'bg-[#243B6B] text-white shadow-sm'
                : 'text-[#5B5F6B] hover:text-[#171A21] hover:bg-[#F1F0EC]'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
};