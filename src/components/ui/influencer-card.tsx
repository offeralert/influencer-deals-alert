
const checkFollowingStatus = async () => {
  if (!user) return;
  
  try {
    const { data, error } = await supabase
      .from('follows')
      .select('*')
      .eq('user_id', user.id)
      .eq('influencer_id', id)
      .maybeSingle();
    
    if (!error && data) {
      setIsFollowing(true);
    } else {
      setIsFollowing(false);
    }
  } catch (error) {
    console.error("Error checking follow status:", error);
  }
};

// Add real-time subscription for follow status
useEffect(() => {
  if (!user) return;

  checkFollowingStatus();
  
  const channel = supabase
    .channel('follow-status')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'follows',
        filter: `user_id=eq.${user.id} AND influencer_id=eq.${id}`
      },
      () => {
        checkFollowingStatus();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [user, id]);
