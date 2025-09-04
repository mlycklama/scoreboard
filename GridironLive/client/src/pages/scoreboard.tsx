import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import GameCard from "@/components/game-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";
import type { GamesResponse } from "@shared/schema";

function LoadingCard() {
  return (
    <div className="bg-card rounded-lg border border-border p-4 pulse-loading">
      <Skeleton className="h-4 w-24 mb-4 mx-auto" />
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-full" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-8 w-12" />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-full" />
          <Skeleton className="h-6 w-28" />
        </div>
        <Skeleton className="h-8 w-12" />
      </div>
    </div>
  );
}

export default function Scoreboard() {
  const { 
    data: gamesResponse, 
    isLoading, 
    isError, 
    error, 
    refetch,
    dataUpdatedAt 
  } = useQuery<GamesResponse>({
    queryKey: ['/api/games'],
    refetchInterval: 2 * 60 * 1000, // 2 minutes in milliseconds
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  const games = gamesResponse?.data || [];
  const lastUpdated = new Date(dataUpdatedAt);
  const timeString = lastUpdated.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit'
  });

  useEffect(() => {
    document.title = "Live High School Football Scoreboard";
  }, []);

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-primary text-primary-foreground py-6 px-4">
          <div className="max-w-7xl mx-auto">
          </div>
        </header>

        {/* Error State */}
        <div className="max-w-7xl mx-auto p-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Unable to Load Games
            </h2>
            <p className="text-red-600 mb-4">
              {error instanceof Error 
                ? `Error: ${error.message}` 
                : "There was an error fetching the latest scores. Please try again."
              }
            </p>
            <Button 
              onClick={() => refetch()} 
              className="bg-primary text-primary-foreground hover:opacity-90"
              data-testid="button-retry"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Loading
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center gap-3">
            <Button
              onClick={() => refetch()}
              disabled={isLoading}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              size="sm"
              data-testid="button-refresh"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <div className="flex items-center text-sm opacity-90">
              <span data-testid="text-last-updated">
                {isLoading ? "Loading..." : `Last updated: ${timeString}`}
              </span>
              <div className="ml-2 w-2 h-2 bg-green-400 rounded-full opacity-75"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 8 }).map((_, index) => (
              <LoadingCard key={index} />
            ))
          ) : games.length === 0 ? (
            // Empty state
            <div className="col-span-full text-center py-12" data-testid="empty-state">
              <h2 className="text-xl font-semibold text-muted-foreground mb-2">
                No Games Available
              </h2>
              <p className="text-muted-foreground">
                Check back later for upcoming games.
              </p>
            </div>
          ) : (
            // Game cards
            games.map((game, index) => (
              <GameCard key={`${game.Away}-${game.Home}-${index}`} game={game} />
            ))
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm opacity-90">
            Auto-refreshes every 2 minutes • Last updated: 
            <span className="ml-1" data-testid="text-footer-last-updated">
              {isLoading ? "Loading..." : timeString}
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}
