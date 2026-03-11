import { Link } from "react-router-dom";
import { Heart, MessageCircle, Bookmark, Eye, Star } from "lucide-react";

interface PromptCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  tags: string[];
  rating: number;
  likes: number;
  views: number;
  author: string;
  price?: string;
  platform?: string;
  level?: string;
  taskType?: string;
}

export function PromptCard({ id, title, description, image, tags, rating, likes, views, author, price, platform, level, taskType }: PromptCardProps) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group">
      <Link to={`/prompt/${id}`}>
        <div className="aspect-video bg-muted overflow-hidden">
          <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      </Link>

      <div className="p-4 space-y-3">
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span key={tag} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">{tag}</span>
          ))}
          {platform && <span className="px-2 py-0.5 rounded-md bg-accent/10 text-accent text-xs font-medium">{platform}</span>}
          {level && <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-medium">{level}</span>}
          {taskType && <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs font-medium">{taskType}</span>}
        </div>

        <Link to={`/prompt/${id}`}>
          <h3 className="text-base font-semibold leading-tight hover:text-primary transition-colors">{title}</h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>

        {/* Metrics */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-warning fill-warning" />{rating}</span>
          <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{likes}</span>
          <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{views}</span>
          <span className="ml-auto text-xs">от {author}</span>
        </div>

        {/* Price + Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Link
            to={`/prompt/${id}`}
            className="flex-1 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold text-center hover:opacity-90 transition-opacity"
          >
            {price && price !== "Бесплатно" ? `${price}` : "Использовать"}
          </Link>
          {price && price !== "Бесплатно" && (
            <span className="text-xs font-medium text-muted-foreground">{price === "Бесплатно" ? "" : ""}</span>
          )}
          <button className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors">
            <Heart className="h-4 w-4 text-muted-foreground" />
          </button>
          <button className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors">
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          </button>
          <button className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors">
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
