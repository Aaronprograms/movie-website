import { useEffect, useState } from 'react'
import './App.css'
import Search from "./components/Search.jsx";
import MovieCard from "./components/MovieCard.jsx";
import Spinner from "./components/Spinner.jsx";
import { useDebounce } from 'react-use';
import { updateSearchCount } from './appwrite.js';

const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`
    }
}

// API - Application Programming Interface - a set of rules
// that allows one software application to talk to another

const App = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [errorMessage, setErrorMessage] = useState('');
    const [movieList, setMovieList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

    // Debounce the search term to prevent making too many API requests
    useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])

    const fetchMovies = async (query='') => {
        setIsLoading(false);
        setErrorMessage('');
        try {
            const endpoint = query
                ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
                :`${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

            const response = await fetch(endpoint, API_OPTIONS);

            if(!response.ok) {
                throw new Error('Failed to fetch movies');
            }

            const data = await response.json();

            if(data.Response == 'False') {
                setErrorMessage(data.Error || 'Failed to fetch movies')
                setMovieList([]);
                return;
            }

            setMovieList(data.results || []);

            if(query && data.results.length > 0 ) {
                updateSearchCount(query, data.results[0]);
            }
        } catch (error) {
            console.error(`Error fetching movies: ${error}`)
            setErrorMessage('Error fetching movies. Please try again later.');
        } finally {
            setIsLoading(false);
        }

    }

    useEffect(() => {
        fetchMovies(debouncedSearchTerm);
    }, [debouncedSearchTerm])

    return (
        <main>
            <div className="pattern" />

            <div className="wrapper">
                <header>
                    <img src="./hero.png" alt="Hero Banner"/>
                    <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy
                        Without the Hassle</h1>

                    <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
                </header>

                <section className="all-movies">
                    <h2 className="mt-[20px]">Popular</h2>

                    {isLoading ? (
                        <Spinner />
                    ): errorMessage ? (
                        <p className="text-red-500">{errorMessage}</p>
                    ) : (
                        <ul>
                            {movieList.map((movie) => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </ul>
                    )}
                </section>

            </div>
        </main>
    )
}

export default App
