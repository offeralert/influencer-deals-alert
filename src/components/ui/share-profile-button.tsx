
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useMetaTracking } from "@/hooks/useMetaTracking";

interface ShareProfileButtonProps {
  influencerId: string;
  influencerName: string;
  username: string;
}

const ShareProfileButton = ({ influencerId, influencerName, username }: ShareProfileButtonProps) => {
  const [copied, setCopied] = useState(false);
  const { track } = useMetaTracking();

  const profileUrl = `${window.location.origin}/influencer/${influencerId}`;
  const shareText = `Check out ${influencerName}'s exclusive promo codes and deals on Offer Alert! 💰`;

  const handleShare = async () => {
    // Track share event
    await track('Share', {
      content_name: 'influencer_profile',
      content_category: 'profile_sharing',
      content_ids: [influencerId],
      value: 0
    });

    // Try native Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${influencerName} on Offer Alert`,
          text: shareText,
          url: profileUrl,
        });
        toast.success("Profile shared successfully!");
        return;
      } catch (error) {
        // User cancelled or share failed, fall back to clipboard
        console.log("Native share cancelled or failed:", error);
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(`${shareText}\n\n${profileUrl}`);
      setCopied(true);
      toast.success("Profile link copied to clipboard!");
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      toast.error("Failed to copy link. Please try again.");
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      size="sm"
      className="ml-2"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 mr-2" />
          Copied!
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4 mr-2" />
          Share Profile
        </>
      )}
    </Button>
  );
};

export default ShareProfileButton;
