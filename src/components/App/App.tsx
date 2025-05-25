import { useEffect, useState } from "react";
import fetchMovies from "../../services/movieService";
import SearchBar from "../SearchBar/SearchBar";
import type { Movie } from "../../types/movie";
import MovieGrid from "../MovieGrid/MovieGrid";
import Loader from "../Loader/Loader";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import toast, { Toaster } from "react-hot-toast";
import MovieModal from "../MovieModal/MovieModal";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import ReactPaginate from "react-paginate";
import css from "./App.module.css";

function App() {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [movie, setMovie] = useState<Movie | null>(null);
  const [page, setPage] = useState<number>(1);

  const { data, isPending, isError, isSuccess } = useQuery({
    queryKey: ["myQueryKey", searchQuery, page],
    queryFn: () => fetchMovies(searchQuery, page),
    enabled: searchQuery.trim() !== "",
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (isSuccess && data.data?.length === 0) {
      toast.error("No movies found for your request.");
    }
  }, [isSuccess, data?.data]);

  const movies = Array.isArray(data?.data) ? data.data : [];
  const totalPages = data?.totalPages || 0;
  const hasMovies = isSuccess && movies.length > 0;

  const closeModal = () => {
    setMovie(null);
  };

  const handleSelectMovie = (movie: Movie) => {
    setMovie(movie);
  };

  const handleSearchSubmit = (search: string) => {
    setSearchQuery(search);
    setPage(1);
  };

  const handlePageChange = ({ selected }: { selected: number }) => {
    setPage(selected + 1);
  };
  return (
    <>
      <SearchBar onSubmit={handleSearchSubmit} />

      {isPending && <Loader />}

      {!isPending && isError && <ErrorMessage />}

      {hasMovies && (
        <ReactPaginate
          pageCount={totalPages}
          pageRangeDisplayed={5}
          marginPagesDisplayed={1}
          onPageChange={handlePageChange}
          forcePage={page - 1}
          containerClassName={css.pagination}
          activeClassName={css.active}
          nextLabel="→"
          previousLabel="←"
        />
      )}
      {hasMovies && <MovieGrid onSelect={handleSelectMovie} movies={movies} />}

      {movie && <MovieModal movie={movie} onClose={closeModal} />}
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}

export default App;
