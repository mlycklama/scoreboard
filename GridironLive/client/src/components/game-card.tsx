import type { Game } from "@shared/schema";

interface GameCardProps {
  game: Game;
}

function generateTeamLogoUrl(teamName: string): string {
  // Use the exact team name as it appears in the data
  return `https://media.idahostatesman.com/static/media/thumb/${teamName}.png`;
}

function generateTeamInitials(teamName: string): string {
  const words = teamName.split(' ');
  const initials = words.length >= 2 ? 
    words[0][0] + words[1][0] : 
    teamName.substring(0, 2);
  return initials.toUpperCase();
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric'
  };
  return date.toLocaleDateString('en-US', options);
}

function getStatusClass(status: string): string {
  if (status.toLowerCase() === 'final') return 'status-final';
  if (status.toLowerCase().includes('live') || status.toLowerCase().includes('q')) return 'status-live';
  return 'status-scheduled';
}

export default function GameCard({ game }: GameCardProps) {
  const dateTime = formatDateTime(game.Date);
  const statusClass = getStatusClass(game.Time);
  const awayLogoUrl = generateTeamLogoUrl(game.Away);
  const homeLogoUrl = generateTeamLogoUrl(game.Home);
  const awayInitials = generateTeamInitials(game.Away);
  const homeInitials = generateTeamInitials(game.Home);
  
  // Determine winner if game is final
  const isFinal = game.Time.toLowerCase() === 'final';
  const awayScore = game.AScore || 0;
  const homeScore = game.HScore || 0;
  const awayWins = isFinal && awayScore > homeScore;
  const homeWins = isFinal && homeScore > awayScore;
  
  return (
    <div 
      className="bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow relative"
      data-testid={`game-card-${game.Away}-${game.Home}`}
    >
      {/* Date and Status */}
      <div className="flex items-center justify-between mb-3 text-sm">
        <div className="text-black font-normal" data-testid="game-datetime">
          {dateTime}
        </div>
        <span 
          className="text-black font-normal"
          data-testid="game-status"
        >
          {game.Time}
        </span>
      </div>
      {/* Away Team */}
      <div className="flex items-center justify-between mb-3 relative">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <img
            src={awayLogoUrl}
            alt={`${game.Away} logo`}
            className="w-12 h-12 object-cover"
            data-testid={`logo-away-${game.Away}`}
            onError={(e) => {
              // Fallback to initials if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent && !parent.querySelector('.logo-fallback')) {
                const fallback = document.createElement('div');
                fallback.className = 'team-logo logo-fallback';
                fallback.textContent = awayInitials;
                parent.appendChild(fallback);
              }
            }}
          />
          <span 
            className="font-bold text-lg md:text-xl text-card-foreground truncate"
            data-testid="team-away-name"
          >
            {game.Away}
          </span>
        </div>
        <span 
          className="text-2xl md:text-3xl font-bold text-card-foreground ml-2"
          data-testid="score-away"
        >
          {game.AScore || '0'}
        </span>
        {awayWins && (
          <div 
            className="absolute -right-4 top-1/2 transform -translate-y-1/2"
            style={{
              width: 0,
              height: 0,
              borderTop: '5px solid transparent',
              borderBottom: '5px solid transparent',
              borderRight: '10px solid #656c79'
            }}
          ></div>
        )}
      </div>
      {/* Home Team */}
      <div className="flex items-center justify-between mb-3 relative">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <img
            src={homeLogoUrl}
            alt={`${game.Home} logo`}
            className="w-12 h-12 object-cover"
            data-testid={`logo-home-${game.Home}`}
            onError={(e) => {
              // Fallback to initials if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent && !parent.querySelector('.logo-fallback')) {
                const fallback = document.createElement('div');
                fallback.className = 'team-logo logo-fallback';
                fallback.textContent = homeInitials;
                parent.appendChild(fallback);
              }
            }}
          />
          <span 
            className="font-bold text-lg md:text-xl text-card-foreground truncate"
            data-testid="team-home-name"
          >
            {game.Home}
          </span>
        </div>
        <span 
          className="text-2xl md:text-3xl font-bold text-card-foreground ml-2"
          data-testid="score-home"
        >
          {game.HScore || '0'}
        </span>
        {homeWins && (
          <div 
            className="absolute -right-4 top-1/2 transform -translate-y-1/2"
            style={{
              width: 0,
              height: 0,
              borderTop: '5px solid transparent',
              borderBottom: '5px solid transparent',
              borderRight: '10px solid #656c79'
            }}
          ></div>
        )}
      </div>
      {/* Details */}
      {game.Details && (
        <div className="text-center text-xs text-muted-foreground" data-testid="game-details">
          {game.Details}
        </div>
      )}
    </div>
  );
}
