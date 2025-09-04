import React, { useState, useEffect } from 'react';
import { RefreshCw, Clock, Calendar } from 'lucide-react';

const FootballScoreboard = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Your JSON URL - replace this with your actual URL
  const JSON_URL = "https://script.googleusercontent.com/a/macros/idahostatesman.com/echo?user_content_key=AehSKLhVmP98gRml3OOgBzjmOpQ7Vm75rDOC_lQ2FMxNREPmzBqzmxZYonc1NnrmHmrng5ENr0YW4FoCqLbmVI65iKVR2sLBHtF6TZQoaDhhC92k75Xuwpy_M0WVIbUfM1Rw255QD2j8nfMYYmM1WmkFQN6smjYq0SVG84WOHTquYTgMyD08MBW79Zw7ohCk7_UjWKkbSENqbqlayILiiSr4x0q9Jr5aWMHIlZDTLlm4WRHCTAVB62F3i-a57_JUZ8BMBlTFABTn62Lsa4l5TvZ0HjEE0ALtBh00KlQYO6kUOTeuNIRasggGwjM8GthReA&lib=M31nNDai410zvYaHZ4Pp4gKaDfETvgIFd";

  // CSV URL from Google Sheets "Publish to web" 
  // Replace this with your actual published CSV URL
  const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSpxQAhO2WLo8Vahm7O75yJA8J0XpD-kmZ2n8ohnyOGHNz_fSypbwYER9QK33DBAXQ-MPgnjwyP-el7/pub?gid=0&single=true&output=csv";

  const fetchScores = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching CSV data...');
      
      // Fetch the CSV data directly
      const response = await fetch(CSV_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const csvText = await response.text();
      
      // Parse CSV manually (simple parsing)
      const lines = csvText.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('No data found in the CSV');
      }
      
      // Parse headers
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      const gameData = [];
      
      // Parse each data row
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
        
        if (values.length < headers.length) continue; // Skip incomplete rows
        
        const game = {};
        
        // Map values to headers
        headers.forEach((header, index) => {
          const value = values[index] || '';
          const normalizedHeader = header.toLowerCase().trim();
          
          // Map common column names to our expected fields
          if (normalizedHeader.includes('home') && normalizedHeader.includes('team')) {
            game.homeTeam = value;
          } else if (normalizedHeader.includes('away') && normalizedHeader.includes('team')) {
            game.awayTeam = value;
          } else if (normalizedHeader.includes('visitor') && normalizedHeader.includes('team')) {
            game.awayTeam = value; // Alternative name for away team
          } else if (normalizedHeader.includes('home') && normalizedHeader.includes('score')) {
            game.homeScore = parseInt(value) || 0;
          } else if (normalizedHeader.includes('away') && normalizedHeader.includes('score')) {
            game.awayScore = parseInt(value) || 0;
          } else if (normalizedHeader.includes('visitor') && normalizedHeader.includes('score')) {
            game.awayScore = parseInt(value) || 0;
          } else if (normalizedHeader.includes('status') || normalizedHeader.includes('time')) {
            game.status = value;
            game.time = value;
          } else if (normalizedHeader.includes('date')) {
            game.date = value;
          } else {
            // Store other fields using original header name
            game[header] = value;
          }
        });
        
        // Only add games that have team names
        if (game.homeTeam && game.awayTeam) {
          gameData.push(game);
        }
      }
      
      console.log('Parsed games:', gameData);
      setGames(gameData);
      setLastUpdated(new Date());
      setLoading(false);
      
    } catch (err) {
      console.error('Error loading scores:', err);
      
      // Provide helpful error messages
      if (err.message.includes('Failed to fetch')) {
        setError('Cannot access the CSV. Make sure your Google Sheet is published to web as CSV and publicly accessible.');
      } else {
        setError(`Error loading scores: ${err.message}`);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchScores, 120000);
    return () => clearInterval(interval);
  }, []);

  const getTeamLogo = (teamName) => {
    // Clean team name for logo lookup
    const cleanName = teamName?.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
    
    // Try multiple logo sources
    const logoSources = [
      `https://a.espncdn.com/i/teamlogos/ncaa/500/${cleanName}.png`,
      `https://logos-world.net/wp-content/uploads/2020/06/${cleanName}-logo.png`,
      `https://www.sports-logos-screensavers.com/user/NCAA_Football/${teamName?.replace(/\s+/g, '_')}.gif`
    ];
    
    return logoSources[0]; // Primary source
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    // Handle various time formats
    if (timeString.toLowerCase() === 'final') return 'FINAL';
    if (timeString.toLowerCase().includes('half')) return timeString.toUpperCase();
    return timeString;
  };

  const getGameStatus = (game) => {
    if (game.final || game.status === 'final') return 'final';
    if (game.live || game.status === 'live') return 'live';
    if (game.upcoming || game.status === 'upcoming') return 'upcoming';
    return 'scheduled';
  };

  const GameCard = ({ game }) => {
    const status = getGameStatus(game);
    
    return (
      <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6 hover:shadow-xl transition-shadow duration-300">
        {/* Game Status Bar */}
        <div className="flex items-center justify-between mb-4">
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
            status === 'live' ? 'bg-green-600 text-green-100 animate-pulse' :
            status === 'final' ? 'bg-red-600 text-red-100' :
            'bg-gray-600 text-gray-200'
          }`}>
            {status === 'live' && <span className="inline-block w-2 h-2 bg-green-300 rounded-full mr-2"></span>}
            {formatTime(game.time || game.status || 'TBD')}
          </div>
          
          {game.date && (
            <div className="flex items-center text-gray-400 text-sm">
              <Calendar className="w-4 h-4 mr-1" />
              {game.date}
            </div>
          )}
        </div>

        {/* Teams */}
        <div className="space-y-4">
          {/* Away Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="w-12 h-12 flex-shrink-0">
                <img
                  src={getTeamLogo(game.awayTeam || game.away)}
                  alt={`${game.awayTeam || game.away} logo`}
                  className="w-full h-full object-contain rounded"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiM0QjVTNjMiLz4KPHRLEHA9iB0ZXh0LWFuY2hvcjogbWlkZGxlOyIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjRTVFN0VCIj50ZWFtPC90ZXh0Pgo8L3N2Zz4K';
                  }}
                />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">
                  {game.awayTeam || game.away || 'Team 1'}
                </h3>
              </div>
            </div>
            <div className="text-3xl font-bold text-white min-w-[3rem] text-right">
              {game.awayScore ?? game.awayPoints ?? '--'}
            </div>
          </div>

          {/* Home Team */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="w-12 h-12 flex-shrink-0">
                <img
                  src={getTeamLogo(game.homeTeam || game.home)}
                  alt={`${game.homeTeam || game.home} logo`}
                  className="w-full h-full object-contain rounded"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiM0QjVTNjMiLz4KPHRLEHA9iB0ZXh0LWFuY2hvcjogbWlkZGxlOyIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSIjRTVFN0VCIj50ZWFtPC90ZXh0Pgo8L3N2Zz4K';
                  }}
                />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">
                  {game.homeTeam || game.home || 'Team 2'}
                </h3>
              </div>
            </div>
            <div className="text-3xl font-bold text-white min-w-[3rem] text-right">
              {game.homeScore ?? game.homePoints ?? '--'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 text-gray-300 animate-spin mx-auto mb-4" />
            <p className="text-gray-300">Loading scores...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded mb-4">
              <p className="font-bold">Error loading scores</p>
              <p>{error}</p>
            </div>
            <button
              onClick={fetchScores}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-4 text-gray-300">
            {lastUpdated && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span className="text-sm">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              </div>
            )}
            <button
              onClick={fetchScores}
              className="flex items-center space-x-1 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-lg shadow hover:shadow-md transition-shadow"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm">Refresh</span>
            </button>
          </div>
        </div>

        {/* Games Grid */}
        {games.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-300 text-lg">No games scheduled</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game, index) => (
              <GameCard key={index} game={game} />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-400 text-sm">
          <p>Scores update automatically every 2 minutes</p>
        </div>
      </div>
    </div>
  );
};

export default FootballScoreboard;