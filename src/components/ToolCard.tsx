import { ArrowUpRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ToolCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
  category: string;
  path?: string;
}

function ToolCard({ name, description, icon: Icon, category, path }: ToolCardProps) {
  const navigate = useNavigate();

  return (
    <button className="tool-card" onClick={() => path && navigate(path)} disabled={!path}>
      <div className="tool-card-top">
        <div className="tool-icon">
          <Icon size={20} />
        </div>
        <ArrowUpRight size={17} className="tool-arrow" />
      </div>

      <div className="tool-category">{category}</div>
      <div className="tool-name">{name}</div>
      <div className="tool-description">{description}</div>
    </button>
  );
}

export default ToolCard;
