import { Instagram, Linkedin, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SocialMediaIconsProps {
  instagramUrl?: string;
  tiktokUrl?: string;
  xUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
}

const SocialMediaIcons = ({ 
  instagramUrl, 
  tiktokUrl, 
  xUrl, 
  youtubeUrl, 
  linkedinUrl 
}: SocialMediaIconsProps) => {
  const socialLinks = [
    {
      url: instagramUrl,
      icon: Instagram,
      label: "Instagram",
      color: "hover:text-pink-600",
    },
    {
      url: tiktokUrl,
      icon: () => (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.321 5.562c-.756-.466-1.35-1.143-1.691-1.932l-.341-.002c-.084-.002-.168-.003-.252-.005-.025 0-.049 0-.074.001H14.25v11.172c0 2.414-1.961 4.375-4.375 4.375S5.5 17.209 5.5 14.795s1.961-4.375 4.375-4.375c.24 0 .475.02.705.058V7.422c-.228-.024-.46-.037-.705-.037C5.184 7.385 1.5 11.068 1.5 15.75s3.684 8.365 8.375 8.365 8.375-3.683 8.375-8.365V8.689c1.486 1.067 3.315 1.697 5.295 1.697v-3.055c-1.555 0-2.947-.623-3.981-1.633l-.243-.236z"/>
        </svg>
      ),
      label: "TikTok",
      color: "hover:text-black",
    },
    {
      url: xUrl,
      icon: () => (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      label: "X",
      color: "hover:text-black",
    },
    {
      url: youtubeUrl,
      icon: Youtube,
      label: "YouTube",
      color: "hover:text-red-600",
    },
    {
      url: linkedinUrl,
      icon: Linkedin,
      label: "LinkedIn",
      color: "hover:text-blue-600",
    },
  ];

  const validLinks = socialLinks.filter(link => link.url && link.url.trim() !== "");

  if (validLinks.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 mt-4">
      <span className="text-sm text-muted-foreground">Follow me:</span>
      <div className="flex gap-2">
        {validLinks.map((link, index) => {
          const IconComponent = link.icon;
          return (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className={`h-8 w-8 p-0 ${link.color} transition-colors`}
              asChild
            >
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit ${link.label} profile`}
              >
                <IconComponent className="h-4 w-4" />
              </a>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default SocialMediaIcons;