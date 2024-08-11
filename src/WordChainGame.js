import React, { useState, useRef, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

const animalEmojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵'];

// Componente de Confeti
const Confetti = () => {
  return (
    <div className="confetti-container">
      {[...Array(100)].map((_, i) => (
        <div key={i} className="confetti" style={{
          '--fall-delay': `${Math.random() * 5}s`,
          '--fall-duration': `${Math.random() * 5 + 5}s`,
          '--x-end': `${Math.random() * 100}vw`,
          '--rotation': `${Math.random() * 360}deg`,
          '--color': `hsl(${Math.random() * 360}, 100%, 50%)`
        }} />
      ))}
      <style jsx>{`
        .confetti-container {
          position: fixed;
          top: -20px;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: 1000;
        }
        .confetti {
          position: absolute;
          width: 10px;
          height: 20px;
          background: var(--color);
          top: -20px;
          opacity: 0;
          animation: fall var(--fall-duration) var(--fall-delay) linear infinite;
        }
        @keyframes fall {
          0% {
            opacity: 1;
            top: -20px;
            transform: translateX(calc(var(--x-end) - 50vw)) rotate(0deg);
          }
          100% {
            opacity: 0.7;
            top: 100vh;
            transform: translateX(calc(var(--x-end) - 50vw)) rotate(var(--rotation));
          }
        }
      `}</style>
    </div>
  );
};

const WordChainGame = () => {
  const [words, setWords] = useState([]);
  const [currentWord, setCurrentWord] = useState('');
  const [message, setMessage] = useState('');
  const [turn, setTurn] = useState(Math.random() < 0.5 ? 'player1' : 'player2');
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [winner, setWinner] = useState(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameState, setGameState] = useState('selectingEmojis');
  const [playerEmojis, setPlayerEmojis] = useState({ player1: null, player2: null });
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const [darkMode, setDarkMode] = useState(false);
  const titleLetters = "Cadena de Palabras".split("");
  
  useEffect(() => {
    if (gameState === 'playing' && !winner) {
      inputRef.current.focus();
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current);
            handleTimeUp();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [turn, winner, gameState]);

  const handleTimeUp = () => {
    const newScores = { ...scores };
    newScores[turn]--;
    if (newScores[turn] < 0) newScores[turn] = 0;
    setScores(newScores);
    setMessage('¡Tiempo agotado! -1 punto');
    nextTurn();
  };

  const nextTurn = () => {
    setTurn(turn === 'player1' ? 'player2' : 'player1');
    setTimeLeft(30);
    setCurrentWord('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (winner) return;

    if (gameState === 'ready') {
      setGameState('playing');
      return;
    }

    clearInterval(timerRef.current);
    const trimmedWord = currentWord.trim().toLowerCase();
    
    if (trimmedWord === '') {
      setMessage('Por favor, ingresa una palabra.');
      return;
    }

    let isValid = true;
    let reason = '';

    if (words.includes(trimmedWord)) {
      isValid = false;
      reason = 'repetida';
    } else if (words.length > 0) {
      const lastWord = words[words.length - 1].toLowerCase();
      if (trimmedWord[0] !== lastWord[lastWord.length - 1]) {
        isValid = false;
        reason = 'inválida';
      }
    }

    setWords([...words, trimmedWord]);

    const newScores = { ...scores };
    if (isValid) {
      newScores[turn]++;
      setMessage('¡Palabra válida! +1 punto');
    } else {
      newScores[turn]--;
      if (newScores[turn] < 0) newScores[turn] = 0;
      setMessage(`Palabra ${reason}. -1 punto`);
    }
    setScores(newScores);

    if (newScores[turn] >= 5) {
      setWinner(turn);
      setMessage(`¡${turn === 'player1' ? 'Jugador 1' : 'Jugador 2'} ha ganado!`);
    } else {
      nextTurn();
    }
  };

  const resetGame = () => {
    clearInterval(timerRef.current);
    setWords([]);
    setCurrentWord('');
    setMessage('');
    setTurn(Math.random() < 0.5 ? 'player1' : 'player2');
    setScores({ player1: 0, player2: 0 });
    setWinner(null);
    setTimeLeft(30);
    setGameState('selectingEmojis');
    setPlayerEmojis({ player1: null, player2: null });
  };

  const handleEmojiSelect = (player, emoji) => {
    setPlayerEmojis(prev => ({ ...prev, [player]: emoji }));
    if (player === 'player2' && playerEmojis.player1) {
      setGameState('ready');
    }
  };

  if (gameState === 'selectingEmojis') {
    return (
      <div className="min-h-screen w-full flex flex-col justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 p-4">
        <h1 className="text-4xl font-bold mb-6 text-center text-white drop-shadow-lg">
          Elige tu Animal
        </h1>
        {['player1', 'player2'].map((player) => (
          <div key={player} className="mb-6">
            <h2 className="text-2xl font-bold mb-4 text-white text-center">
              {player === 'player1' ? 'Jugador 1' : 'Jugador 2'}:
            </h2>
            <div className="grid grid-cols-5 gap-2 max-w-xs mx-auto">
              {animalEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleEmojiSelect(player, emoji)}
                  className={`text-4xl bg-white rounded-full p-2 hover:bg-yellow-200 transition-colors ${playerEmojis[player] === emoji ? 'ring-4 ring-yellow-400' : ''}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const getThemeClass = (lightClass, darkClass) => {
    return darkMode ? darkClass : lightClass;
  };

  return (
    <div className={`min-h-screen w-full flex flex-col p-4 ${getThemeClass('bg-gradient-to-r from-purple-400 via-pink-500 to-red-500', 'bg-gradient-to-r from-gray-800 via-gray-900 to-black')}`}>
      {winner && <Confetti />}
      <div className="flex justify-end mb-4">
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-full ${getThemeClass('bg-yellow-300 text-gray-800', 'bg-indigo-600 text-white')} transition-colors duration-200`}
        >
          {darkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </div>
      <h1 className={`text-4xl font-bold mb-8 text-center ${getThemeClass('text-white', 'text-gray-100')} drop-shadow-lg`}>
        {titleLetters.map((letter, index) => (
          <span 
            key={index} 
            className="inline-block transition-all duration-300 hover:transform hover:scale-125 hover:rotate-6"
            style={{
              animation: `bounce 0.5s ease-in-out ${index * 0.1}s infinite alternate`,
            }}
          >
            {letter === " " ? "\u00A0" : letter}
          </span>
        ))}
      </h1>
      <div className="flex-grow flex flex-col justify-between">
        <div>
          <div className={`mb-4 flex justify-between items-center ${getThemeClass('bg-white', 'bg-gray-700')} rounded-full p-3 shadow-inner`}>
            <div className={`${getThemeClass('text-blue-600', 'text-blue-300')} font-bold text-lg flex items-center`}>
              {playerEmojis.player1} {scores.player1}
            </div>
            <div className={`text-xl font-extrabold ${getThemeClass('bg-yellow-400 text-white', 'bg-yellow-600 text-gray-100')} rounded-full w-12 h-12 flex items-center justify-center border-2 ${getThemeClass('border-white', 'border-gray-600')} shadow-lg`}>
              {timeLeft}
            </div>
            <div className={`${getThemeClass('text-green-600', 'text-green-300')} font-bold text-lg flex items-center`}>
              {scores.player2} {playerEmojis.player2}
            </div>
          </div>
          <form onSubmit={handleSubmit} className="mb-4">
            <input
              type="text"
              value={currentWord}
              onChange={(e) => setCurrentWord(e.target.value)}
              placeholder="Escribe una palabra"
              className={`w-full p-3 border-2 ${getThemeClass('border-yellow-400 bg-white text-gray-800', 'border-indigo-400 bg-gray-700 text-white')} rounded-full text-lg mb-3 focus:outline-none focus:border-blue-500 transition duration-300`}
              ref={inputRef}
              disabled={winner !== null || gameState === 'ready'}
            />
            <button 
              type="submit" 
              className={`w-full px-4 py-3 ${getThemeClass('bg-green-500 hover:bg-green-600', 'bg-green-600 hover:bg-green-700')} text-white rounded-full text-lg font-bold transition duration-300 mb-3 transform hover:scale-105`}
              disabled={winner !== null}
            >
              {gameState === 'ready' ? '¡Comenzar!' : '¡Enviar!'}
            </button>
            <button 
              type="button" 
              onClick={resetGame} 
              className={`w-full px-4 py-3 ${getThemeClass('bg-red-500 hover:bg-red-600', 'bg-red-600 hover:bg-red-700')} text-white rounded-full text-lg font-bold transition duration-300 transform hover:scale-105`}
            >
              Reiniciar Juego
            </button>
          </form>
          {message && (
            <div className={`border-2 px-4 py-3 rounded-xl relative mb-4 text-center font-bold text-base ${
              message.includes('ganado') ? getThemeClass('bg-green-100 border-green-500 text-green-700', 'bg-green-800 border-green-600 text-green-100') :
              message.includes('válida') ? getThemeClass('bg-blue-100 border-blue-500 text-blue-700', 'bg-blue-800 border-blue-600 text-blue-100') :
              getThemeClass('bg-red-100 border-red-500 text-red-700', 'bg-red-800 border-red-600 text-red-100')
            }`} role="alert">
              <span className="block sm:inline">{message}</span>
            </div>
          )}
        </div>
        <div className={`mt-4 ${getThemeClass('bg-white', 'bg-gray-800')} rounded-xl p-4 shadow-inner flex-grow overflow-auto`}>
          <h2 className={`text-xl font-bold mb-3 ${getThemeClass('text-purple-600', 'text-purple-300')}`}>Palabras usadas:</h2>
          {words.length > 0 ? (
            <ul className="list-none pl-0">
              {words.map((word, index) => (
                <li key={index} className={`${index % 2 === 0 ? getThemeClass('text-blue-600', 'text-blue-300') : getThemeClass('text-green-600', 'text-green-300')} text-base font-semibold mb-2 animate-bounce`}>
                  {index % 2 === 0 ? playerEmojis.player1 : playerEmojis.player2} {word}
                </li>
              ))}
            </ul>
          ) : (
            <p className={`${getThemeClass('text-gray-500', 'text-gray-400')} italic text-sm`}>Aún no se han usado palabras.</p>
          )}
        </div>
      </div>
      {!winner && gameState === 'playing' && (
        <p className={`mt-4 font-bold text-xl text-center text-white ${getThemeClass('bg-purple-600', 'bg-purple-800')} rounded-full py-2`}>
          Turno de: {turn === 'player1' ? `Jugador 1 ${playerEmojis.player1}` : `Jugador 2 ${playerEmojis.player2}`}
        </p>
      )}
      <footer className="mt-8 text-center text-white text-sm">
        <p>&copy; {new Date().getFullYear()} Juego de Cadena de Palabras. Todos los derechos reservados.</p>
      </footer>
      <style jsx>{`
        @keyframes bounce {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
};

export default WordChainGame;