import { useEffect, useState } from "react";
import fetchMovies from "../../services/movieService";
import SearchBar from "../SearchBar/SearchBar";
import type { Movie } from "../../types/movie";
import MovieGrid from "../MovieGrid/MovieGrid";
import Loader from "../Loader/Loader";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import toast, { Toaster } from "react-hot-toast";
import MovieModal from "../MovieModal/MovieModal";
import { useQuery } from "@tanstack/react-query";
import ReactPaginate from "react-paginate";
import css from "./App.module.css";

function App() {
  const [searchQuery, setSearchQury] = useState<string>("");
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [page, setPage] = useState<number>(1);

  const { data, isLoading, isError, isSuccess } = useQuery({
    queryKey: ["myQueryKey", searchQuery, page],
    queryFn: () => fetchMovies(searchQuery, page),
    enabled: searchQuery.trim() !== "",
  });

  useEffect(() => {
    if (isSuccess && data.data?.length === 0) {
      toast.error("No movies found for your request.");
    }
  }, [isSuccess, data]);

  const movies = Array.isArray(data?.data) ? data.data : [];
  const totalPages = data?.totalPages || 0;
  const hasMovies = isSuccess && movies.length > 0;

  const openModal = () => setIsOpenModal(true);

  const closeModal = () => {
    setIsOpenModal(false);
    setMovie(null);
  };

  const handleSelectMovie = (movie: Movie) => {
    openModal();

    setMovie(movie);
  };

  return (
    <>
      <SearchBar onSubmit={setSearchQury} />

      {isLoading && <Loader />}

      {!isLoading && isError && <ErrorMessage />}

      {hasMovies && (
        <ReactPaginate
          pageCount={totalPages}
          pageRangeDisplayed={5}
          marginPagesDisplayed={1}
          onPageChange={({ selected }) => setPage(selected + 1)}
          forcePage={page - 1}
          containerClassName={css.pagination}
          activeClassName={css.active}
          nextLabel="→"
          previousLabel="←"
        />
      )}
      {hasMovies && <MovieGrid onSelect={handleSelectMovie} movies={movies} />}

      {isOpenModal && movie && (
        <MovieModal movie={movie} onClose={closeModal} />
      )}
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}

export default App;
